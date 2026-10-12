package academy.shop

fun interface ReceiptPrinter {
    fun print(lines: List<String>)
}

class ReceiptService(private val printer: ReceiptPrinter) {
    fun print(cart: Cart, discount: Discount? = null) {
        val lines =
            cart.lines.map { "${it.quantity} × ${it.sku}  ${formatCents(it.totalCents)}" } +
                "TOTAL  ${formatCents(cart.totalCents(discount))}"
        printer.print(lines)
    }
}
