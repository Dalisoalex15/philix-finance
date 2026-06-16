import { useState } from "react";
import { Clock, CreditCard, User, FileText, Phone, AlertTriangle, CheckCircle, DollarSign, Search } from "lucide-react";
import { mockClientTimeline, mockClients, formatDate, formatKwacha } from "../lib/mock-data";

const eventIcons: Record<string, React.ElementType> = {
  LOAN_APPLIED: FileText,
  LOAN_APPROVED: CheckCircle,
  LOAN_DISBURSED: DollarSign,
  PAYMENT_RECEIVED: CreditCard,
  PAYMENT_MISSED: AlertTriangle,
  COLLECTION_CALL: Phone,
  KYC_VERIFIED: User,
  COLLATERAL_SUBMITTED: FileText,
  NOTE_ADDED: Clock,
};

const eventColors: Record<string, string> = {
  LOAN_APPLIED: "text-blue-400 bg-blue-900/20",
  LOAN_APPROVED: "text-emerald-400 bg-emerald-900/20",
  LOAN_DISBURSED: "text-emerald-400 bg-emerald-900/20",
  PAYMENT_RECEIVED: "text-emerald-400 bg-emerald-900/20",
  PAYMENT_MISSED: "text-red-400 bg-red-900/20",
  COLLECTION_CALL: "text-amber-400 bg-amber-900/20",
  KYC_VERIFIED: "text-indigo-400 bg-indigo-900/20",
  COLLATERAL_SUBMITTED: "text-purple-400 bg-purple-900/20",
  NOTE_ADDED: "text-slate-400 bg-slate-800",
};

export default function ClientTimelinePage() {
  const [clientId, setClientId] = useState<string>(mockClients[0]?.id || "");
  const [search, setSearch] = useState("");

  const filteredClients = mockClients.filter(c =>
    `${c.firstName} ${c.lastName} ${c.clientNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const client = mockClients.find(c => c.id === clientId);
  const timeline = mockClientTimeline
    .filter(e => e.clientId === clientId)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Timeline</h1>
          <p className="page-subtitle">Full history of every event, payment, and interaction per client</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Selector */}
        <div className="philix-card p-4 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-base pl-8 text-sm" placeholder="Search client..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredClients.map(c => (
              <button key={c.id} onClick={() => setClientId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${clientId === c.id ? "bg-indigo-600 text-white" : "hover:bg-slate-800 text-slate-300"}`}>
                <div className="font-medium">{c.firstName} {c.lastName}</div>
                <div className={`text-xs ${clientId === c.id ? "text-indigo-200" : "text-slate-500"}`}>{c.clientNumber}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {client && (
            <div className="philix-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400 text-lg flex-shrink-0">
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <div>
                <div className="font-bold text-slate-100 text-lg">{client.firstName} {client.lastName}</div>
                <div className="text-xs text-slate-500">{client.clientNumber} · {client.phone}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-slate-500">Total Events</div>
                <div className="text-2xl font-bold text-slate-100">{timeline.length}</div>
              </div>
            </div>
          )}

          {timeline.length === 0 ? (
            <div className="philix-card p-8 text-center text-slate-500 text-sm">
              No timeline events for this client yet.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800" />
              <div className="space-y-4">
                {timeline.map((event, idx) => {
                  const Icon = eventIcons[event.type] || Clock;
                  const colorClass = eventColors[event.type] || "text-slate-400 bg-slate-800";
                  return (
                    <div key={event.id} className="relative pl-14">
                      <div className={`absolute left-3 w-7 h-7 rounded-full flex items-center justify-center ${colorClass} border-2 border-slate-950`}>
                        <Icon size={12} />
                      </div>
                      <div className="philix-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-200">{event.type.replace(/_/g, " ")}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{event.description}</div>
                            {event.amount && (
                              <div className={`text-sm font-bold mt-1 ${event.type.includes("MISSED") ? "text-red-400" : "text-emerald-400"}`}>
                                {formatKwacha(event.amount)}
                              </div>
                            )}
                            {event.performedBy && (
                              <div className="text-xs text-slate-500 mt-1">by {event.performedBy.firstName} {event.performedBy.lastName}</div>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">{formatDate(event.occurredAt)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
