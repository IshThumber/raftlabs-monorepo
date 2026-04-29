import { useOrder } from "../context/OrderContext";

const STATUSES = ["Order Received", "Preparing", "Out for Delivery", "Delivered"];

const STATUS_META = {
  "Order Received": { emoji: "📋", message: "We've got your order and are getting started!" },
  Preparing:        { emoji: "👨‍🍳", message: "Our chefs are crafting your meal with care." },
  "Out for Delivery": { emoji: "🛵", message: "Your food is on its way — sit tight!" },
  Delivered:        { emoji: "🎉", message: "Enjoy your meal! Hope it's everything you wanted." },
};

export default function OrderStatusPage() {
  const { activeOrder, resetToMenu } = useOrder();

  if (!activeOrder) return null;

  const currentIdx = activeOrder.statusIndex ?? 0;
  const isDelivered = currentIdx >= 3;
  const meta = STATUS_META[activeOrder.status] || STATUS_META["Order Received"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 animate-fade-in">
      {/* Card */}
      <div className="w-full max-w-md card p-8 space-y-8">
        {/* Emoji + status */}
        <div className="text-center space-y-2">
          <div className="text-6xl animate-pulse-dot inline-block">{meta.emoji}</div>
          <h2 className="text-2xl text-ink">{activeOrder.status}</h2>
          <p className="text-ink/60 text-sm">{meta.message}</p>
        </div>

        {/* Stepper */}
        <div className="relative">
          {/* Track line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-brand-100 z-0" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-brand-400 z-0 transition-all duration-700"
            style={{ width: `${(currentIdx / (STATUSES.length - 1)) * 100}%`, right: "auto" }}
          />

          <div className="relative z-10 flex justify-between">
            {STATUSES.map((step, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={step} className="flex flex-col items-center gap-1.5 w-1/4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                      ${done
                        ? "bg-brand-500 text-white shadow-md shadow-brand-200"
                        : "bg-brand-100 text-brand-300"
                      }
                      ${active ? "ring-4 ring-brand-200 scale-110" : ""}
                    `}
                  >
                    {done ? "✓" : idx + 1}
                  </div>
                  <span className={`text-center text-xs leading-tight transition-colors duration-300 ${done ? "text-brand-600 font-medium" : "text-ink/30"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order details */}
        <div className="bg-brand-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">Order Details</p>
          <p className="text-sm"><span className="text-ink/50">Name: </span>{activeOrder.customerName}</p>
          <p className="text-sm"><span className="text-ink/50">Address: </span>{activeOrder.address}</p>
          <p className="text-sm"><span className="text-ink/50">Total: </span>
            <span className="text-brand-500 font-semibold">${activeOrder.total?.toFixed(2)}</span>
          </p>
          <p className="text-xs text-ink/30 font-mono mt-1">#{activeOrder.id?.slice(0, 8)}</p>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {activeOrder.items?.map((item) => (
            <div key={item.itemId} className="flex justify-between text-sm">
              <span className="text-ink/70">{item.name} × {item.quantity}</span>
              <span className="font-medium">${item.subtotal?.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Live indicator or back button */}
        {!isDelivered ? (
          <div className="flex items-center gap-2 justify-center text-xs text-ink/50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live updates active
          </div>
        ) : (
          <button className="btn-primary w-full" onClick={resetToMenu}>
            Order Again →
          </button>
        )}
      </div>
    </div>
  );
}
