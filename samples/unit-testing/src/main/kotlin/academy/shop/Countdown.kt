package academy.shop

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

/** Emits from, from - 1, …, 0 — one value per tick. */
fun countdown(from: Int, tickMillis: Long = 1_000): Flow<Int> = flow {
    require(from >= 0) { "from must be >= 0, was $from" }
    for (i in from downTo 0) {
        emit(i)
        if (i > 0) delay(tickMillis)
    }
}
