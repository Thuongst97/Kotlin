package com.kotlinacademy.taskflow.ui.tasks

import app.cash.turbine.test
import com.kotlinacademy.taskflow.domain.Priority
import com.kotlinacademy.taskflow.domain.SortOrder
import com.kotlinacademy.taskflow.domain.Task
import com.kotlinacademy.taskflow.domain.TaskFilter
import com.kotlinacademy.taskflow.domain.UserSettings
import com.kotlinacademy.taskflow.testing.FakeSettingsRepository
import com.kotlinacademy.taskflow.testing.FakeTaskRepository
import com.kotlinacademy.taskflow.testing.MainDispatcherRule
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class TasksViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val sampleTasks = listOf(
        Task(id = 1, title = "Buy milk", isDone = true, createdAt = 1),
        Task(id = 2, title = "Learn Flow", priority = Priority.HIGH, createdAt = 2),
        Task(id = 3, title = "Write tests", notes = "for the ViewModel", priority = Priority.LOW, createdAt = 3),
    )

    private fun createViewModel(
        repository: FakeTaskRepository = FakeTaskRepository(sampleTasks),
        settings: FakeSettingsRepository = FakeSettingsRepository(UserSettings(sortOrder = SortOrder.PRIORITY)),
    ) = TasksViewModel(repository, settings)

    @Test
    fun `state contains counts and tasks sorted by priority, done last`() = runTest {
        val viewModel = createViewModel()
        // stateIn(WhileSubscribed) only runs while someone collects; start a collector eagerly.
        backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { viewModel.uiState.collect() }

        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertEquals(listOf("Learn Flow", "Write tests", "Buy milk"), state.tasks.map { it.title })
        assertEquals(3, state.totalCount)
        assertEquals(2, state.activeCount)
        assertEquals(1, state.doneCount)
    }

    @Test
    fun `filters by status and searches title and notes`() = runTest {
        val viewModel = createViewModel()
        backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { viewModel.uiState.collect() }

        viewModel.setFilter(TaskFilter.DONE)
        assertEquals(listOf("Buy milk"), viewModel.uiState.value.tasks.map { it.title })

        viewModel.setFilter(TaskFilter.ALL)
        viewModel.setQuery("viewmodel")                        // matches notes, case-insensitive
        assertEquals(listOf("Write tests"), viewModel.uiState.value.tasks.map { it.title })
    }

    @Test
    fun `toggleDone updates the repository and the state`() = runTest {
        val repository = FakeTaskRepository(sampleTasks)
        val viewModel = createViewModel(repository)
        backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) { viewModel.uiState.collect() }

        viewModel.toggleDone(sampleTasks[1])

        assertTrue(repository.current.first { it.id == 2L }.isDone)
        assertEquals(2, viewModel.uiState.value.doneCount)
    }

    @Test
    fun `delete emits an event and undo restores the task`() = runTest {
        val repository = FakeTaskRepository(sampleTasks)
        val viewModel = createViewModel(repository)

        viewModel.events.test {
            viewModel.delete(sampleTasks[0])
            val event = awaitItem() as TasksEvent.TaskDeleted
            assertEquals(2, repository.current.size)

            viewModel.undoDelete(event.task)
            assertEquals(3, repository.current.size)
            assertEquals("Buy milk", repository.current.first { it.id == 1L }.title)
        }
    }

    @Test
    fun `import reports success and failure as events`() = runTest {
        val repository = FakeTaskRepository(sampleTasks)
        val viewModel = createViewModel(repository)

        viewModel.events.test {
            viewModel.importSamples()
            assertEquals(TasksEvent.Imported(3), awaitItem())

            repository.failImports()
            viewModel.importSamples()
            assertEquals(TasksEvent.ImportFailed, awaitItem())
        }
        assertFalse(viewModel.uiState.value.isImporting)
    }
}
