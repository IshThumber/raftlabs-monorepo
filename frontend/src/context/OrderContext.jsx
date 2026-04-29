import { createContext, useContext, useState, useRef, useCallback } from "react";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [activeOrder, setActiveOrder] = useState(null); // full order object
  const [view, setView] = useState("menu"); // "menu" | "status"
  const eventSourceRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || "";

  const placeOrder = useCallback(async (payload) => {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.details?.join(", ") || err.error || "Order failed");
    }

    const order = await res.json();
    setActiveOrder(order);
    setView("status");

    // Open SSE stream
    if (eventSourceRef.current) eventSourceRef.current.close();
    const es = new EventSource(`${API_BASE}/api/orders/${order.id}/stream`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const { status, statusIndex } = JSON.parse(e.data);
      setActiveOrder((prev) => ({ ...prev, status, statusIndex }));
      if (statusIndex >= 3) es.close(); // Delivered — stop listening
    };

    es.onerror = () => es.close();

    return order;
  }, []);

  const resetToMenu = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setActiveOrder(null);
    setView("menu");
  }, []);

  return (
    <OrderContext.Provider value={{ activeOrder, view, placeOrder, resetToMenu }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside OrderProvider");
  return ctx;
}
