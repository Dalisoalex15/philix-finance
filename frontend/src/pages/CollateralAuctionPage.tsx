import { useState } from "react";
import { Gavel, Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { mockAuctions, formatKwacha, formatDate } from "../lib/mock-data";

export default function CollateralAuctionPage() {
  const [auctions, setAuctions] = useState(mockAuctions);
  const [showForm, setShowForm] = useState(false);

  const listed = auctions.filter(a => a.status === "LISTED").length;
  const sold = auctions.filter(a => a.status === "SOLD").length;
  const totalRecovered = auctions.filter(a => a.status === "SOLD").reduce((s, a) => s + (a.soldPrice || 0), 0);
  const totalReserve = auctions.filter(a => a.status === "SOLD").reduce((s, a) => s + a.reservePrice, 0);

  const statusColors: Record<string, string> = {
    LISTED: "badge-blue",
    SOLD: "badge-green",
    FAILED: "badge-red",
    CANCELLED: "badge-gray",
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Collateral Auction Management</h1>
          <p className="page-subtitle">List, track, and record auction sales for repossessed collateral</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Gavel size={14} /> List for Auction
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Currently Listed", value: listed, color: "text-blue-400", icon: Clock },
          { label: "Sold", value: sold, color: "text-emerald-400", icon: CheckCircle },
          { label: "Total Recovered", value: formatKwacha(totalRecovered), color: "text-emerald-400", icon: Gavel },
          { label: "vs Reserve Price", value: totalRecovered > totalReserve ? `+${formatKwacha(totalRecovered - totalReserve)}` : `-${formatKwacha(totalReserve - totalRecovered)}`, color: totalRecovered >= totalReserve ? "text-emerald-400" : "text-red-400", icon: Package },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="philix-card p-5 border-amber-800/40 border animate-fade-in">
          <h3 className="section-title mb-4">List Collateral for Auction</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Select Repossessed Item *</label>
              <select className="input-base">
                <option>PHX-V-0008 — iPhone 13 Pro (UNDER_REVIEW)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Reserve Price (K)</label>
              <input type="number" className="input-base" defaultValue={5500} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Auction Date</label>
              <input type="date" className="input-base" />
            </div>
            <div className="lg:col-span-3">
              <label className="text-xs text-slate-400 mb-1 block">Notes</label>
              <input className="input-base" placeholder="Auctioneer, location, marketing notes..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-primary">List for Auction</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {auctions.map(auction => (
          <div key={auction.id} className="philix-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                <Gavel size={16} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-semibold text-indigo-400">{auction.collateral.vaultId}</span>
                  <span className="text-slate-300 text-sm">{auction.collateral.brand} {auction.collateral.model}</span>
                  <span className={statusColors[auction.status]}>{auction.status}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Linked Loan: {auction.loan.loanNumber}</div>
                {auction.notes && <div className="text-xs text-slate-400 mt-1 italic">"{auction.notes}"</div>}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="text-xs text-slate-500">Reserve Price</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{formatKwacha(auction.reservePrice)}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="text-xs text-slate-500">Listed Date</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{formatDate(auction.listingDate)}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="text-xs text-slate-500">Auction Date</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{auction.auctionDate ? formatDate(auction.auctionDate) : "TBD"}</div>
              </div>
              <div className={`rounded-lg p-2.5 ${auction.soldPrice ? "bg-emerald-900/20" : "bg-slate-800/50"}`}>
                <div className="text-xs text-slate-500">Sold Price</div>
                <div className={`text-sm font-bold mt-0.5 ${auction.soldPrice ? "text-emerald-400" : "text-slate-500"}`}>
                  {auction.soldPrice ? formatKwacha(auction.soldPrice) : "Not sold yet"}
                </div>
                {auction.soldPrice && auction.soldPrice > auction.reservePrice && (
                  <div className="text-xs text-emerald-400">+{formatKwacha(auction.soldPrice - auction.reservePrice)} above reserve</div>
                )}
              </div>
            </div>

            {auction.buyerName && (
              <div className="mt-3 bg-slate-800/30 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Buyer Details</div>
                <div className="text-sm text-slate-300">{auction.buyerName} · {auction.buyerContact}</div>
              </div>
            )}

            {auction.status === "LISTED" && (
              <div className="mt-3 flex gap-2">
                <button className="btn-success text-xs py-1.5">Record Sale</button>
                <button className="btn-secondary text-xs py-1.5">Cancel Listing</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
