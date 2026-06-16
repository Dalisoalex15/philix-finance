import { useState } from "react";
import { Monitor, Package, Plus, TrendingDown } from "lucide-react";
import { mockAssets, formatKwacha, formatDate } from "../lib/mock-data";

const categoryIcons: Record<string, string> = {
  ELECTRONICS: "💻",
  FURNITURE: "🪑",
  VEHICLE: "🚗",
  EQUIPMENT: "⚙️",
  PROPERTY: "🏠",
  OTHER: "📦",
};

const conditionColors: Record<string, string> = {
  NEW: "badge-green",
  GOOD: "badge-blue",
  FAIR: "badge-yellow",
  POOR: "badge-red",
};

export default function AssetRegisterPage() {
  const [assets] = useState(mockAssets);
  const [filter, setFilter] = useState("ALL");

  const categories = ["ALL", ...Array.from(new Set(assets.map(a => a.category)))];

  const filtered = assets.filter(a => filter === "ALL" || a.category === filter);

  const totalCost = assets.reduce((s, a) => s + a.purchasePrice, 0);
  const totalCurrent = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalDepreciation = totalCost - totalCurrent;
  const depPct = totalCost > 0 ? Math.round((totalDepreciation / totalCost) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Register</h1>
          <p className="page-subtitle">Company assets, depreciation tracking and maintenance records</p>
        </div>
        <button className="btn-primary text-xs py-1.5"><Plus size={12} /> Add Asset</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: assets.length, color: "text-blue-400", icon: Package },
          { label: "Total Cost", value: formatKwacha(totalCost), color: "text-slate-300", icon: Monitor },
          { label: "Current Value", value: formatKwacha(totalCurrent), color: "text-emerald-400", icon: Monitor },
          { label: "Total Depreciation", value: `${formatKwacha(totalDepreciation)} (${depPct}%)`, color: "text-amber-400", icon: TrendingDown },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${filter === cat ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
            {cat === "ALL" ? "All Assets" : `${categoryIcons[cat] || "📦"} ${cat}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(asset => {
          const depPct = asset.purchasePrice > 0 ? Math.round(((asset.purchasePrice - asset.currentValue) / asset.purchasePrice) * 100) : 0;
          return (
            <div key={asset.id} className="philix-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{categoryIcons[asset.category] || "📦"}</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-200 text-sm">{asset.name}</div>
                  <div className="text-xs text-slate-500">{asset.assetNumber} · {asset.category}</div>
                </div>
                <span className={conditionColors[asset.condition] || "badge-gray"}>{asset.condition}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Purchase Price", value: formatKwacha(asset.purchasePrice) },
                  { label: "Current Value", value: formatKwacha(asset.currentValue), color: "text-emerald-400" },
                  { label: "Purchased", value: formatDate(asset.purchasedAt) },
                  { label: "Location", value: asset.location },
                ].map(f => (
                  <div key={f.label} className="bg-slate-800/50 rounded p-2">
                    <div className="text-slate-500">{f.label}</div>
                    <div className={`font-medium mt-0.5 ${f.color || "text-slate-300"}`}>{f.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Depreciation</span>
                  <span className="text-amber-400">{depPct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${depPct}%` }} />
                </div>
              </div>

              {asset.notes && <div className="text-xs text-slate-500 italic">{asset.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
