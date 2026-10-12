import org.gradle.api.tasks.testing.logging.TestExceptionFormat

plugins {
    kotlin("jvm") version "2.2.21"
    id("org.jetbrains.kotlinx.kover") version "0.9.9" // code coverage
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")

    testImplementation(kotlin("test")) // kotlin.test assertions, runs on JUnit 5
    testImplementation(platform("org.junit:junit-bom:5.14.4"))
    testImplementation("org.junit.jupiter:junit-jupiter-params") // @ParameterizedTest
    // runTest and virtual time for coroutines
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.2")
    testImplementation("app.cash.turbine:turbine:1.2.1") // testing Flows
    testImplementation("io.mockk:mockk:1.14.11") // mocks, when a fake is not enough
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = TestExceptionFormat.FULL
    }
}

kover {
    reports {
        verify {
            rule {
                minBound(80) // ./gradlew koverVerify fails below 80 % line coverage
            }
        }
    }
}
