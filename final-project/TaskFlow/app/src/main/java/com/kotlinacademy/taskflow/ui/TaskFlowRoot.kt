package com.kotlinacademy.taskflow.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.kotlinacademy.taskflow.data.settings.SettingsRepository
import com.kotlinacademy.taskflow.domain.UserSettings
import com.kotlinacademy.taskflow.ui.navigation.TaskFlowNavHost
import com.kotlinacademy.taskflow.ui.theme.TaskFlowTheme
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(settingsRepository: SettingsRepository) : ViewModel() {
    val settings: StateFlow<UserSettings> = settingsRepository.settings
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UserSettings())
}

/** Applies the user's theme settings around the whole navigation graph. */
@Composable
fun TaskFlowRoot(viewModel: MainViewModel = hiltViewModel()) {
    val settings by viewModel.settings.collectAsStateWithLifecycle()
    TaskFlowTheme(themeMode = settings.themeMode, dynamicColor = settings.dynamicColor) {
        TaskFlowNavHost()
    }
}
