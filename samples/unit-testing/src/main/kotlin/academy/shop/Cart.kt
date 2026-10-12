package academy.shop

/** One line in the cart. Prices are in cents so there is no floating-point rounding. */
data class Item(val sku: String, val unitPriceCents: Int, val quantity: Int = 1) {
    init {
        require(sku.isNotBlank()) { "sku must not be blank" }
        require(unitPriceCents >= 0) { "price must be >= 0, was $unitPriceCents" }
        require(quantity > 0) { "quantity must be > 0, was $quantity" }
    }

    val totalCents: Int get() = unitPriceCents * quantity
}

sealed interface Discount {
    data class Percent(val percent: Int) : Discount {
        init {
            require(percent in 1..100) { "percent must be in 1..100, was $percent" }
        }
    }

    data class AmountOff(val cents: Int) : Discount {
        init {
            require(cents > 0) { "cents must be > 0, was $cents" }
        }
    }
}

class Cart {
    private val items = mutableListOf<Item>()

    val lines: List<Item> get() = items.toList()

    /** Adding a SKU that is already in the cart increases its quantity. */
    fun add(item: Item) {
        val index = items.indexOfFirst { it.sku == item.sku }
        if (index >= 0) {
            items[index] = items[index].copy(quantity = items[index].quantity + item.quantity)
        } else {
            items += item
        }
    }

    fun remove(sku: String): Boolean = items.removeIf { it.sku == sku }

    fun subtotalCents(): Int = items.sumOf { it.totalCents }

    /** The amount to pay; a discount can never make it negative. */
    fun totalCents(discount: Discount? = null): Int {
        val subtotal = subtotalCents()
        val off =
            when (discount) {
                null -> 0
                is Discount.Percent -> subtotal * discount.percent / 100
                is Discount.AmountOff -> discount.cents
            }
        return (subtotal - off).coerceAtLeast(0)
    }
}

/** 199 → "1.99" */
fun formatCents(cents: Int): String {
    require(cents >= 0) { "cents must be >= 0, was $cents" }
    return "${cents / 100}.${(cents % 100).toString().padStart(2, '0')}"
}
