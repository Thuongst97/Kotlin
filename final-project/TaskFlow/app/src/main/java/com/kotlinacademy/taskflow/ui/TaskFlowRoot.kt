package com.kotlinacademy.taskflow.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.kotlinacademy.taskflow.ui.navigation.TaskFlowNavHost
import com.kotlinacademy.taskflow.ui.theme.TaskFlowTheme

/** Applies the user's theme settings around the whole navigation graph. */
@Composable
fun TaskFlowRoot(viewModel: MainViewModel = hiltViewModel()) {
    val settings by viewModel.settings.collectAsStateWithLifecycle()
    TaskFlowTheme(themeMode = settings.themeMode, dynamicColor = settings.dynamicColor) {
        TaskFlowNavHost()
    }
}
