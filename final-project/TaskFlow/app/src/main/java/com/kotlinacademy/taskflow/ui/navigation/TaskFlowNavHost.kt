package com.kotlinacademy.taskflow.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.kotlinacademy.taskflow.ui.edit.EditTaskScreen
import com.kotlinacademy.taskflow.ui.settings.SettingsScreen
import com.kotlinacademy.taskflow.ui.tasks.TasksScreen
import kotlinx.serialization.Serializable

/* Type-safe routes: each destination is a @Serializable type; arguments are its properties. */

@Serializable
data object TasksRoute

/** taskId == NEW_TASK opens an empty editor. */
@Serializable
data class EditTaskRoute(val taskId: Long = NEW_TASK) {
    companion object {
        const val NEW_TASK = -1L
    }
}

@Serializable
data object SettingsRoute

@Composable
fun TaskFlowNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = TasksRoute) {
        composable<TasksRoute> {
            TasksScreen(
                onAddTask = { navController.navigate(EditTaskRoute()) },
                onOpenTask = { id -> navController.navigate(EditTaskRoute(id)) },
                onOpenSettings = { navController.navigate(SettingsRoute) },
            )
        }
        composable<EditTaskRoute> {
            // EditTaskViewModel reads taskId from its SavedStateHandle.
            EditTaskScreen(onDone = { navController.popBackStack() })
        }
        composable<SettingsRoute> {
            SettingsScreen(onBack = { navController.popBackStack() })
        }
    }
}
