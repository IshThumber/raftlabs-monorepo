import { useCart } from "../context/CartContext";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, removeItem, setQty, totalPrice, totalItems } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-ink/30 z-40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-100">
          <h2 className="text-xl">Your Cart</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors text-2xl leading-none" aria-label="close cart drawer">
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-ink/40">
              <span className="text-5xl">🛒</span>
              <p className="font-body">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.itemId} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-brand-100">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                  <p className="text-brand-500 text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                {/* Qty controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQty(item.itemId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50 text-sm font-bold flex items-center justify-center transition-colors"
                    aria-label="decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => setQty(item.itemId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50 text-sm font-bold flex items-center justify-center transition-colors"
                    aria-label="increase quantity"
                  >
                    +
                  </button>
                </div>
                <button onClick={() => removeItem(item.itemId)} className="text-ink/25 hover:text-red-400 transition-colors text-lg ml-1" aria-label="remove item">
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-brand-100 space-y-4">
            <div className="flex justify-between text-base font-semibold">
              <span>
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
              <span className="text-brand-500">${totalPrice.toFixed(2)}</span>
            </div>
            <button className="btn-primary w-full text-base" onClick={onCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
