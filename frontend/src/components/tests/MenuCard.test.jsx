import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MenuCard from "../MenuCard";
import { CartContext } from "../../context/CartContext";

// We export CartContext separately — let's just mock the hook
vi.mock("../../context/CartContext", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCart: vi.fn(),
  };
});

import { useCart } from "../../context/CartContext";

const mockItem = {
  id: "item-1",
  name: "Margherita Pizza",
  description: "Classic tomato base, mozzarella",
  price: 12.99,
  category: "Pizza",
  image: "https://example.com/pizza.jpg",
};

describe("MenuCard", () => {
  beforeEach(() => {
    useCart.mockReturnValue({ addItem: vi.fn(), items: [] });
  });

  it("renders item name, price and description", () => {
    render(<MenuCard item={mockItem} />);
    expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    expect(screen.getByText("$12.99")).toBeInTheDocument();
    expect(screen.getByText(/Classic tomato base/)).toBeInTheDocument();
  });

  it("renders category badge", () => {
    render(<MenuCard item={mockItem} />);
    expect(screen.getByText("Pizza")).toBeInTheDocument();
  });

  it("shows 'Add to cart' button when item is not in cart", () => {
    render(<MenuCard item={mockItem} />);
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  it("calls addItem when button is clicked", () => {
    const addItem = vi.fn();
    useCart.mockReturnValue({ addItem, items: [] });
    render(<MenuCard item={mockItem} />);
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(addItem).toHaveBeenCalledWith(mockItem);
  });

  it("shows 'In cart' state when item is already in cart", () => {
    useCart.mockReturnValue({
      addItem: vi.fn(),
      items: [{ itemId: "item-1", quantity: 2 }],
    });
    render(<MenuCard item={mockItem} />);
    expect(screen.getByText(/In cart \(2\)/)).toBeInTheDocument();
  });
});
