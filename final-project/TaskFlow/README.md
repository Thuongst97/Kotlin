# TaskFlow — Kotlin Academy final project

A production-style Android task manager built step by step in
[lesson 21](https://thuongst97.github.io/Kotlin/final-project.html).

**Features:** task list with search, filters and progress · create/edit with priority, due date and
reminders · delete with undo · settings (theme, dynamic color, sort order) · import sample tasks
from the network · reminder notifications that work even when the app is closed.

**Stack:** Kotlin 2.2 · Jetpack Compose + Material 3 · type-safe Navigation Compose · MVVM with
StateFlow · Hilt · Room · DataStore · Retrofit + kotlinx.serialization · WorkManager · JUnit,
Turbine, Compose UI tests.

```bash
./gradlew assembleDebug              # build
./gradlew installDebug               # install on a connected device/emulator
./gradlew testDebugUnitTest          # JVM unit tests
./gradlew connectedDebugAndroidTest  # Room + Compose UI tests on a device
./gradlew ktlintCheck detekt         # coding conventions & static analysis
```

Requirements: Android Studio (latest stable), JDK 17+ (Android Studio's bundled JBR works), Android SDK 36.

Room exports its schema to `app/schemas/` on the first build — commit those JSON files so future
migrations can be tested. For release signing, create a git-ignored `keystore.properties`
(see lesson 20).
