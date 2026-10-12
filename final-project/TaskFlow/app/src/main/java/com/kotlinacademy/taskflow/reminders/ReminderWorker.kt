package com.kotlinacademy.taskflow.reminders

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.kotlinacademy.taskflow.data.TaskRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

/**
 * Runs in the background at the scheduled time and shows a notification
 * if the task is still open.
 */
@HiltWorker
class ReminderWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted params: WorkerParameters,
    private val repository: TaskRepository,
    private val notifier: ReminderNotifier,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val id = inputData.getLong(KEY_TASK_ID, -1L)
        val task = repository.getTask(id)
        if (task == null || task.isDone || !task.remind) return Result.success()
        notifier.show(task.id, task.title)
        return Result.success()
    }

    companion object {
        const val KEY_TASK_ID = "task_id"
        const val KEY_TITLE = "title"
    }
}
