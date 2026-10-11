package com.kotlinacademy.taskflow.data

import com.kotlinacademy.taskflow.data.remote.TodoDto
import com.kotlinacademy.taskflow.domain.Priority
import com.kotlinacademy.taskflow.domain.Task
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TaskMappersTest {

    @Test
    fun `domain to entity and back keeps every field`() {
        val task = Task(id = 7, title = "Ship it", notes = "v1", priority = Priority.HIGH, dueAt = 123, remind = true, isDone = false, createdAt = 99)
        assertEquals(task, task.toEntity().toDomain())
    }

    @Test
    fun `entity trims text and drops reminders without a due date`() {
        val entity = Task(title = "  padded  ", notes = " n ", remind = true, dueAt = null).toEntity()
        assertEquals("padded", entity.title)
        assertEquals("n", entity.notes)
        assertFalse(entity.remind)
    }

    @Test
    fun `imported todos are capitalised and remember their remote id`() {
        val entity = TodoDto(id = 5, todo = "walk the dog", completed = true).toEntity(now = 1_000)
        assertEquals("Walk the dog", entity.title)
        assertEquals(5, entity.remoteId)
        assertTrue(entity.isDone)
    }
}
