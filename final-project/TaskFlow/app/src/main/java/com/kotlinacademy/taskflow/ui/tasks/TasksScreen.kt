package com.kotlinacademy.taskflow.ui.tasks

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.kotlinacademy.taskflow.R
import com.kotlinacademy.taskflow.domain.Priority
import com.kotlinacademy.taskflow.domain.Task
import com.kotlinacademy.taskflow.domain.TaskFilter
import com.kotlinacademy.taskflow.ui.theme.TaskFlowTheme

/**
 * Stateful entry point: gets the ViewModel, collects state and events, and passes plain values
 * and callbacks down to the stateless [TasksContent].
 */
@Composable
fun TasksScreen(
    onAddTask: () -> Unit,
    onOpenTask: (Long) -> Unit,
    onOpenSettings: () -> Unit,
    viewModel: TasksViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val context = LocalContext.current

    // Collect one-off events while this screen is on screen.
    LaunchedEffect(viewModel) {
        viewModel.events.collect { event ->
            when (event) {
                is TasksEvent.TaskDeleted -> {
                    val result = snackbarHostState.showSnackbar(
                        message = context.getString(R.string.task_deleted),
                        actionLabel = context.getString(R.string.undo),
                        duration = SnackbarDuration.Short,
                    )
                    if (result == SnackbarResult.ActionPerformed) viewModel.undoDelete(event.task)
                }
                is TasksEvent.Imported ->
                    snackbarHostState.showSnackbar(context.getString(R.string.imported_count, event.count))
                TasksEvent.ImportFailed ->
                    snackbarHostState.showSnackbar(context.getString(R.string.import_failed))
            }
        }
    }

    TasksContent(
        state = state,
        snackbarHostState = snackbarHostState,
        onQueryChange = viewModel::setQuery,
        onFilterChange = viewModel::setFilter,
        onToggleDone = viewModel::toggleDone,
        onDelete = viewModel::delete,
        onImport = viewModel::importSamples,
        onAddTask = onAddTask,
        onOpenTask = onOpenTask,
        onOpenSettings = onOpenSettings,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksContent(
    state: TasksUiState,
    snackbarHostState: SnackbarHostState,
    onQueryChange: (String) -> Unit,
    onFilterChange: (TaskFilter) -> Unit,
    onToggleDone: (Task) -> Unit,
    onDelete: (Task) -> Unit,
    onImport: () -> Unit,
    onAddTask: () -> Unit,
    onOpenTask: (Long) -> Unit,
    onOpenSettings: () -> Unit,
    now: Long = System.currentTimeMillis(),
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.tasks_title)) },
                actions = {
                    if (state.isImporting) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                    } else {
                        IconButton(onClick = onImport) {
                            Icon(Icons.Filled.Refresh, contentDescription = stringResource(R.string.import_samples))
                        }
                    }
                    IconButton(onClick = onOpenSettings) {
                        Icon(Icons.Filled.Settings, contentDescription = stringResource(R.string.settings))
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddTask) {
                Icon(Icons.Filled.Add, contentDescription = stringResource(R.string.add_task))
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
        ) {
            SearchField(query = state.query, onQueryChange = onQueryChange)
            FilterRow(state = state, onFilterChange = onFilterChange)
            if (state.totalCount > 0) ProgressSummary(done = state.doneCount, total = state.totalCount)

            when {
                state.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                state.tasks.isEmpty() -> EmptyState(query = state.query)
                else -> LazyColumn(
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    // A stable key lets Compose keep each row's state and animate changes correctly.
                    items(state.tasks, key = { it.id }) { task ->
                        TaskItem(
                            task = task,
                            now = now,
                            onToggleDone = { onToggleDone(task) },
                            onClick = { onOpenTask(task.id) },
                            onDelete = { onDelete(task) },
                            modifier = Modifier.animateItem(),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SearchField(query: String, onQueryChange: (String) -> Unit) {
    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        placeholder = { Text(stringResource(R.string.search_tasks)) },
        leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
        trailingIcon = {
            if (query.isNotEmpty()) {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(Icons.Filled.Clear, contentDescription = stringResource(R.string.clear_search))
                }
            }
        },
        singleLine = true,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterRow(state: TasksUiState, onFilterChange: (TaskFilter) -> Unit) {
    Row(
        modifier = Modifier.padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        TaskFilter.entries.forEach { filter ->
            val label = when (filter) {
                TaskFilter.ALL -> stringResource(R.string.filter_all, state.totalCount)
                TaskFilter.ACTIVE -> stringResource(R.string.filter_active, state.activeCount)
                TaskFilter.DONE -> stringResource(R.string.filter_done, state.doneCount)
            }
            FilterChip(
                selected = state.filter == filter,
                onClick = { onFilterChange(filter) },
                label = { Text(label) },
            )
        }
    }
}

@Composable
private fun ProgressSummary(done: Int, total: Int) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
        LinearProgressIndicator(
            progress = { done.toFloat() / total },
            modifier = Modifier.fillMaxWidth(),
        )
        Text(
            text = stringResource(R.string.progress_summary, done, total),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp),
        )
    }
}

@Composable
private fun EmptyState(query: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("📝", style = MaterialTheme.typography.displayMedium)
        Spacer(Modifier.height(12.dp))
        if (query.isNotBlank()) {
            Text(stringResource(R.string.empty_search, query), style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
        } else {
            Text(stringResource(R.string.empty_title), style = MaterialTheme.typography.titleMedium)
            Text(
                stringResource(R.string.empty_body),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun TasksContentPreview() {
    val tasks = listOf(
        Task(id = 1, title = "Set up Android Studio", isDone = true),
        Task(id = 2, title = "Learn coroutines", notes = "Lesson 13", priority = Priority.HIGH),
        Task(id = 3, title = "Build TaskFlow", priority = Priority.MEDIUM),
    )
    TaskFlowTheme(dynamicColor = false) {
        TasksContent(
            state = TasksUiState(isLoading = false, tasks = tasks, totalCount = 3, activeCount = 2, doneCount = 1),
            snackbarHostState = SnackbarHostState(),
            onQueryChange = {}, onFilterChange = {}, onToggleDone = {}, onDelete = {}, onImport = {},
            onAddTask = {}, onOpenTask = {}, onOpenSettings = {},
        )
    }
}
