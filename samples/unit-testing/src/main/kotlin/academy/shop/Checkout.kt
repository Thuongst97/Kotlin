package academy.shop

import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope

/** A remote price service. Tests replace it with a fake. */
interface PriceApi {
    suspend fun priceOf(sku: String): Int
}

class Checkout(private val api: PriceApi) {
    /** Looks up every price in parallel and returns the sum. */
    suspend fun quote(skus: List<String>): Int = coroutineScope {
        skus.map { sku -> async { api.priceOf(sku) } }.awaitAll().sum()
    }
}
