package academy.shop

import io.mockk.mockk
import io.mockk.verify
import kotlin.test.Test
import kotlin.test.assertEquals

class ReceiptServiceTest {
    private val cart =
        Cart().apply {
            add(Item("tea", unitPriceCents = 250, quantity = 2))
            add(Item("cake", unitPriceCents = 400))
        }
    private val expected = listOf("2 × tea  5.00", "1 × cake  4.00", "TOTAL  8.10")

    @Test
    fun `with a fake - record what was printed`() {
        val printed = mutableListOf<List<String>>()
        // ReceiptPrinter is a fun interface, so a lambda is a complete fake.
        val service = ReceiptService { lines -> printed += lines }

        service.print(cart, Discount.Percent(10))

        assertEquals(listOf(expected), printed)
    }

    @Test
    fun `with a mock - verify the interaction`() {
        val printer = mockk<ReceiptPrinter>(relaxed = true)

        ReceiptService(printer).print(cart, Discount.Percent(10))

        verify(exactly = 1) { printer.print(expected) }
    }
}
