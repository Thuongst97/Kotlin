package com.kotlinacademy.taskflow.domain

enum class ThemeMode { SYSTEM, LIGHT, DARK }

data class UserSettings(
    val themeMode: ThemeMode = ThemeMode.SYSTEM,
    val dynamicColor: Boolean = true,
    val sortOrder: SortOrder = SortOrder.DUE_DATE,
)
