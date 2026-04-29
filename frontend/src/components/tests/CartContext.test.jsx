import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../context/CartContext";

const mockItem = { id: "item-1", name: "Pizza", price: 12.99, image: "" };
const mockItem2 = { id: "item-2", name: "Burger", price: 10.49, image: "" };

// Helper: render a consumer component
function CartConsumer() {
  const { items, addItem, removeItem, setQty, clearCart, totalItems, totalPrice } = useCart();
  return (
    <div>
      <button onClick={() => addItem(mockItem)}>add pizza</button>
      <button onClick={() => addItem(mockItem2)}>add burger</button>
      <button onClick={() => removeItem("item-1")}>remove pizza</button>
      <button onClick={() => setQty("item-1", 5)}>set qty 5</button>
      <button onClick={() => setQty("item-1", 0)}>set qty 0</button>
      <button onClick={clearCart}>clear</button>
      <span data-testid="count">{totalItems}</span>
      <span data-testid="total">{totalPrice.toFixed(2)}</span>
      <ul>
        {items.map((i) => (
          <li key={i.itemId} data-testid={`item-${i.itemId}`}>
            {i.name} x{i.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderCart() {
  return render(<CartProvider><CartConsumer /></CartProvider>);
}

describe("CartContext", () => {
  it("starts empty", () => {
    renderCart();
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("total").textContent).toBe("0.00");
  });

  it("adds an item", () => {
    renderCart();
    fireEvent.click(screen.getByText("add pizza"));
    expect(screen.getByTestId("item-item-1")).toHaveTextContent("Pizza x1");
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("increments quantity when same item is added twice", () => {
    renderCart();
    fireEvent.click(screen.getByText("add pizza"));
    fireEvent.click(screen.getByText("add pizza"));
    expect(screen.getByTestId("item-item-1")).toHaveTextContent("x2");
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("calculates total price correctly", () => {
    renderCart();
    fireEvent.click(screen.getByText("add pizza")); // 12.99
    fireEvent.click(screen.getByText("add burger")); // 10.49
    expect(screen.getByTestId("total").textContent).toBe("23.48");
  });

  it("removes an item", () => {
    renderCart();
    fireEvent.click(screen.getByText("add pizza"));
    fireEvent.click(screen.getByText("remove pizza"));
    expect(screen.queryByTestId("item-item-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("sets quantity explicitly", () => {
    renderCart();
    fireEvent.click(screen.getByText("add pizza"));
    fireEvent.click(screen.getByText("set qty 5"));
    expect(screen.getByTestId("item-item-1")).toHaveTextContent("x5");
    expect(screen.getByTestId("count").textContent).toBe("5");
  });

  it("removes item when quantity is set to 0", () => {
    renderCart();
    fireEvent.click(screen.getByText("add pizza"));
    fireEvent.click(screen.getByText("set qty 0"));
    expect(screen.queryByTestId("item-item-1")).not.toBeInTheDocument();
  });

  it("clears all items", () => {
    renderCart();
    fireEvent.click(screen.getByText("add pizza"));
    fireEvent.click(screen.getByText("add burger"));
    fireEvent.click(screen.getByText("clear"));
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.queryByTestId("item-item-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("item-item-2")).not.toBeInTheDocument();
  });
});
