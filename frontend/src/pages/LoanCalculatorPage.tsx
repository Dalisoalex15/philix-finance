import { useState } from "react";
import { Calculator, Info } from "lucide-react";

// §6.1 Flat Interest: Total = Principal × (1 + Rate/100)
function flatSchedule(principal: number, ratePercent: number, months: number, firstDate: Date) {
  const totalRepayable = principal * (1 + ratePercent / 100);
  const totalInterest = totalRepayable - principal;
  const installment = totalRepayable / months;
  const rows = [];
  let balance = totalRepayable;
  const d = new Date(firstDate);
  for (let i = 1; i <= months; i++) {
    const principalDue = principal / months;
    const interestDue = totalInterest / months;
    balance -= installment;
    rows.push({
      no: i,
      dueDate: new Date(d),
      principalDue: +principalDue.toFixed(2),
      interestDue: +interestDue.toFixed(2),
      totalDue: +installment.toFixed(2),
      balance: +Math.max(0, balance).toFixed(2),
    });
    d.setMonth(d.getMonth() + 1);
  }
  return { rows, totalRepayable: +totalRepayable.toFixed(2), totalInterest: +totalInterest.toFixed(2), installment: +installment.toFixed(2) };
}

// Reducing balance (for comparison)
function reducingSchedule(principal: number, monthlyRate: number, months: number, firstDate: Date) {
  const r = monthlyRate / 100;
  const installment = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const rows = [];
  let balance = principal;
  const d = new Date(firstDate);
  for (let i = 1; i <= months; i++) {
    const interestDue = balance * r;
    const principalDue = installment - interestDue;
    balance = Math.max(0, balance - principalDue);
    rows.push({
      no: i,
      dueDate: new Date(d),
      principalDue: +principalDue.toFixed(2),
      interestDue: +interestDue.toFixed(2),
      totalDue: +installment.toFixed(2),
      balance: +balance.toFixed(2),
    });
    d.setMonth(d.getMonth() + 1);
  }
  const totalRepayable = +(installment * months).toFixed(2);
  return { rows, totalRepayable, totalInterest: +(totalRepayable - principal).toFixed(2), installment: +installment.toFixed(2) };
}

const K = (n: number) => `K${n.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function LoanCalculatorPage() {
  const [method, setMethod] = useState<"flat" | "reducing">("flat");
  const [principal, setPrincipal]   = useState(5000);
  const [rate, setRate]             = useState(20);       // flat: total rate %; reducing: monthly %
  const [months, setMonths]         = useState(6);
  const [firstDate, setFirstDate]   = useState(() => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [showSchedule, setShowSchedule] = useState(false);

  const result = method === "flat"
    ? flatSchedule(principal, rate, months, new Date(firstDate))
    : reducingSchedule(principal, rate, months, new Date(firstDate));

  const rateLabel = method === "flat" ? "Flat Rate (%)" : "Monthly Interest Rate (%)";
  const rateHint  = method === "flat"
    ? "Applied once on the principal. Standard Philix Finance rate."
    : "Applied on reducing balance each month.";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Loan Calculator</h1>
          <p className="page-subtitle">Calculate repayment schedules using flat or reducing balance interest</p>
        </div>
      </div>

      {/* Method toggle */}
      <div className="philix-card p-5">
        <h3 className="section-title mb-3">Interest Method</h3>
        <div className="flex gap-3">
          {(["flat", "reducing"] as const).map(m => (
            <button key={m} type="button" onClick={() => setMethod(m)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl border text-sm font-semibold transition-all ${
                method === m
                  ? "bg-navy-900 text-white border-navy-900 shadow-md"
                  : "bg-white text-navy-600 border-warm-300 hover:border-navy-400"
              }`}>
              {m === "flat" ? "Flat Interest (Phase 1)" : "Reducing Balance (Phase 2)"}
            </button>
          ))}
        </div>
        {method === "flat" && (
          <div className="mt-3 flex items-start gap-2 text-xs text-gold-700 bg-gold-50 border border-gold-200 rounded-lg px-3 py-2">
            <Info size={13} className="mt-0.5 flex-shrink-0" />
            <span><strong>Flat interest</strong> — Total Repayment = Principal × (1 + Rate / 100). Philix Finance Phase 1 standard.</span>
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className="philix-card p-5">
        <h3 className="section-title mb-4">Loan Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="input-label">Principal Amount (K)</label>
            <input type="number" min={100} step={100} className="input-base font-mono" value={principal}
              onChange={e => setPrincipal(Number(e.target.value))} />
          </div>
          <div>
            <label className="input-label">{rateLabel}</label>
            <input type="number" min={0.1} max={method === "flat" ? 200 : 30} step={0.5} className="input-base font-mono" value={rate}
              onChange={e => setRate(Number(e.target.value))} />
            <p className="text-[10px] text-navy-400 mt-1">{rateHint}</p>
          </div>
          <div>
            <label className="input-label">Term (Months)</label>
            <input type="number" min={1} max={60} className="input-base font-mono" value={months}
              onChange={e => setMonths(Number(e.target.value))} />
          </div>
          <div>
            <label className="input-label">First Payment Date</label>
            <input type="date" className="input-base" value={firstDate}
              onChange={e => setFirstDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Principal", value: K(principal), color: "text-navy-900" },
          { label: "Total Interest", value: K(result.totalInterest), color: "text-gold-700" },
          { label: "Total Repayable", value: K(result.totalRepayable), color: "text-navy-900", big: true },
          { label: "Monthly Instalment", value: K(result.installment), color: "text-emerald-700", big: true },
        ].map(s => (
          <div key={s.label} className={`philix-card p-4 text-center ${s.big ? "border-gold-300 bg-gold-50" : ""}`}>
            <div className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-navy-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Interest breakdown bar */}
      <div className="philix-card p-5">
        <div className="flex items-center justify-between mb-2 text-xs font-medium text-navy-600">
          <span>Principal: {K(principal)}</span>
          <span className="text-gold-700">Interest: {K(result.totalInterest)} ({((result.totalInterest / result.totalRepayable) * 100).toFixed(1)}%)</span>
        </div>
        <div className="h-4 bg-warm-200 rounded-full overflow-hidden flex">
          <div className="h-full bg-navy-900 rounded-l-full transition-all" style={{ width: `${(principal / result.totalRepayable) * 100}%` }} />
          <div className="h-full bg-gold-500 rounded-r-full transition-all" style={{ width: `${(result.totalInterest / result.totalRepayable) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs text-navy-600"><span className="w-3 h-3 rounded-full bg-navy-900 inline-block" /> Principal</span>
          <span className="flex items-center gap-1 text-xs text-gold-700"><span className="w-3 h-3 rounded-full bg-gold-500 inline-block" /> Interest</span>
        </div>
      </div>

      {/* Repayment schedule toggle */}
      <div className="philix-card overflow-hidden">
        <button onClick={() => setShowSchedule(!showSchedule)}
          className="w-full flex items-center justify-between p-5 hover:bg-warm-50 transition-colors">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-navy-500" />
            <span className="font-semibold text-navy-800">Repayment Schedule ({months} instalments)</span>
          </div>
          <span className="text-xs text-navy-400 bg-warm-100 px-2 py-1 rounded-lg">
            {showSchedule ? "Hide" : "Show"}
          </span>
        </button>

        {showSchedule && (
          <div className="border-t border-warm-200 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th className="text-right">Principal</th>
                  <th className="text-right">Interest</th>
                  <th className="text-right">Total Due</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map(row => (
                  <tr key={row.no} className="table-row-hover">
                    <td className="text-navy-400">{row.no}</td>
                    <td className="text-navy-700">{fmtDate(row.dueDate)}</td>
                    <td className="text-right amount">{K(row.principalDue)}</td>
                    <td className="text-right font-mono text-gold-700">{K(row.interestDue)}</td>
                    <td className="text-right amount font-bold">{K(row.totalDue)}</td>
                    <td className="text-right font-mono text-navy-500">{K(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-warm-300">
                  <td colSpan={2} className="px-4 py-3 font-bold text-navy-800">Totals</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-navy-900">{K(principal)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-gold-700">{K(result.totalInterest)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-navy-900">{K(result.totalRepayable)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Formula reference (§6.1) */}
      {method === "flat" && (
        <div className="philix-card p-5 bg-navy-900 text-white border-navy-800">
          <h4 className="font-semibold text-gold-400 mb-3" style={{ fontFamily: "Fraunces, serif" }}>Flat Interest Formula (§6.1)</h4>
          <div className="font-mono text-sm space-y-1 text-navy-200">
            <div>Total Repayable  = Principal × (1 + Rate / 100)</div>
            <div>Monthly Instalment = Total Repayable ÷ Term (months)</div>
            <div>Remaining Balance = Total Repayable − Payments Made</div>
          </div>
          <div className="mt-3 p-3 bg-navy-800 rounded-lg font-mono text-sm text-gold-300">
            Example: K{principal.toLocaleString()} × (1 + {rate}/100) = {K(result.totalRepayable)} ÷ {months}mo = {K(result.installment)}/mo
          </div>
        </div>
      )}
    </div>
  );
}
