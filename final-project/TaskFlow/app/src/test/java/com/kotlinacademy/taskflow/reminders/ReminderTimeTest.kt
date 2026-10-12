package com.kotlinacademy.taskflow.reminders

import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset
import org.junit.Assert.assertEquals
import org.junit.Test

class ReminderTimeTest {

    @Test
    fun `reminder fires at 9 local time on the picked date`() {
        val picked = LocalDate.of(2026, 3, 15)
        // What the Material 3 DatePicker returns: UTC midnight of the picked date.
        val dueAt = picked.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()
        val zone = ZoneId.of("Asia/Ho_Chi_Minh")

        val remindAt = WorkManagerReminderScheduler.reminderTime(dueAt, zone)

        assertEquals(picked.atTime(9, 0).atZone(zone).toInstant().toEpochMilli(), remindAt)
    }
}
