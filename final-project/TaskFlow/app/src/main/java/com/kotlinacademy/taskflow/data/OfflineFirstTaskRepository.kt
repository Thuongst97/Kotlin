package com.kotlinacademy.taskflow.data

import com.kotlinacademy.taskflow.data.local.TaskDao
import com.kotlinacademy.taskflow.data.remote.TodoApi
import com.kotlinacademy.taskflow.domain.Task
import com.kotlinacademy.taskflow.reminders.ReminderScheduler
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.SerializationException
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Offline-first: the Room database is the source of truth and the UI only ever observes it.
 * The network is used to add data to the database, never shown directly.
 */
@Singleton
class OfflineFirstTaskRepository @Inject constructor(
    private val dao: TaskDao,
    private val api: TodoApi,
    private val reminders: ReminderScheduler,
) : TaskRepository {

    override fun observeTasks(): Flow<List<Task>> =
        dao.observeAll().map { entities -> entities.map { it.toDomain() } }

    override suspend fun getTask(id: Long): Task? = dao.getById(id)?.toDomain()

    override suspend fun upsert(task: Task): Long {
        // Keep the remote id of imported tasks when they are edited.
        val existing = if (task.id != 0L) dao.getById(task.id) else null
        val rowId = dao.upsert(task.toEntity().copy(remoteId = existing?.remoteId))
        val id = if (rowId == -1L) task.id else rowId          // -1 means "updated an existing row"
        updateReminder(task.copy(id = id))
        return id
    }

    override suspend fun setDone(id: Long, done: Boolean) {
        dao.setDone(id, done)
        if (done) reminders.cancel(id) else getTask(id)?.let { updateReminder(it) }
    }

    override suspend fun delete(id: Long) {
        dao.deleteById(id)
        reminders.cancel(id)
    }

    override suspend fun importSampleTasks(): Result<Int> = try {
        val alreadyImported = dao.importedRemoteIds().toSet()
        val now = System.currentTimeMillis()
        val newTasks = api.getTodos(limit = 10).todos
            .filter { it.id !in alreadyImported }
            .mapIndexed { index, dto -> dto.toEntity(now - index) }   // keep the API's order
        dao.insertAll(newTasks)
        Result.success(newTasks.size)
    } catch (e: IOException) {               // no connection, timeout
        Result.failure(e)
    } catch (e: HttpException) {             // 4xx / 5xx response
        Result.failure(e)
    } catch (e: SerializationException) {    // unexpected JSON
        Result.failure(e)
    }
    // Note: we deliberately don't catch Exception — that would also swallow CancellationException.

    private fun updateReminder(task: Task) {
        val due = task.dueAt
        if (task.remind && due != null && !task.isDone) reminders.schedule(task.id, task.title, due)
        else reminders.cancel(task.id)
    }
}
