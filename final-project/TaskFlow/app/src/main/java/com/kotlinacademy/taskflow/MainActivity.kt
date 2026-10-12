package com.kotlinacademy.taskflow

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.kotlinacademy.taskflow.ui.TaskFlowRoot
import dagger.hilt.android.AndroidEntryPoint

/**
 * The app's only Activity: it just hosts Compose.
 * Screens are composables + navigation destinations.
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { TaskFlowRoot() }
    }
}
