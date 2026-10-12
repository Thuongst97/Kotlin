package academy.shop

import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class CartTest {
    private lateinit var cart: Cart

    @BeforeTest
    fun setUp() {
        cart = Cart() // a fresh cart for every test: tests never share state
    }

    @Test
    fun `empty cart totals zero`() {
        assertEquals(0, cart.totalCents())
    }

    @Test
    fun `adding the same sku twice merges the quantities`() {
        // Arrange
        cart.add(Item("apple", unitPriceCents = 50))
        // Act
        cart.add(Item("apple", unitPriceCents = 50, quantity = 2))
        // Assert
        assertEquals(1, cart.lines.size)
        assertEquals(3, cart.lines.single().quantity)
        assertEquals(150, cart.subtotalCents())
    }

    @Test
    fun `percent discount is taken off the subtotal`() {
        cart.add(Item("book", unitPriceCents = 2_000))
        assertEquals(1_800, cart.totalCents(Discount.Percent(10)))
    }

    @Test
    fun `total never goes below zero`() {
        cart.add(Item("pen", unitPriceCents = 100))
        assertEquals(0, cart.totalCents(Discount.AmountOff(500)))
    }

    @Test
    fun `remove reports whether something was removed`() {
        cart.add(Item("pen", unitPriceCents = 100))
        assertTrue(cart.remove("pen"))
        assertFalse(cart.remove("pen"))
    }

    @Test
    fun `a negative price is rejected with a clear message`() {
        val error = assertFailsWith<IllegalArgumentException> { Item("bad", unitPriceCents = -1) }
        assertEquals("price must be >= 0, was -1", error.message)
    }
}
