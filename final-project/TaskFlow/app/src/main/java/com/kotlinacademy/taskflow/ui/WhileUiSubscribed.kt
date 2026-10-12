package com.kotlinacademy.taskflow.ui

import kotlinx.coroutines.flow.SharingStarted

/**
 * How long a ViewModel keeps its upstream Flows running after the UI stops collecting.
 * Five seconds outlives a configuration change (no restart on rotation) but stops work
 * soon after the app goes to the background.
 */
private const val STOP_TIMEOUT_MILLIS = 5_000L

/** The sharing policy used by every screen's `stateIn`. */
val WhileUiSubscribed: SharingStarted = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS)
