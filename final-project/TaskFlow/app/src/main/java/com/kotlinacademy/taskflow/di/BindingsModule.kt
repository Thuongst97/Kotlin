package com.kotlinacademy.taskflow.di

import com.kotlinacademy.taskflow.data.OfflineFirstTaskRepository
import com.kotlinacademy.taskflow.data.TaskRepository
import com.kotlinacademy.taskflow.data.settings.DataStoreSettingsRepository
import com.kotlinacademy.taskflow.data.settings.SettingsRepository
import com.kotlinacademy.taskflow.reminders.ReminderScheduler
import com.kotlinacademy.taskflow.reminders.WorkManagerReminderScheduler
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Tells Hilt which implementation to use when someone asks for an interface. */
@Module
@InstallIn(SingletonComponent::class)
abstract class BindingsModule {

    @Binds
    abstract fun bindTaskRepository(impl: OfflineFirstTaskRepository): TaskRepository

    @Binds
    abstract fun bindSettingsRepository(impl: DataStoreSettingsRepository): SettingsRepository

    @Binds
    abstract fun bindReminderScheduler(impl: WorkManagerReminderScheduler): ReminderScheduler
}
