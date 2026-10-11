package com.kotlinacademy.taskflow.ui

import androidx.compose.material3.SnackbarHostState
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.kotlinacademy.taskflow.domain.Task
import com.kotlinacademy.taskflow.ui.tasks.TasksContent
import com.kotlinacademy.taskflow.ui.tasks.TasksUiState
import com.kotlinacademy.taskflow.ui.theme.TaskFlowTheme
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

/** UI test of the stateless content composable: give it state, assert what's on screen, click things. */
class TasksContentTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun showsTasksAndReportsClicks() {
        var toggled: Task? = null
        var added = false
        val task = Task(id = 1, title = "Write UI tests")

        composeRule.setContent {
            TaskFlowTheme(dynamicColor = false) {
                TasksContent(
                    state = TasksUiState(isLoading = false, tasks = listOf(task), totalCount = 1, activeCount = 1),
                    snackbarHostState = SnackbarHostState(),
                    onQueryChange = {}, onFilterChange = {}, onDelete = {}, onImport = {},
                    onToggleDone = { toggled = it },
                    onAddTask = { added = true },
                    onOpenTask = {}, onOpenSettings = {},
                )
            }
        }

        composeRule.onNodeWithText("Write UI tests").assertIsDisplayed()
        composeRule.onNodeWithContentDescription("Toggle Write UI tests").performClick()
        composeRule.onNodeWithContentDescription("Add task").performClick()

        assertEquals(task, toggled)
        assertEquals(true, added)
    }

    @Test
    fun showsEmptyState() {
        composeRule.setContent {
            TaskFlowTheme(dynamicColor = false) {
                TasksContent(
                    state = TasksUiState(isLoading = false),
                    snackbarHostState = SnackbarHostState(),
                    onQueryChange = {}, onFilterChange = {}, onToggleDone = {}, onDelete = {}, onImport = {},
                    onAddTask = {}, onOpenTask = {}, onOpenSettings = {},
                )
            }
        }
        composeRule.onNodeWithText("Nothing to do… yet").assertIsDisplayed()
    }
}
