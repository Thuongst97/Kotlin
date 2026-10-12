package academy.shop

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlinx.coroutines.delay
import kotlinx.coroutines.test.currentTime
import kotlinx.coroutines.test.runTest

/** A fake: a small, real implementation for tests. No network, fully controllable. */
class FakePriceApi(private val prices: Map<String, Int>, private val latencyMillis: Long = 100) :
    PriceApi {
    val requested = mutableListOf<String>()

    override suspend fun priceOf(sku: String): Int {
        requested += sku
        delay(latencyMillis) // virtual time inside runTest: costs nothing
        return prices[sku] ?: error("unknown sku $sku")
    }
}

class CheckoutTest {
    @Test
    fun `quote sums every price`() = runTest {
        val api = FakePriceApi(mapOf("a" to 100, "b" to 250, "c" to 50))

        val total = Checkout(api).quote(listOf("a", "b", "c"))

        assertEquals(400, total)
        assertEquals(listOf("a", "b", "c"), api.requested)
    }

    @Test
    fun `prices are fetched in parallel`() = runTest {
        val api = FakePriceApi(mapOf("a" to 1, "b" to 2, "c" to 3), latencyMillis = 1_000)

        Checkout(api).quote(listOf("a", "b", "c"))

        // Three 1-second calls in parallel take 1 s of *virtual* time (sequential would be 3 s).
        // The test itself finishes in milliseconds.
        assertEquals(1_000, currentTime)
    }

    @Test
    fun `an unknown sku fails the whole quote`() = runTest {
        val api = FakePriceApi(mapOf("a" to 1))

        val error =
            assertFailsWith<IllegalStateException> { Checkout(api).quote(listOf("a", "zzz")) }

        assertEquals("unknown sku zzz", error.message)
    }
}
