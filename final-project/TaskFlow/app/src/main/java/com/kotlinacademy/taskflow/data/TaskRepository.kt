package com.kotlinacademy.taskflow.data

import com.kotlinacademy.taskflow.domain.Task
import kotlinx.coroutines.flow.Flow

/**
 * The single source of truth for tasks. ViewModels depend on this interface, never on Room or
 * Retrofit directly — which is what makes them easy to unit test with a fake (see src/test).
 */
interface TaskRepository {
    fun observeTasks(): Flow<List<Task>>
    suspend fun getTask(id: Long): Task?

    /** Inserts a new task (id == 0) or updates an existing one. Returns the task's id. */
    suspend fun upsert(task: Task): Long
    suspend fun setDone(id: Long, done: Boolean)
    suspend fun delete(id: Long)

    /** Downloads sample tasks. Returns how many new tasks were added, or a failure. */
    suspend fun importSampleTasks(): Result<Int>
}
