package com.kotlinacademy.taskflow.ui.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kotlinacademy.taskflow.data.TaskRepository
import com.kotlinacademy.taskflow.data.settings.SettingsRepository
import com.kotlinacademy.taskflow.domain.Task
import com.kotlinacademy.taskflow.domain.TaskFilter
import com.kotlinacademy.taskflow.ui.WhileUiSubscribed
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/** Everything the task list screen needs to draw itself — one immutable snapshot. */
data class TasksUiState(
    val isLoading: Boolean = true,
    val tasks: List<Task> = emptyList(),
    val filter: TaskFilter = TaskFilter.ALL,
    val query: String = "",
    val totalCount: Int = 0,
    val activeCount: Int = 0,
    val doneCount: Int = 0,
    val isImporting: Boolean = false,
)

/** One-off events (shown once, not part of the state). */
sealed interface TasksEvent {
    data class TaskDeleted(val task: Task) : TasksEvent
    data class Imported(val count: Int) : TasksEvent
    data object ImportFailed : TasksEvent
}

@HiltViewModel
class TasksViewModel @Inject constructor(
    private val repository: TaskRepository,
    settingsRepository: SettingsRepository,
) : ViewModel() {

    private val filter = MutableStateFlow(TaskFilter.ALL)
    private val query = MutableStateFlow("")
    private val isImporting = MutableStateFlow(false)

    private val _events = Channel<TasksEvent>(Channel.BUFFERED)
    val events: Flow<TasksEvent> = _events.receiveAsFlow()

    /**
     * Unidirectional data flow: inputs (database, settings, filter, query) are combined into a
     * single UI state. The screen only renders it and sends user actions back as function calls.
     */
    val uiState: StateFlow<TasksUiState> = combine(
        repository.observeTasks(),
        settingsRepository.settings,
        filter,
        query,
        isImporting,
    ) { tasks, settings, filter, query, importing ->
        val visible = tasks
            .filter(filter::matches)
            .filter {
                query.isBlank() || it.title.contains(query, ignoreCase = true) ||
                    it.notes.contains(query, ignoreCase = true)
            }
            .sortedWith(settings.sortOrder.comparator)
        TasksUiState(
            isLoading = false,
            tasks = visible,
            filter = filter,
            query = query,
            totalCount = tasks.size,
            activeCount = tasks.count { !it.isDone },
            doneCount = tasks.count { it.isDone },
            isImporting = importing,
        )
    }.stateIn(viewModelScope, WhileUiSubscribed, TasksUiState())

    fun setFilter(newFilter: TaskFilter) {
        filter.value = newFilter
    }

    fun setQuery(text: String) {
        query.value = text
    }

    fun toggleDone(task: Task) {
        viewModelScope.launch { repository.setDone(task.id, !task.isDone) }
    }

    fun delete(task: Task) {
        viewModelScope.launch {
            repository.delete(task.id)
            _events.send(TasksEvent.TaskDeleted(task))
        }
    }

    /** Re-inserts a deleted task with its original id, so Undo restores it exactly. */
    fun undoDelete(task: Task) {
        viewModelScope.launch { repository.upsert(task) }
    }

    fun importSamples() {
        if (isImporting.value) return
        viewModelScope.launch {
            isImporting.value = true
            val result = repository.importSampleTasks()
            isImporting.value = false
            _events.send(result.fold({ TasksEvent.Imported(it) }, { TasksEvent.ImportFailed }))
        }
    }
}
