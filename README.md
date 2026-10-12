# Kotlin Academy — learn Kotlin from zero to master

A free, hands-on website that takes you from **installing your tools** to **shipping a complete Android app** in Kotlin.

**🌐 Live site:** https://thuongst97.github.io/Kotlin/ (deployed by GitHub Pages from `main`)

| Stage | Lessons |
|---|---|
| 🧰 Getting started | 01 Toolkit & environment (JDK, IntelliJ IDEA, Android Studio, SDK, emulator, real device) · 02 Hello, Kotlin! |
| 🔤 Fundamentals | 03 Variables & types · 04 Control flow · 05 Functions · 06 Null safety · 07 Collections |
| 🏛 OOP & functional | 08 Classes & interfaces · 09 Data/enum/sealed/object · 10 Lambdas, extensions & scope functions · 11 Generics · 12 Errors, delegation & idioms |
| ⚡ Advanced | 13 Coroutines · 14 Flow, StateFlow & channels · 15 DSLs, testing & Multiplatform |
| 🤖 Android | 16 App fundamentals · 17 Jetpack Compose · 18 Architecture (MVVM, Hilt, Navigation) · 19 Room, DataStore, Retrofit, WorkManager · 20 Testing, debugging & publishing |
| 🏁 Final project | 21 **TaskFlow** — a complete task-manager app built in 9 milestones |
| 📋 Reference | A · Cheat sheet & mastery checklist · B · Coding conventions, rules & best practices |

Every lesson has runnable examples (▶ **Run** opens them in the official Kotlin Playground), exercises with solutions, a quiz, and progress tracking saved in your browser.

## Repository layout

```
kotlin-academy/          The static website (plain HTML/CSS/JS, no build step)
  index.html             Landing page + curriculum
  *.html                 One page per lesson
  assets/css/main.css    Design system (dark + light themes)
  assets/js/core.js      Shared layout, search, highlighter, Playground runner, quizzes, progress
final-project/TaskFlow/  The complete Android app built in lesson 21
tools/
  check_snippets.py      Compiles and runs every runnable lesson example and checks its output
  embed_sources.py       Copies TaskFlow's real source files into final-project.html
.github/workflows/
  pages.yml              Deploys kotlin-academy/ to GitHub Pages on push to main
  check-snippets.yml     Verifies lesson examples + embedded sources on every push
  android.yml            Builds TaskFlow, runs unit tests, uploads the debug APK
```

## Run the site locally

```bash
cd kotlin-academy
python3 -m http.server 8000      # then open http://localhost:8000
```

Opening `index.html` directly from disk also works; only full-text search needs a local server.

## Quality checks

```bash
# Re-embed TaskFlow sources into the final-project page after changing the app
python3 tools/embed_sources.py

# Compile & run all runnable examples (needs the Kotlin compiler jars; see check-snippets.yml)
python3 tools/check_snippets.py --kotlin-lib path/to/kotlin-jars
```

## Build the final project

Open `final-project/TaskFlow` in Android Studio, or:

```bash
cd final-project/TaskFlow
./gradlew assembleDebug testDebugUnitTest
```

## Deploying

The site deploys like [Android-Knowledge](https://github.com/Thuongst97/Android-Knowledge): pushing to `main` runs `.github/workflows/pages.yml`, which stamps asset URLs for cache busting and publishes `kotlin-academy/` to GitHub Pages. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
