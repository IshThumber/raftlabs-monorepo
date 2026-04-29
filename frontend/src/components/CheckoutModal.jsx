import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";

const EMPTY = { customerName: "", address: "", phone: "" };

export default function CheckoutModal({ open, onClose }) {
  const { items, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrder();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const e = {};
    if (!form.customerName.trim() || form.customerName.trim().length < 2)
      e.customerName = "Name must be at least 2 characters";
    if (!form.address.trim() || form.address.trim().length < 5)
      e.address = "Address must be at least 5 characters";
    if (!/^\+?[\d\s\-()\u200B]{7,15}$/.test(form.phone))
      e.phone = "Enter a valid phone number";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setApiError("");
    try {
      await placeOrder({
        customerName: form.customerName,
        address: form.address,
        phone: form.phone,
        items: items.map(({ itemId, quantity }) => ({ itemId, quantity })),
      });
      clearCart();
      setForm(EMPTY);
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function field(label, key, placeholder, type = "text") {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink/70">{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: "" })); }}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
            ${errors[key] ? "border-red-400 bg-red-50" : "border-brand-200 bg-white focus:border-brand-400"}`}
        />
        {errors[key] && <p className="text-red-500 text-xs">{errors[key]}</p>}
      </div>
    );
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-cream w-full max-w-md rounded-2xl shadow-2xl animate-slide-up overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-brand-100 flex items-center justify-between">
            <h2 className="text-xl">Checkout</h2>
            <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors text-2xl">×</button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {field("Full Name", "customerName", "Jane Smith")}
            {field("Delivery Address", "address", "12 MG Road, Bengaluru 560001")}
            {field("Phone Number", "phone", "+91 9876543210", "tel")}

            {/* Order summary */}
            <div className="bg-white rounded-xl border border-brand-100 p-4 space-y-2">
              <p className="text-sm font-medium text-ink/60 mb-2">Order Summary</p>
              {items.map((item) => (
                <div key={item.itemId} className="flex justify-between text-sm">
                  <span className="text-ink/70">{item.name} × {item.quantity}</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-brand-100 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-brand-500">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {apiError && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{apiError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              className="btn-primary w-full text-base"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Placing order…" : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
