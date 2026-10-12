package com.kotlinacademy.taskflow.reminders

import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

interface ReminderScheduler {
    /** Schedules (or re-schedules) a reminder for 9:00 local time on the due date. */
    fun schedule(taskId: Long, title: String, dueAt: Long)
    fun cancel(taskId: Long)
}

/**
 * WorkManager guarantees the work runs even if the app is closed or the device restarts.
 * One unique work request per task: re-scheduling REPLACEs the previous one.
 */
@Singleton
class WorkManagerReminderScheduler @Inject constructor(private val workManager: WorkManager) :
    ReminderScheduler {

    override fun schedule(taskId: Long, title: String, dueAt: Long) {
        val remindAt = reminderTime(dueAt)
        val delay = remindAt - System.currentTimeMillis()
        if (delay <= 0) {
            cancel(taskId)
            return
        }
        val request = OneTimeWorkRequestBuilder<ReminderWorker>()
            .setInitialDelay(delay, TimeUnit.MILLISECONDS)
            .setInputData(
                workDataOf(
                    ReminderWorker.KEY_TASK_ID to taskId,
                    ReminderWorker.KEY_TITLE to title,
                ),
            )
            .addTag(TAG)
            .build()
        workManager.enqueueUniqueWork(workName(taskId), ExistingWorkPolicy.REPLACE, request)
    }

    override fun cancel(taskId: Long) {
        workManager.cancelUniqueWork(workName(taskId))
    }

    private fun workName(taskId: Long) = "reminder-$taskId"

    companion object {
        private const val TAG = "task-reminder"
        private val REMIND_AT: LocalTime = LocalTime.of(9, 0)

        /** [dueAt] is UTC midnight of the chosen date → 9:00 in the user's time zone that day. */
        fun reminderTime(dueAt: Long, zone: ZoneId = ZoneId.systemDefault()): Long =
            Instant.ofEpochMilli(dueAt).atZone(ZoneOffset.UTC).toLocalDate()
                .atTime(REMIND_AT).atZone(zone).toInstant().toEpochMilli()
    }
}
