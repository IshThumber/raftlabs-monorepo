import { useState } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { OrderProvider, useOrder } from "./context/OrderContext";
import MenuPage from "./pages/MenuPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";

function Navbar({ onCartClick }) {
  const { totalItems } = useCart();
  return (
    <nav className="sticky top-0 z-30 bg-cream/90 backdrop-blur-sm border-b border-brand-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-display text-xl text-brand-500 font-bold tracking-tight">QuickBite</span>
        <button
          onClick={onCartClick}
          className="relative flex items-center gap-2 bg-white border border-brand-200 rounded-full px-4 py-2 text-sm font-medium hover:border-brand-400 transition-colors active:scale-95"
        >
          🛒 Cart
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{totalItems}</span>
          )}
        </button>
      </div>
    </nav>
  );
}

function AppInner() {
  const { view } = useOrder();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      {view === "menu" && <Navbar onCartClick={() => setCartOpen(true)} />}
      {view === "menu" ? <MenuPage /> : <OrderStatusPage />}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <OrderProvider>
        <AppInner />
      </OrderProvider>
    </CartProvider>
  );
}
