package com.kotlinacademy.taskflow.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

@Dao
interface TaskDao {

    /** Emits a new list every time the table changes. Room runs the query off the main thread. */
    @Query("SELECT * FROM tasks ORDER BY created_at DESC")
    fun observeAll(): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE id = :id")
    suspend fun getById(id: Long): TaskEntity?

    /** Inserts or updates. Returns the new row id, or -1 when an existing row was updated. */
    @Upsert
    suspend fun upsert(task: TaskEntity): Long

    @Query("UPDATE tasks SET is_done = :done WHERE id = :id")
    suspend fun setDone(id: Long, done: Boolean)

    @Query("DELETE FROM tasks WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(tasks: List<TaskEntity>): List<Long>

    @Query("SELECT remote_id FROM tasks WHERE remote_id IS NOT NULL")
    suspend fun importedRemoteIds(): List<Int>
}
