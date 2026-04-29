import { useState, useEffect } from "react";
import MenuCard from "../components/MenuCard";

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-44 bg-brand-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-brand-100 rounded w-3/4" />
        <div className="h-3 bg-brand-100 rounded w-full" />
        <div className="h-3 bg-brand-100 rounded w-2/3" />
        <div className="h-9 bg-brand-100 rounded-full mt-2" />
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const API_BASE = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/api/menu`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load menu");
        return r.json();
      })
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const categories = ["All", ...new Set(menu.map((i) => i.category))];
  const filtered = activeCategory === "All" ? menu : menu.filter((i) => i.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      {/* Hero */}
      <div className="py-10 space-y-1">
        <h1 className="text-4xl text-ink leading-tight">
          Good food,
          <br />
          <span className="text-brand-500">fast delivery.</span>
        </h1>
        <p className="text-ink/50 text-base">Order in minutes. Eat in comfort.</p>
      </div>

      {/* Category filter */}
      {!loading && !error && (
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95
                ${activeCategory === cat ? "bg-brand-500 text-white shadow-sm" : "bg-white border border-brand-200 text-ink/60 hover:border-brand-400"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16 text-red-500 space-y-2">
          <p className="text-4xl">⚠️</p>
          <p>{error}</p>
          <button className="btn-ghost mt-2" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />) : filtered.map((item) => <MenuCard key={item.id} item={item} />)}
      </div>

      {!loading && !error && filtered.length === 0 && <p className="text-center text-ink/40 py-16">No items in this category.</p>}
    </div>
  );
}
