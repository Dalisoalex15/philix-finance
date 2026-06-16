import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calculator, ArrowRight, Shield, Info, CheckCircle,
  TrendingUp, Calendar, CreditCard, AlertCircle,
} from "lucide-react";
import { mockLoanProducts, mockLtvConditionScale, type LoanProduct, type LoanProductRate } from "../../lib/mock-data";

const K = (n: number) =>
  `K${n.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ClientLoanCalculatorPage() {
  const activeProducts = useMemo(() => mockLoanProducts.filter(p => p.isActive), []);

  const [selectedProductId, setSelectedProductId] = useState<string>(activeProducts[0]?.id ?? "");
  const [selectedRateId,    setSelectedRateId]    = useState<string>(activeProducts[0]?.rates.filter(r => r.isActive)[0]?.id ?? "");
  const [amount,            setAmount]            = useState<number>(3000);
  const [amountInput,       setAmountInput]       = useState("3000");
  const [collateralEnabled, setCollateralEnabled] = useState(false);
  const [collCondition,     setCollCondition]     = useState("good");
  const [marketValue,       setMarketValue]       = useState(10000);

  const product: LoanProduct | undefined = activeProducts.find(p => p.id === selectedProductId);
  const activeRates: LoanProductRate[]   = product?.rates.filter(r => r.isActive) ?? [];
  const rate: LoanProductRate | undefined = activeRates.find(r => r.id === selectedRateId) ?? activeRates[0];

  const ltvRatio = product?.ltvMode === "product_override"
    ? (product.ltvOverrideValue ?? 60)
    : (mockLtvConditionScale.find(c => c.condition === collCondition)?.maxLtvRatio ?? 50);
  const maxFromCollateral = collateralEnabled && product ? marketValue * ltvRatio / 100 : Infinity;
  const effectiveMax = product ? Math.min(product.maxAmount, maxFromCollateral) : 0;
  const effectiveMin = product?.minAmount ?? 0;
  const clampedAmount = Math.min(Math.max(amount, effectiveMin), effectiveMax);

  const interest     = rate ? clampedAmount * rate.interestRate / 100 : 0;
  const processingFee = product
    ? product.processingFeeType === "percentage"
      ? clampedAmount * product.processingFee / 100
      : product.processingFee
    : 0;
  const totalRepayable = clampedAmount + interest + processingFee;
  const installmentCount = rate ? rate.durationValue : 1;
  const installmentLabel = rate?.durationUnit === "weeks" ? "Week" : "Month";
  const installmentAmount = totalRepayable / installmentCount;

  const dueDate = (() => {
    if (!rate) return "";
    const d = new Date();
    if (rate.durationUnit === "weeks") d.setDate(d.getDate() + rate.durationValue * 7);
    else d.setMonth(d.getMonth() + rate.durationValue);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  })();

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const p = activeProducts.find(x => x.id === id);
    if (p) {
      const firstActive = p.rates.filter(r => r.isActive)[0];
      if (firstActive) setSelectedRateId(firstActive.id);
      const clamped = Math.min(Math.max(amount, p.minAmount), p.maxAmount);
      setAmount(clamped);
      setAmountInput(clamped.toString());
    }
  };

  const handleAmountInput = (raw: string) => {
    setAmountInput(raw);
    const n = Number(raw.replace(/[^0-9]/g, ""));
    if (!isNaN(n) && n >= 0) setAmount(n);
  };

  const breakdownPct = {
    principal:  totalRepayable > 0 ? (clampedAmount / totalRepayable) * 100 : 0,
    interest:   totalRepayable > 0 ? (interest / totalRepayable) * 100 : 0,
    fee:        totalRepayable > 0 ? (processingFee / totalRepayable) * 100 : 0,
  };

  const isCollateralBlocking = collateralEnabled && clampedAmount > effectiveMax && effectiveMax < (product?.maxAmount ?? 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/50 via-slate-900 to-purple-900/20 border border-indigo-800/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center">
            <Calculator size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Loan Calculator</h1>
            <p className="text-xs text-slate-500">See your exact repayments before applying — no commitment required</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── Left: Inputs ─────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Step 1 — Choose product */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="font-semibold text-slate-200 text-sm">Choose a Loan Product</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeProducts.map(p => (
                <button key={p.id} onClick={() => handleProductChange(p.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${selectedProductId === p.id ? "bg-indigo-900/50 border-indigo-600 text-indigo-200" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-[10px] mt-0.5 text-slate-500">{K(p.minAmount)} – {K(p.maxAmount)}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {p.rates.filter(r => r.isActive).map(r => (
                      <span key={r.id} className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${selectedProductId === p.id ? "bg-indigo-800 text-indigo-300" : "bg-slate-700 text-slate-500"}`}>
                        {r.displayLabel}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Amount */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="font-semibold text-slate-200 text-sm">How much do you need?</h2>
            </div>
            {product && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-indigo-400">K</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={e => handleAmountInput(e.target.value)}
                    onBlur={() => {
                      const clamped = Math.min(Math.max(Number(amountInput) || effectiveMin, effectiveMin), effectiveMax);
                      setAmount(clamped);
                      setAmountInput(clamped.toString());
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                  />
                </div>
                <input
                  type="range"
                  min={product.minAmount}
                  max={Math.min(product.maxAmount, collateralEnabled ? effectiveMax : product.maxAmount)}
                  step={Math.max(100, Math.round(product.maxAmount / 100))}
                  value={clampedAmount}
                  onChange={e => { const n = Number(e.target.value); setAmount(n); setAmountInput(n.toString()); }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Min {K(product.minAmount)}</span>
                  <span>Max {K(Math.min(product.maxAmount, collateralEnabled ? effectiveMax : product.maxAmount))}</span>
                </div>
                {isCollateralBlocking && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-800/30 rounded-xl px-3 py-2">
                    <AlertCircle size={13} className="flex-shrink-0" />
                    Capped at {K(effectiveMax)} by your collateral value. Increase asset value or remove collateral constraint.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Step 3 — Duration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h2 className="font-semibold text-slate-200 text-sm">Choose repayment period</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {activeRates.map(r => (
                <button key={r.id} onClick={() => setSelectedRateId(r.id)}
                  className={`py-3 rounded-xl text-center transition-all border ${selectedRateId === r.id ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-600"}`}>
                  <div className={`text-lg font-black ${selectedRateId === r.id ? "text-white" : "text-slate-300"}`}>{r.durationValue}</div>
                  <div className="text-[9px] capitalize">{r.durationUnit.slice(0, -1)}{r.durationValue > 1 ? "s" : ""}</div>
                  <div className={`text-xs font-bold mt-1 ${selectedRateId === r.id ? "text-indigo-200" : "text-indigo-400"}`}>{r.interestRate}%</div>
                </button>
              ))}
            </div>
            {rate && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-800/60 rounded-xl px-3 py-2">
                <Info size={11} /> Flat rate: total = principal × (1 + {rate.interestRate}/100). Rate is locked at origination.
              </div>
            )}
          </div>

          {/* Step 4 — Optional Collateral */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                <h2 className="font-semibold text-slate-200 text-sm">Collateral (optional)</h2>
              </div>
              <button onClick={() => setCollateralEnabled(e => !e)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${collateralEnabled ? "bg-indigo-600" : "bg-slate-700"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${collateralEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {collateralEnabled ? (
              <div className="space-y-4">
                {product?.ltvMode === "product_override" ? (
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-800/30 rounded-xl px-3 py-2.5">
                    <Shield size={13} className="flex-shrink-0" />
                    <span>This product has a fixed <strong>{product.ltvOverrideValue}% LTV</strong> regardless of collateral condition — protects against electronics depreciation.</span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">Collateral Condition</label>
                    <select value={collCondition} onChange={e => setCollCondition(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {mockLtvConditionScale.map(c => (
                        <option key={c.condition} value={c.condition}>{c.label} — {c.maxLtvRatio}% LTV ({c.description})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Market Value</span>
                    <span className="text-slate-300 font-semibold font-mono">{K(marketValue)}</span>
                  </div>
                  <input type="range" min={500} max={200000} step={500} value={marketValue}
                    onChange={e => setMarketValue(Number(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-[10px] text-slate-700 mt-1"><span>K500</span><span>K200,000</span></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800 rounded-xl p-3">
                    <div className="text-slate-500">Market Value</div>
                    <div className="font-mono font-bold text-slate-200 mt-0.5">{K(marketValue)}</div>
                  </div>
                  <div className="bg-indigo-900/30 border border-indigo-800/40 rounded-xl p-3">
                    <div className="text-indigo-400">Max Loan ({ltvRatio}% LTV)</div>
                    <div className="font-mono font-bold text-indigo-300 mt-0.5">{K(maxFromCollateral === Infinity ? 0 : maxFromCollateral)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-800/40 rounded-xl px-4 py-3">
                <Shield size={14} className="text-slate-600 flex-shrink-0" />
                <span>Enable to see how collateral limits your maximum loan amount. All loans require collateral unless waived by a loan officer.</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── Right: Results ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gradient-to-b from-indigo-950 to-slate-950 border border-indigo-800/40 rounded-2xl p-5 sticky top-20 space-y-5">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Total Repayable</div>
              <div className="text-4xl font-black text-white">{K(totalRepayable)}</div>
              <div className="text-xs text-slate-500 mt-1">{product?.name ?? ""} · {rate?.displayLabel ?? ""}</div>
            </div>

            {/* Big installment pill */}
            <div className="bg-indigo-600/20 border border-indigo-600/40 rounded-xl p-4 text-center">
              <div className="text-xs text-indigo-400 mb-1">Per {installmentLabel}</div>
              <div className="text-3xl font-black text-indigo-300">{K(installmentAmount)}</div>
              <div className="text-[10px] text-slate-600 mt-1">× {installmentCount} {installmentLabel.toLowerCase()}s</div>
            </div>

            {/* Breakdown rows */}
            <div className="space-y-2 text-sm">
              {[
                { label: "Principal",      value: K(clampedAmount),   color: "text-slate-200" },
                { label: `Interest (${rate?.interestRate ?? 0}% flat)`, value: K(interest), color: "text-amber-400" },
                { label: `Processing Fee (${product?.processingFee ?? 0}${product?.processingFeeType === "percentage" ? "%" : "K"})`,
                  value: processingFee === 0 ? "Waived" : K(processingFee), color: "text-slate-400" },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-500 text-xs">{row.label}</span>
                  <span className={`font-mono font-semibold text-xs ${row.color}`}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold text-slate-300 text-xs">Total Repayable</span>
                <span className="font-mono font-black text-white text-sm">{K(totalRepayable)}</span>
              </div>
            </div>

            {/* Breakdown bar */}
            <div>
              <div className="text-[10px] text-slate-600 mb-1.5">Composition</div>
              <div className="h-3 flex rounded-full overflow-hidden">
                <div className="bg-indigo-600 transition-all" style={{ width: `${breakdownPct.principal}%` }} />
                <div className="bg-amber-500 transition-all" style={{ width: `${breakdownPct.interest}%` }} />
                <div className="bg-slate-600 transition-all" style={{ width: `${breakdownPct.fee}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                <span>■ Principal {breakdownPct.principal.toFixed(0)}%</span>
                <span>■ Interest {breakdownPct.interest.toFixed(0)}%</span>
                {breakdownPct.fee > 0 && <span>■ Fee {breakdownPct.fee.toFixed(0)}%</span>}
              </div>
            </div>

            {/* Due date */}
            {dueDate && (
              <div className="flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2.5 text-xs">
                <Calendar size={13} className="text-slate-500 flex-shrink-0" />
                <div>
                  <span className="text-slate-500">Final payment due: </span>
                  <span className="text-slate-300 font-semibold">{dueDate}</span>
                </div>
              </div>
            )}

            {/* Required docs */}
            {product && product.requiredDocuments.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wide mb-1.5">Required Documents</div>
                <div className="flex flex-wrap gap-1.5">
                  {product.requiredDocuments.map(d => (
                    <span key={d} className="flex items-center gap-1 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      <CheckCircle size={9} className="text-emerald-500" /> {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <Link to="/portal/apply"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-900/40">
              Apply for This Loan <ArrowRight size={14} />
            </Link>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-700 text-center">
              Estimates only. Actual terms are confirmed at origination. Rate locked at disbursement per §6.1.
            </p>
          </div>

          {/* Why Philix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400 mb-3">Why choose Philix Finance?</div>
            <div className="space-y-2">
              {[
                { icon: TrendingUp, text: "Fast 24–48h approval decision" },
                { icon: CreditCard, text: "No hidden fees — all costs shown upfront" },
                { icon: Shield,     text: "Your data is encrypted and private" },
                { icon: Calendar,   text: "Flexible repayment schedules" },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                    <f.icon size={12} className="text-indigo-400" />
                  </div>
                  <span className="text-xs text-slate-500">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
