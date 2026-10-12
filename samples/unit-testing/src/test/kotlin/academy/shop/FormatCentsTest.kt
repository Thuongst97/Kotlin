package academy.shop

import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.junit.jupiter.params.provider.ValueSource

class FormatCentsTest {
    @ParameterizedTest(name = "{0} cents → \"{1}\"")
    @CsvSource("0, 0.00", "5, 0.05", "199, 1.99", "100000, 1000.00")
    fun `formats cents as a decimal string`(cents: Int, expected: String) {
        assertEquals(expected, formatCents(cents))
    }

    @ParameterizedTest
    @ValueSource(ints = [-1, -100])
    fun `negative amounts are rejected`(cents: Int) {
        assertFailsWith<IllegalArgumentException> { formatCents(cents) }
    }
}
