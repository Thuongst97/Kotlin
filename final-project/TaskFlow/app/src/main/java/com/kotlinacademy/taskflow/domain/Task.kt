package com.kotlinacademy.taskflow.domain

/**
 * A task as the rest of the app sees it — independent of how it is stored (Room) or
 * transferred (network DTOs). Immutable: "changing" a task means creating a copy.
 */
data class Task(
    val id: Long = 0,
    val title: String,
    val notes: String = "",
    val priority: Priority = Priority.MEDIUM,
    /** Due date as epoch milliseconds (start of the day in the user's time zone), or null. */
    val dueAt: Long? = null,
    val remind: Boolean = false,
    val isDone: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
) {
    fun isOverdue(now: Long): Boolean = !isDone && dueAt != null && dueAt < startOfToday(now)
}

enum class Priority(val weight: Int) {
    LOW(0),
    MEDIUM(1),
    HIGH(2),
    ;

    companion object {
        fun fromWeight(weight: Int): Priority =
            entries.firstOrNull { it.weight == weight } ?: MEDIUM
    }
}

/** Which tasks the list shows. */
enum class TaskFilter {
    ALL,
    ACTIVE,
    DONE,
    ;

    fun matches(task: Task): Boolean = when (this) {
        ALL -> true
        ACTIVE -> !task.isDone
        DONE -> task.isDone
    }
}

/** User-selectable ordering. Unfinished tasks always come before finished ones. */
enum class SortOrder(val comparator: Comparator<Task>) {
    DUE_DATE(
        compareBy<Task> { it.isDone }
            .thenBy(nullsLast(naturalOrder())) { it.dueAt }
            .thenByDescending { it.priority.weight },
    ),
    PRIORITY(
        compareBy<Task> { it.isDone }
            .thenByDescending { it.priority.weight }
            .thenBy(nullsLast(naturalOrder())) { it.dueAt },
    ),
    CREATED(
        compareBy<Task> { it.isDone }
            .thenByDescending { it.createdAt },
    ),
}

private const val DAY_MS = 24 * 60 * 60 * 1000L

/**
 * Start of the current day in UTC. Due dates are stored as UTC midnight, which is exactly what
 * the Material 3 DatePicker reports, so comparing against this boundary is consistent.
 */
fun startOfToday(now: Long): Long = now - Math.floorMod(now, DAY_MS)
