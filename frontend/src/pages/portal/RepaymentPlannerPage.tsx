import { useState, useEffect, useCallback } from "react";
import { Calculator, TrendingDown, RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useClientAuthStore } from "../../store/clientAuth";

const K = (n: number) => `K${n.toLocaleString("en-ZM", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

interface LoanApp {
  id: string; reference: string; productType: string;
  amountRequested: number; termMonths: number; interestRate?: number;
  status: string; reviewedAt?: string;
  paymentSubmissions?: { amount: number | null; status: string }[];
}

export default function RepaymentPlannerPage() {
  const token = useClientAuthStore(s => s.accessToken);
  const [apps, setApps] = useState<LoanApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/portal/applications", { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) {
      const data = await r.json();
      setApps(data);
      const active = data.find((a: LoanApp) => a.status === "DISBURSED");
      if (active) setSelectedId(active.id);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const loan = apps.find(a => a.id === selectedId);
  const active = apps.filter(a => a.status === "DISBURSED");

  if (loading) return (
    <div className="max-w-2xl mx-auto py-16 text-center text-slate-600">
      <RefreshCw size={20} className="animate-spin mx-auto mb-2" /> Loading your loans…
    </div>
  );

  if (active.length === 0) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
        <Calculator size={32} className="text-slate-600 mx-auto mb-3" />
        <div className="text-slate-400 font-semibold mb-1">No Active Loans</div>
        <p className="text-slate-600 text-sm mb-4">The planner works with your active disbursed loans.</p>
        <Link to="/portal/apply" className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
          Apply for a Loan <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );

  // Calculations
  const rate       = (loan?.interestRate ?? 20) / 100;
  const principal  = loan?.amountRequested ?? 0;
  const weeks      = loan?.termMonths ?? 1;
  const totalDue   = Math.ceil(principal * (1 + rate));
  const weekly     = Math.ceil(totalDue / weeks);
  const totalPaid  = (loan?.paymentSubmissions ?? [])
    .filter(p => p.status === "APPROVED")
    .reduce((s, p) => s + (p.amount ?? 0), 0);
  const outstanding = Math.max(0, totalDue - totalPaid);

  const baseDate   = loan?.reviewedAt ? new Date(loan.reviewedAt) : new Date();
  const dueDate    = new Date(baseDate.getTime() + weeks * 7 * 86400000);
  const daysLeft   = Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / 86400000));

  // Scenario: extra payment per week
  const extra = extraPayment || (customAmount ? parseFloat(customAmount) || 0 : 0);
  const effectiveWeekly = weekly + extra;
  const weeksToPayoff = extra > 0 ? Math.ceil(outstanding / effectiveWeekly) : weeks;
  const interestSaved = extra > 0 ? Math.max(0, Math.round((weeks - weeksToPayoff) * (totalDue - principal) / weeks)) : 0;
  const earlyPayoffDate = extra > 0 ? new Date(Date.now() + weeksToPayoff * 7 * 86400000) : dueDate;

  // Early payoff scenarios
  const scenarios = [
    { label: "Pay in Full Now",       amount: outstanding,         weeks: 0, label2: "Today" },
    { label: "+K500 Extra/Week",      amount: weekly + 500,        weeks: Math.ceil(outstanding / (weekly + 500)), label2: `${Math.ceil(outstanding/(weekly+500))}w` },
    { label: "+K1,000 Extra/Week",    amount: weekly + 1000,       weeks: Math.ceil(outstanding / (weekly + 1000)), label2: `${Math.ceil(outstanding/(weekly+1000))}w` },
    { label: "Standard Weekly",       amount: weekly,              weeks: Math.ceil(outstanding / weekly), label2: `${Math.ceil(outstanding/weekly)}w` },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900/50 border border-indigo-800/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
            <Calculator size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Smart Repayment Planner</h1>
            <p className="text-slate-500 text-sm">Simulate early payoff and see how much you can save</p>
          </div>
        </div>
      </div>

      {/* Loan selector */}
      {active.length > 1 && (
        <div>
          <label className="text-xs text-slate-500 mb-2 block font-semibold uppercase tracking-wider">Select Loan</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            {active.map(a => (
              <option key={a.id} value={a.id}>{a.reference} · {K(a.amountRequested)} · {a.termMonths}W</option>
            ))}
          </select>
        </div>
      )}

      {/* Current status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Loan Status</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Outstanding",   value: K(outstanding),   color: "text-amber-400" },
            { label: "Days Left",     value: `${daysLeft}d`,   color: daysLeft < 7 ? "text-red-400" : "text-blue-400" },
            { label: "Weekly Payment",value: K(weekly),        color: "text-slate-200" },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/50 rounded-xl p-3">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Paid: {K(totalPaid)}</span>
            <span>Total: {K(totalDue)}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
              style={{ width: `${Math.round((totalPaid / totalDue) * 100)}%` }} />
          </div>
          <div className="text-right text-[10px] text-slate-600 mt-0.5">{Math.round((totalPaid / totalDue) * 100)}% repaid</div>
        </div>
      </div>

      {/* Extra payment simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Extra Payment Simulator</h2>
        <p className="text-sm text-slate-400 mb-4">Add an extra amount to your weekly payment and see how much faster you can close your loan:</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[0, 500, 1000, 2000].map(amt => (
            <button key={amt} onClick={() => { setExtraPayment(amt); setCustomAmount(""); }}
              className={`py-2.5 text-sm font-bold rounded-xl border transition-all ${extraPayment === amt && !customAmount ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-600/50"}`}>
              {amt === 0 ? "Standard" : `+${K(amt)}`}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="text-xs text-slate-500 mb-1.5 block">Custom extra amount (K)</label>
          <input type="number" value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); setExtraPayment(0); }}
            placeholder="e.g. 750" min={0}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        {extra > 0 && (
          <div className="space-y-3">
            <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-2xl p-4">
              <div className="text-xs text-indigo-400 font-semibold mb-3 uppercase tracking-wider">With Extra {K(extra)}/week</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">New Weekly Payment</div>
                  <div className="text-xl font-black text-indigo-300">{K(weekly + extra)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Payoff in</div>
                  <div className="text-xl font-black text-emerald-400">{weeksToPayoff} weeks</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Payoff Date</div>
                  <div className="text-sm font-bold text-slate-200">{earlyPayoffDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Interest Saved</div>
                  <div className="text-xl font-black text-amber-400">{K(interestSaved)}</div>
                </div>
              </div>
            </div>

            {interestSaved > 0 && (
              <div className="flex items-center gap-3 bg-emerald-900/10 border border-emerald-800/20 rounded-xl px-4 py-3">
                <TrendingDown size={16} className="text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-emerald-300">
                  By paying <span className="font-bold">{K(extra)}</span> extra each week, you'll repay <span className="font-bold">{weeks - weeksToPayoff} weeks</span> earlier and save <span className="font-bold">{K(interestSaved)}</span> in interest.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Payment Scenarios</h2>
        <div className="space-y-2">
          {scenarios.map((s, i) => (
            <div key={s.label} className={`flex items-center justify-between p-3 rounded-xl border text-sm ${i === 0 ? "bg-emerald-900/10 border-emerald-800/30" : i === scenarios.length - 1 ? "bg-slate-800/30 border-slate-700" : "bg-blue-900/10 border-blue-800/20"}`}>
              <div>
                <div className={`font-semibold ${i === 0 ? "text-emerald-300" : "text-slate-200"}`}>{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">Pay {K(s.amount)}{i > 0 ? "/week" : " now"}</div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${i === 0 ? "text-emerald-400" : i === 1 ? "text-blue-400" : i === 2 ? "text-indigo-400" : "text-slate-400"}`}>{s.label2}</div>
                {i > 0 && i < scenarios.length - 1 && (
                  <div className="text-[10px] text-emerald-500">
                    Save {K(Math.max(0, Math.round((Math.ceil(outstanding / weekly) - s.weeks) * (totalDue - principal) / weeks)))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-300 text-sm">Ready to make a payment?</div>
          <div className="text-xs text-slate-600 mt-0.5">Submit your payment proof and we'll verify within hours</div>
        </div>
        <Link to="/portal/loans" className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
          Pay Now <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
