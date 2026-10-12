package com.kotlinacademy.taskflow.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TaskTest {

    private val day = 24 * 60 * 60 * 1000L
    private val today = 20_000 * day // some UTC midnight
    private val now = today + 10 * 60 * 60 * 1000L // 10:00 UTC

    @Test
    fun `a task due yesterday is overdue, one due today is not`() {
        assertTrue(Task(title = "x", dueAt = today - day).isOverdue(now))
        assertFalse(Task(title = "x", dueAt = today).isOverdue(now))
        assertFalse(Task(title = "x", dueAt = today - day, isDone = true).isOverdue(now))
        assertFalse(Task(title = "x", dueAt = null).isOverdue(now))
    }

    @Test
    fun `due-date order puts dated tasks first and done tasks last`() {
        val tasks = listOf(
            Task(id = 1, title = "no date"),
            Task(id = 2, title = "later", dueAt = today + day),
            Task(id = 3, title = "done", dueAt = today - day, isDone = true),
            Task(id = 4, title = "sooner", dueAt = today),
        )
        assertEquals(
            listOf(4L, 2L, 1L, 3L),
            tasks.sortedWith(SortOrder.DUE_DATE.comparator).map {
                it.id
            },
        )
    }

    @Test
    fun `filters match the right tasks`() {
        val open = Task(title = "open")
        val done = Task(title = "done", isDone = true)
        assertTrue(TaskFilter.ALL.matches(open) && TaskFilter.ALL.matches(done))
        assertTrue(TaskFilter.ACTIVE.matches(open) && !TaskFilter.ACTIVE.matches(done))
        assertTrue(TaskFilter.DONE.matches(done) && !TaskFilter.DONE.matches(open))
    }

    @Test
    fun `unknown priority weights fall back to medium`() {
        assertEquals(Priority.HIGH, Priority.fromWeight(2))
        assertEquals(Priority.MEDIUM, Priority.fromWeight(42))
    }
}
