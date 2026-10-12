package academy.shop

import app.cash.turbine.test
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlinx.coroutines.test.currentTime
import kotlinx.coroutines.test.runTest

class CountdownTest {
    @Test
    fun `emits from n down to zero, then completes`() = runTest {
        countdown(3).test {
            assertEquals(3, awaitItem())
            assertEquals(2, awaitItem())
            assertEquals(1, awaitItem())
            assertEquals(0, awaitItem())
            awaitComplete()
        }
    }

    @Test
    fun `ticks once per second of virtual time`() = runTest {
        countdown(5).test {
            awaitItem()
            assertEquals(0, currentTime)
            awaitItem()
            assertEquals(1_000, currentTime)
            cancelAndIgnoreRemainingEvents() // we've seen enough
        }
    }
}
