import { useCart } from "../context/CartContext";

export default function MenuCard({ item }) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.itemId === item.id);

  return (
    <div className="card group flex flex-col animate-fade-in hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative overflow-hidden h-44">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        <span className="absolute top-3 left-3 bg-white/90 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">{item.category}</span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-display text-ink font-semibold text-base leading-tight">{item.name}</h3>
          <span className="text-brand-500 font-semibold text-sm whitespace-nowrap">${item.price.toFixed(2)}</span>
        </div>

        <p className="text-ink/60 text-sm leading-relaxed flex-1">{item.description}</p>

        <button
          onClick={() => addItem(item)}
          className={`mt-2 w-full py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95
            ${inCart ? "bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100" : "bg-brand-500 text-white hover:bg-brand-600"}`}
        >
          {inCart ? `In cart (${inCart.quantity}) · Add more` : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
