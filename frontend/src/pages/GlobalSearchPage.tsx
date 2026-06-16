import { useState, useMemo } from "react";
import { Search, User, CreditCard, Package, ArrowRight } from "lucide-react";
import { mockClients, mockLoans, mockCollateral, formatKwacha, formatDate } from "../lib/mock-data";
import { useNavigate } from "react-router-dom";

type ResultType = "client" | "loan" | "collateral";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
}

const typeIcons: Record<ResultType, React.ElementType> = {
  client: User,
  loan: CreditCard,
  collateral: Package,
};

const typeColors: Record<ResultType, string> = {
  client: "text-blue-400 bg-blue-900/20",
  loan: "text-indigo-400 bg-indigo-900/20",
  collateral: "text-amber-400 bg-amber-900/20",
};

export default function GlobalSearchPage() {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<ResultType | "all">("all");
  const navigate = useNavigate();

  const results = useMemo<SearchResult[]>(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();

    const clients: SearchResult[] = mockClients
      .filter(c => `${c.firstName} ${c.lastName} ${c.clientNumber} ${c.phone}`.toLowerCase().includes(q))
      .map(c => ({
        id: c.id,
        type: "client" as const,
        title: `${c.firstName} ${c.lastName}`,
        subtitle: `${c.clientNumber} · ${c.phone}`,
        meta: c.clientNumber,
        href: `/clients/${c.id}`,
      }));

    const loans: SearchResult[] = mockLoans
      .filter(l => `${l.loanNumber} ${l.client?.firstName} ${l.client?.lastName}`.toLowerCase().includes(q))
      .map(l => ({
        id: l.id,
        type: "loan" as const,
        title: l.loanNumber,
        subtitle: `${l.client?.firstName} ${l.client?.lastName} · ${l.status}`,
        meta: formatKwacha(l.principal),
        href: `/loans/${l.id}`,
      }));

    const col: SearchResult[] = mockCollateral
      .filter(c => `${c.vaultId} ${c.brand} ${c.model} ${c.serialNumber}`.toLowerCase().includes(q))
      .map(c => ({
        id: c.id,
        type: "collateral" as const,
        title: `${c.brand} ${c.model}`,
        subtitle: `${c.vaultId} · ${c.type}`,
        meta: formatKwacha(c.marketValue),
        href: `/collateral/${c.id}`,
      }));

    return [...clients, ...loans, ...col];
  }, [query]);

  const filtered = activeType === "all" ? results : results.filter(r => r.type === activeType);
  const counts: Partial<Record<ResultType, number>> = {};
  results.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Search</h1>
          <p className="page-subtitle">Search across clients, loans, collateral, payments, and more</p>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          className="input-base pl-12 py-3.5 text-base"
          placeholder="Search by name, NRC, loan number, vault ID, phone..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {query.length >= 2 && (
        <>
          {/* Type Filters */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "client", "loan", "collateral"] as const).map(type => (
              <button key={type} onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${activeType === type ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                {type === "all" ? `All (${results.length})` : `${type.charAt(0).toUpperCase() + type.slice(1)}s (${counts[type] || 0})`}
              </button>
            ))}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="philix-card p-8 text-center">
              <Search size={32} className="text-slate-700 mx-auto mb-3" />
              <div className="text-slate-400">No results found for "{query}"</div>
              <div className="text-slate-600 text-sm mt-1">Try a different search term or check spelling</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(result => {
                const Icon = typeIcons[result.type];
                const colorClass = typeColors[result.type];
                return (
                  <button key={result.id} onClick={() => navigate(result.href)}
                    className="w-full text-left philix-card p-3 flex items-center gap-3 hover:border-indigo-700 transition-all">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-sm">{result.title}</span>
                        <span className="text-xs text-slate-600 capitalize bg-slate-800 px-1.5 py-0.5 rounded">{result.type}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-400 flex-shrink-0">{result.meta}</div>
                    <ArrowRight size={12} className="text-slate-700 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="philix-card p-8 text-center">
          <Search size={40} className="text-slate-700 mx-auto mb-3" />
          <div className="text-slate-400">Start typing to search across all records</div>
          <div className="text-slate-600 text-sm mt-1">Clients · Loans · Collateral · Payments</div>
        </div>
      )}
    </div>
  );
}
