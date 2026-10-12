package com.kotlinacademy.taskflow.ui.edit

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.kotlinacademy.taskflow.data.TaskRepository
import com.kotlinacademy.taskflow.domain.Priority
import com.kotlinacademy.taskflow.domain.Task
import com.kotlinacademy.taskflow.ui.navigation.EditTaskRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class EditTaskUiState(
    val isNew: Boolean = true,
    val isLoading: Boolean = false,
    val title: String = "",
    val notes: String = "",
    val priority: Priority = Priority.MEDIUM,
    val dueAt: Long? = null,
    val remind: Boolean = false,
    val showTitleError: Boolean = false,
    /** Becomes true after a successful save; the screen then navigates back. */
    val isSaved: Boolean = false,
)

@HiltViewModel
class EditTaskViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: TaskRepository,
) : ViewModel() {

    private val taskId: Long = savedStateHandle.toRoute<EditTaskRoute>().taskId
    private var original: Task? = null

    private val _state = MutableStateFlow(EditTaskUiState(isNew = taskId == EditTaskRoute.NEW_TASK))
    val state: StateFlow<EditTaskUiState> = _state.asStateFlow()

    init {
        if (taskId != EditTaskRoute.NEW_TASK) load(taskId)
    }

    private fun load(id: Long) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            val task = repository.getTask(id)
            original = task
            _state.update { s ->
                if (task == null) {
                    s.copy(isLoading = false, isNew = true)
                } else {
                    s.copy(
                        isLoading = false,
                        title = task.title,
                        notes = task.notes,
                        priority = task.priority,
                        dueAt = task.dueAt,
                        remind = task.remind,
                    )
                }
            }
        }
    }

    fun onTitleChange(value: String) = _state.update {
        it.copy(title = value, showTitleError = false)
    }
    fun onNotesChange(value: String) = _state.update { it.copy(notes = value) }
    fun onPriorityChange(value: Priority) = _state.update { it.copy(priority = value) }
    fun onDueDateChange(value: Long?) = _state.update {
        it.copy(
            dueAt = value,
            remind =
                it.remind && value != null,
        )
    }
    fun onRemindChange(value: Boolean) =
        _state.update { it.copy(remind = value && it.dueAt != null) }

    fun save() {
        val s = _state.value
        if (s.title.isBlank()) {
            _state.update { it.copy(showTitleError = true) }
            return
        }
        viewModelScope.launch {
            val base = original ?: Task(title = s.title)
            repository.upsert(
                base.copy(
                    title = s.title,
                    notes = s.notes,
                    priority = s.priority,
                    dueAt = s.dueAt,
                    remind = s.remind,
                ),
            )
            _state.update { it.copy(isSaved = true) }
        }
    }
}
