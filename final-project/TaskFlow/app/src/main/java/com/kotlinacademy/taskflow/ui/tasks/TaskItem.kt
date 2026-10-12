package com.kotlinacademy.taskflow.ui.tasks

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.kotlinacademy.taskflow.R
import com.kotlinacademy.taskflow.domain.Priority
import com.kotlinacademy.taskflow.domain.Task
import com.kotlinacademy.taskflow.ui.components.formatDueDate
import com.kotlinacademy.taskflow.ui.theme.PriorityHigh
import com.kotlinacademy.taskflow.ui.theme.PriorityLow
import com.kotlinacademy.taskflow.ui.theme.PriorityMedium
import com.kotlinacademy.taskflow.ui.theme.TaskFlowTheme

fun Priority.color(): Color = when (this) {
    Priority.LOW -> PriorityLow
    Priority.MEDIUM -> PriorityMedium
    Priority.HIGH -> PriorityHigh
}

/** A stateless row: it receives data and reports clicks. Easy to preview, test and reuse. */
@Composable
fun TaskItem(
    task: Task,
    now: Long,
    onToggleDone: () -> Unit,
    onClick: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(modifier = modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(
            modifier = Modifier.padding(start = 4.dp, end = 4.dp, top = 8.dp, bottom = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Checkbox(
                checked = task.isDone,
                onCheckedChange = { onToggleDone() },
                modifier = Modifier.semantics { contentDescription = "Toggle ${task.title}" },
            )
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Spacer(
                        Modifier
                            .size(8.dp)
                            .background(task.priority.color(), CircleShape),
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = task.title,
                        style = MaterialTheme.typography.titleMedium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        textDecoration = if (task.isDone) TextDecoration.LineThrough else null,
                        color = if (task.isDone) {
                            MaterialTheme.colorScheme.onSurfaceVariant
                        } else {
                            MaterialTheme.colorScheme.onSurface
                        },
                    )
                }
                if (task.notes.isNotBlank()) {
                    Text(
                        text = task.notes,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(start = 16.dp),
                    )
                }
                task.dueAt?.let { due ->
                    Spacer(Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.padding(start = 16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        val overdue = task.isOverdue(now)
                        val colors = MaterialTheme.colorScheme
                        val tint = if (overdue) colors.error else colors.primary
                        Icon(
                            Icons.Filled.DateRange,
                            contentDescription = null,
                            tint = tint,
                            modifier = Modifier.size(16.dp),
                        )
                        Text(
                            text = if (overdue) {
                                stringResource(R.string.overdue) + " · " +
                                    formatDueDate(due)
                            } else {
                                stringResource(R.string.due_on, formatDueDate(due))
                            },
                            style = MaterialTheme.typography.labelMedium,
                            color = tint,
                        )
                        if (task.remind) {
                            Icon(
                                Icons.Filled.Notifications,
                                contentDescription = null,
                                tint = tint,
                                modifier = Modifier.size(16.dp),
                            )
                        }
                    }
                }
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Filled.Delete, contentDescription = stringResource(R.string.delete_task))
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun TaskItemPreview() {
    TaskFlowTheme(dynamicColor = false) {
        TaskItem(
            task = Task(
                id = 1,
                title = "Finish lesson 17",
                notes = "Compose layouts and state",
                priority = Priority.HIGH,
                dueAt = 0,
                remind = true,
            ),
            now = System.currentTimeMillis(),
            onToggleDone = {},
            onClick = {},
            onDelete = {},
        )
    }
}
