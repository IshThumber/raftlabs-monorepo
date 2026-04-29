import { createContext, useContext, useReducer } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((i) => i.itemId === action.item.id);
      if (existing) {
        return state.map((i) =>
          i.itemId === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...state,
        {
          itemId: action.item.id,
          name: action.item.name,
          price: action.item.price,
          image: action.item.image,
          quantity: 1,
        },
      ];
    }
    case "REMOVE_ITEM":
      return state.filter((i) => i.itemId !== action.itemId);

    case "SET_QTY": {
      if (action.quantity < 1) {
        return state.filter((i) => i.itemId !== action.itemId);
      }
      return state.map((i) =>
        i.itemId === action.itemId ? { ...i, quantity: action.quantity } : i
      );
    }

    case "CLEAR":
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  const addItem = (item) => dispatch({ type: "ADD_ITEM", item });
  const removeItem = (itemId) => dispatch({ type: "REMOVE_ITEM", itemId });
  const setQty = (itemId, quantity) => dispatch({ type: "SET_QTY", itemId, quantity });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = parseFloat(
    items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
