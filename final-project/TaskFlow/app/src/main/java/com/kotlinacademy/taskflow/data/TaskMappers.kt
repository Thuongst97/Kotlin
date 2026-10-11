package com.kotlinacademy.taskflow.data

import com.kotlinacademy.taskflow.data.local.TaskEntity
import com.kotlinacademy.taskflow.data.remote.TodoDto
import com.kotlinacademy.taskflow.domain.Priority
import com.kotlinacademy.taskflow.domain.Task

/* Mapping functions keep each layer's model independent: the UI never sees Room or JSON types. */

fun TaskEntity.toDomain(): Task = Task(
    id = id,
    title = title,
    notes = notes,
    priority = Priority.fromWeight(priority),
    dueAt = dueAt,
    remind = remind,
    isDone = isDone,
    createdAt = createdAt,
)

fun Task.toEntity(): TaskEntity = TaskEntity(
    id = id,
    title = title.trim(),
    notes = notes.trim(),
    priority = priority.weight,
    dueAt = dueAt,
    remind = remind && dueAt != null,
    isDone = isDone,
    createdAt = createdAt,
)

fun TodoDto.toEntity(now: Long): TaskEntity = TaskEntity(
    title = todo.trim().replaceFirstChar { it.uppercase() },
    notes = "Imported from dummyjson.com",
    priority = Priority.MEDIUM.weight,
    dueAt = null,
    remind = false,
    isDone = completed,
    createdAt = now,
    remoteId = id,
)
