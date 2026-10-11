package com.kotlinacademy.taskflow.data

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.kotlinacademy.taskflow.data.local.TaskDao
import com.kotlinacademy.taskflow.data.local.TaskDatabase
import com.kotlinacademy.taskflow.data.local.TaskEntity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/** Runs on a device/emulator against a real (in-memory) SQLite database: ./gradlew connectedDebugAndroidTest */
@RunWith(AndroidJUnit4::class)
class TaskDaoTest {

    private lateinit var database: TaskDatabase
    private lateinit var dao: TaskDao

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, TaskDatabase::class.java).build()
        dao = database.taskDao()
    }

    @After
    fun closeDb() = database.close()

    private fun entity(title: String, createdAt: Long = 0) = TaskEntity(
        title = title, notes = "", priority = 1, dueAt = null, remind = false, isDone = false, createdAt = createdAt,
    )

    @Test
    fun upsertInsertsThenUpdates() = runTest {
        val id = dao.upsert(entity("Draft"))
        val updatedRowId = dao.upsert(entity("Final").copy(id = id))

        assertEquals(-1L, updatedRowId)                         // update → -1
        assertEquals("Final", dao.getById(id)?.title)
    }

    @Test
    fun observeAllEmitsNewestFirst() = runTest {
        dao.upsert(entity("old", createdAt = 1))
        dao.upsert(entity("new", createdAt = 2))

        assertEquals(listOf("new", "old"), dao.observeAll().first().map { it.title })
    }

    @Test
    fun setDoneAndDelete() = runTest {
        val id = dao.upsert(entity("Task"))
        dao.setDone(id, true)
        assertTrue(dao.getById(id)!!.isDone)

        dao.deleteById(id)
        assertNull(dao.getById(id))
    }
}
