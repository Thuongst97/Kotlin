package com.kotlinacademy.taskflow.testing

import com.kotlinacademy.taskflow.data.TaskRepository
import com.kotlinacademy.taskflow.data.settings.SettingsRepository
import com.kotlinacademy.taskflow.domain.SortOrder
import com.kotlinacademy.taskflow.domain.Task
import com.kotlinacademy.taskflow.domain.ThemeMode
import com.kotlinacademy.taskflow.domain.UserSettings
import java.io.IOException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update

/** An in-memory repository: fast, deterministic, and no mocking library needed. */
class FakeTaskRepository(initial: List<Task> = emptyList()) : TaskRepository {
    private val tasks = MutableStateFlow(initial)
    private var nextId = (initial.maxOfOrNull { it.id } ?: 0) + 1
    var importResult: Result<Int> = Result.success(3)

    val current: List<Task> get() = tasks.value

    override fun observeTasks(): Flow<List<Task>> = tasks
    override suspend fun getTask(id: Long): Task? = tasks.value.find { it.id == id }

    override suspend fun upsert(task: Task): Long {
        val id = if (task.id == 0L) nextId++ else task.id
        tasks.update { list -> list.filterNot { it.id == id } + task.copy(id = id) }
        return id
    }

    override suspend fun setDone(id: Long, done: Boolean) =
        tasks.update { list -> list.map { if (it.id == id) it.copy(isDone = done) else it } }

    override suspend fun delete(id: Long) = tasks.update { list -> list.filterNot { it.id == id } }

    override suspend fun importSampleTasks(): Result<Int> = importResult

    fun failImports() {
        importResult = Result.failure(IOException("offline"))
    }
}

class FakeSettingsRepository(initial: UserSettings = UserSettings()) : SettingsRepository {
    private val state = MutableStateFlow(initial)
    override val settings: Flow<UserSettings> = state
    override suspend fun setThemeMode(mode: ThemeMode) = state.update { it.copy(themeMode = mode) }
    override suspend fun setDynamicColor(enabled: Boolean) =
        state.update { it.copy(dynamicColor = enabled) }
    override suspend fun setSortOrder(order: SortOrder) =
        state.update { it.copy(sortOrder = order) }
}
