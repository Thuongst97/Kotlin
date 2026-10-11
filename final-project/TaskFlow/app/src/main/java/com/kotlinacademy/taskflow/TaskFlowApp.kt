package com.kotlinacademy.taskflow

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.kotlinacademy.taskflow.reminders.ReminderNotifier
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

/**
 * @HiltAndroidApp triggers Hilt's code generation and creates the app-wide dependency container.
 * Implementing Configuration.Provider lets WorkManager create workers through Hilt.
 */
@HiltAndroidApp
class TaskFlowApp : Application(), Configuration.Provider {

    @Inject lateinit var workerFactory: HiltWorkerFactory
    @Inject lateinit var notifier: ReminderNotifier

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder().setWorkerFactory(workerFactory).build()

    override fun onCreate() {
        super.onCreate() // Hilt injects the fields above here
        notifier.createChannel()
    }
}
