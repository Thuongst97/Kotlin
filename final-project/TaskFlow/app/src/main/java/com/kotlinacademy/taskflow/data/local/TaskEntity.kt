package com.kotlinacademy.taskflow.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.kotlinacademy.taskflow.domain.Priority
import com.kotlinacademy.taskflow.domain.Task

/** One row of the `tasks` table. Kept separate from the domain [Task] model. */
@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val notes: String,
    /** Stored as [Priority.weight], so renaming enum constants is safe. */
    val priority: Int,
    @ColumnInfo(name = "due_at") val dueAt: Long?,
    val remind: Boolean,
    @ColumnInfo(name = "is_done") val isDone: Boolean,
    @ColumnInfo(name = "created_at") val createdAt: Long,
    /** Set for tasks imported from the sample API, so a second import doesn't duplicate them. */
    @ColumnInfo(name = "remote_id") val remoteId: Int? = null,
)
