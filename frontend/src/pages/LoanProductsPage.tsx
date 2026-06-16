import { useState } from "react";
import {
  Package, Edit3, CheckCircle, Calculator, Plus, X, Shield,
  AlertTriangle, Info, ToggleLeft, ToggleRight, Copy, History,
  Trash2, ChevronDown, ChevronUp, GraduationCap, Briefcase, User,
} from "lucide-react";
import { mockLoanProducts, mockLtvConditionScale, formatKwacha, type LoanProduct, type LoanProductRate } from "../lib/mock-data";

const K = (n: number) =>
  `K${n.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLLATERAL_TYPES = [
  { label: "Laptop",        fsv: 60 },
  { label: "Smartphone",    fsv: 55 },
  { label: "TV / Screen",   fsv: 50 },
  { label: "Fridge",        fsv: 50 },
  { label: "Motor Vehicle", fsv: 65 },
  { label: "Land Title",    fsv: 70 },
  { label: "Other Asset",   fsv: 50 },
];

const PRODUCT_TYPES = ["STUDENT","SALARY_ADVANCE","BUSINESS","ELECTRONICS_EQUITY","LOYALTY","PREMIUM","MARKET_TRADER","ENTREPRENEUR"];
const ALL_DOCS = ["NRC","Student ID","Payslip","Employment Letter","Trade Licence or Witness Letter","Purchase Receipt or Proof of Ownership","Bank Statement"];
const ALL_CAMPUSES = ["UNZA","CBU","UNILUS"];

function typeIcon(t: string) {
  if (t === "STUDENT") return GraduationCap;
  if (t === "CIVIL_SERVANT") return Briefcase;
  return Package;
}

// ─── NEW RATE ROW ─────────────────────────────────────────────────────────────
function newRate(order: number): LoanProductRate {
  return {
    id: `r-${Date.now()}-${order}`,
    durationValue: order,
    durationUnit: "weeks",
    interestRate: 10,
    displayLabel: `${order} Week${order > 1 ? "s" : ""}`,
    isActive: true,
    displayOrder: order,
  };
}

// ─── BLANK PRODUCT ───────────────────────────────────────────────────────────
function blankProduct(): LoanProduct {
  return {
    id: `prod-${Date.now()}`,
    slug: "",
    name: "",
    productType: "STUDENT",
    targetBorrower: "",
    isActive: true,
    description: "",
    interestType: "flat",
    minAmount: 100,
    maxAmount: 10000,
    processingFeeType: "percentage",
    processingFee: 0,
    penaltyRate: 5,
    penaltyPeriod: "per_week",
    gracePeriodDays: 3,
    collateralRequired: true,
    ltvMode: "condition_based",
    ltvOverrideValue: null,
    eligibilityRules: null,
    eligibleCampuses: [],
    requiredDocuments: ["NRC"],
    autoRenewal: false,
    displayOrder: 99,
    rates: [
      newRate(1), newRate(2), newRate(3), newRate(4),
    ],
    auditLog: [],
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };
}

// ─── PRODUCT MODAL (create / edit) ───────────────────────────────────────────
function ProductModal({ product, onSave, onClose }: {
  product: LoanProduct;
  onSave: (p: LoanProduct) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<LoanProduct>({
    ...product,
    rates: product.rates.map(r => ({ ...r })),
    eligibleCampuses: [...product.eligibleCampuses],
    requiredDocuments: [...product.requiredDocuments],
  });
  const isNew = !mockLoanProducts.find(p => p.id === product.id);

  const f = <K extends keyof LoanProduct>(key: K, val: LoanProduct[K]) =>
    setForm(p => ({ ...p, [key]: val }));

  const setRate = (id: string, field: keyof LoanProductRate, val: string | number | boolean) =>
    setForm(p => ({ ...p, rates: p.rates.map(r => r.id === id ? { ...r, [field]: val } : r) }));

  const addRate = () => setForm(p => ({
    ...p, rates: [...p.rates, newRate(p.rates.length + 1)],
  }));

  const removeRate = (id: string) => setForm(p => ({
    ...p, rates: p.rates.filter(r => r.id !== id),
  }));

  const toggleDoc = (doc: string) => setForm(p => ({
    ...p,
    requiredDocuments: p.requiredDocuments.includes(doc)
      ? p.requiredDocuments.filter(d => d !== doc)
      : [...p.requiredDocuments, doc],
  }));

  const toggleCampus = (c: string) => setForm(p => ({
    ...p,
    eligibleCampuses: p.eligibleCampuses.includes(c)
      ? p.eligibleCampuses.filter(x => x !== c)
      : [...p.eligibleCampuses, c],
  }));

  const handleSave = () => {
    const log = { action: isNew ? "created" : "updated", field: "product", oldValue: product.name, newValue: form.name, changedBy: "Daliso (CEO)", changedAt: new Date().toISOString() };
    onSave({ ...form, slug: form.name.toLowerCase().replace(/\s+/g, "-"), updatedAt: new Date().toISOString().split("T")[0], auditLog: [...form.auditLog, log] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200 bg-navy-900 rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "Fraunces, serif" }}>
              {isNew ? "New Loan Product" : `Edit: ${product.name}`}
            </h2>
            <p className="text-xs text-navy-300 mt-0.5">Changes apply to new loans only — existing loans are locked to original rate</p>
          </div>
          <button onClick={onClose} className="text-navy-300 hover:text-white p-1 rounded-lg hover:bg-navy-800"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <section>
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="input-label">Product Name *</label>
                <input className="input-base" value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Student Loan" />
              </div>
              <div>
                <label className="input-label">Product Type</label>
                <select className="input-base" value={form.productType} onChange={e => f("productType", e.target.value)}>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Target Borrower</label>
                <input className="input-base" value={form.targetBorrower} onChange={e => f("targetBorrower", e.target.value)} placeholder="Who this product is for" />
              </div>
              <div className="col-span-2">
                <label className="input-label">Description</label>
                <textarea className="input-base resize-none h-16 text-sm" value={form.description} onChange={e => f("description", e.target.value)} />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="button" onClick={() => f("isActive", !form.isActive)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${form.isActive ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-warm-100 border-warm-300 text-navy-400"}`}>
                  {form.isActive ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} />}
                  {form.isActive ? "Active" : "Inactive"}
                </button>
                <button type="button" onClick={() => f("autoRenewal", !form.autoRenewal)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${form.autoRenewal ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-warm-100 border-warm-300 text-navy-400"}`}>
                  {form.autoRenewal ? <ToggleRight size={16} className="text-blue-600" /> : <ToggleLeft size={16} />}
                  Auto-Renewal {form.autoRenewal ? "On" : "Off"}
                </button>
              </div>
            </div>
          </section>

          {/* Financial Terms */}
          <section>
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">Financial Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Min Loan Amount (K)</label>
                <input type="number" className="input-base font-mono" value={form.minAmount} onChange={e => f("minAmount", Number(e.target.value))} />
              </div>
              <div>
                <label className="input-label">Max Loan Amount (K)</label>
                <input type="number" className="input-base font-mono" value={form.maxAmount} onChange={e => f("maxAmount", Number(e.target.value))} />
              </div>
              <div>
                <label className="input-label">Interest Type</label>
                <select className="input-base" value={form.interestType} onChange={e => f("interestType", e.target.value as "flat" | "reducing")}>
                  <option value="flat">Flat (§6.1 — Phase 1)</option>
                  <option value="reducing">Reducing Balance (§6.2 — Phase 2)</option>
                </select>
              </div>
              <div>
                <label className="input-label">Processing Fee Type</label>
                <select className="input-base" value={form.processingFeeType} onChange={e => f("processingFeeType", e.target.value as "percentage" | "fixed")}>
                  <option value="percentage">% of Principal</option>
                  <option value="fixed">Fixed Kwacha Amount</option>
                </select>
              </div>
              <div>
                <label className="input-label">Processing Fee {form.processingFeeType === "percentage" ? "(%)" : "(K)"}</label>
                <input type="number" step={0.1} min={0} className="input-base font-mono" value={form.processingFee} onChange={e => f("processingFee", Number(e.target.value))} />
                {form.processingFee === 0 && <p className="text-[10px] text-emerald-600 mt-1">✓ Fee waived</p>}
              </div>
              <div>
                <label className="input-label">Late Penalty Rate (%)</label>
                <input type="number" step={0.5} min={0} className="input-base font-mono" value={form.penaltyRate} onChange={e => f("penaltyRate", Number(e.target.value))} />
              </div>
              <div>
                <label className="input-label">Penalty Period</label>
                <select className="input-base" value={form.penaltyPeriod} onChange={e => f("penaltyPeriod", e.target.value as LoanProduct["penaltyPeriod"])}>
                  <option value="per_day">Per Day</option>
                  <option value="per_week">Per Week</option>
                  <option value="per_month">Per Month</option>
                </select>
              </div>
              <div>
                <label className="input-label">Grace Period (Days, 0–14)</label>
                <input type="number" min={0} max={14} className="input-base font-mono" value={form.gracePeriodDays} onChange={e => f("gracePeriodDays", Number(e.target.value))} />
              </div>
            </div>
          </section>

          {/* Collateral */}
          <section>
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">Collateral Rules</h3>
            <div className="space-y-3">
              <button type="button" onClick={() => f("collateralRequired", !form.collateralRequired)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${form.collateralRequired ? "bg-navy-50 border-navy-300 text-navy-700" : "bg-warm-100 border-warm-300 text-navy-400"}`}>
                <Shield size={15} /> Collateral {form.collateralRequired ? "Required" : "Optional"}
              </button>
              {form.collateralRequired && (
                <div className="space-y-3">
                  <div>
                    <label className="input-label">LTV Mode</label>
                    <div className="flex gap-2">
                      {(["condition_based","product_override"] as const).map(mode => (
                        <button key={mode} type="button"
                          onClick={() => f("ltvMode", mode)}
                          className={`flex-1 py-2 text-xs rounded-xl border font-semibold transition-all ${form.ltvMode === mode ? "bg-navy-900 text-white border-navy-900" : "bg-warm-100 border-warm-300 text-navy-500 hover:border-navy-400"}`}>
                          {mode === "condition_based" ? "Condition-Based (Excellent→Poor)" : "Product Override (Fixed %)"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.ltvMode === "condition_based" && (
                    <div className="flex items-start gap-2 text-xs text-navy-600 bg-warm-50 border border-warm-200 rounded-lg px-3 py-2">
                      <Info size={12} className="mt-0.5 flex-shrink-0" />
                      <span>LTV set by collateral condition at origination: Excellent 70% · Good 60% · Fair 50% · Poor 40%</span>
                    </div>
                  )}
                  {form.ltvMode === "product_override" && (
                    <div>
                      <label className="input-label">Override LTV %</label>
                      <div className="flex items-center gap-4">
                        <input type="range" min={10} max={90} step={5} value={form.ltvOverrideValue ?? 60} onChange={e => f("ltvOverrideValue", Number(e.target.value))} className="flex-1" />
                        <span className="text-2xl font-bold font-mono text-navy-900 w-16 text-center">{form.ltvOverrideValue ?? 60}%</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-gold-700 bg-gold-50 border border-gold-200 rounded-lg px-3 py-2 mt-2">
                        <Info size={12} className="mt-0.5 flex-shrink-0" />
                        <span>Fixed at {form.ltvOverrideValue ?? 60}% regardless of collateral condition — market value K10,000 → max loan <strong>{K(10000 * (form.ltvOverrideValue ?? 60) / 100)}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Eligible Campuses */}
          <section>
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Eligible Campuses</h3>
            <p className="text-xs text-navy-400 mb-3">Leave all unchecked to allow any campus / non-student borrowers</p>
            <div className="flex gap-2">
              {ALL_CAMPUSES.map(c => (
                <button key={c} type="button" onClick={() => toggleCampus(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${form.eligibleCampuses.includes(c) ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-600 border-warm-300 hover:border-navy-400"}`}>
                  {c}
                </button>
              ))}
            </div>
          </section>

          {/* Required Documents */}
          <section>
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-3">Required Documents</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_DOCS.map(doc => (
                <button key={doc} type="button" onClick={() => toggleDoc(doc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.requiredDocuments.includes(doc) ? "bg-gold-500 text-navy-950 border-gold-500" : "bg-white text-navy-500 border-warm-300 hover:border-gold-400"}`}>
                  {form.requiredDocuments.includes(doc) ? "✓ " : ""}{doc}
                </button>
              ))}
            </div>
          </section>

          {/* Rate Tiers */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wider">Rate Tiers</h3>
                <p className="text-xs text-navy-400 mt-0.5">Flat: Total = Principal × (1 + Rate/100) · Rate locked at origination</p>
              </div>
              <button type="button" onClick={addRate} className="flex items-center gap-1 text-xs font-semibold text-gold-700 bg-gold-50 border border-gold-200 px-3 py-1.5 rounded-lg hover:bg-gold-100 transition-colors">
                <Plus size={12} /> Add Tier
              </button>
            </div>
            <div className="space-y-2">
              {form.rates.map((rate, i) => (
                <div key={rate.id} className="flex items-center gap-3 bg-warm-50 border border-warm-200 rounded-xl px-4 py-3">
                  <div className="text-xs text-navy-400 w-5 text-center">{i + 1}</div>
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <div>
                      <div className="text-[9px] text-navy-400 uppercase mb-1">Duration</div>
                      <input type="number" min={1} value={rate.durationValue} onChange={e => { const v = Number(e.target.value); setRate(rate.id, "durationValue", v); setRate(rate.id, "displayLabel", `${v} ${rate.durationUnit === "weeks" ? (v === 1 ? "Week" : "Weeks") : (v === 1 ? "Month" : "Months")}`); }}
                        className="w-full border border-warm-300 rounded-lg px-2 py-1.5 text-sm font-mono text-navy-800 focus:outline-none focus:border-gold-500" />
                    </div>
                    <div>
                      <div className="text-[9px] text-navy-400 uppercase mb-1">Unit</div>
                      <select value={rate.durationUnit} onChange={e => setRate(rate.id, "durationUnit", e.target.value)}
                        className="w-full border border-warm-300 rounded-lg px-2 py-1.5 text-sm text-navy-800 focus:outline-none focus:border-gold-500">
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-[9px] text-navy-400 uppercase mb-1">Interest Rate</div>
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} step={0.5} value={rate.interestRate} onChange={e => setRate(rate.id, "interestRate", Number(e.target.value))}
                          className="w-full border border-warm-300 rounded-lg px-2 py-1.5 text-sm font-mono font-bold text-gold-700 focus:outline-none focus:border-gold-500" />
                        <span className="text-gold-700 font-bold text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-navy-400 uppercase mb-1">Example (K5,000)</div>
                      <div className="text-sm font-mono font-semibold text-navy-700 py-1.5">{K(5000 * (1 + rate.interestRate / 100))}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setRate(rate.id, "isActive", !rate.isActive)}
                    className={`text-xs px-2 py-1 rounded-lg border ${rate.isActive ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-navy-400 border-warm-200 bg-warm-100"}`}>
                    {rate.isActive ? "On" : "Off"}
                  </button>
                  <button type="button" onClick={() => removeRate(rate.id)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-warm-200 flex gap-3 justify-end bg-warm-50 rounded-b-2xl sticky bottom-0">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={!form.name}>
            <CheckCircle size={15} /> {isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUDIT LOG PANEL ─────────────────────────────────────────────────────────
function AuditPanel({ log, onClose }: { log: LoanProduct["auditLog"]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200 bg-navy-900 rounded-t-2xl">
          <h3 className="font-bold text-white" style={{ fontFamily: "Fraunces, serif" }}>Product Change Audit Log</h3>
          <button onClick={onClose} className="text-navy-300 hover:text-white"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto max-h-96 divide-y divide-warm-100">
          {log.length === 0 ? (
            <p className="text-center text-navy-400 text-sm py-8">No changes recorded yet</p>
          ) : (
            [...log].reverse().map((entry, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    entry.action === "created" ? "bg-emerald-100 text-emerald-700" :
                    entry.action === "updated" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                  }`}>{entry.action.toUpperCase()}</span>
                  <span className="text-[10px] text-navy-400 font-mono">{new Date(entry.changedAt).toLocaleString("en-GB")}</span>
                </div>
                <div className="text-xs text-navy-700 font-medium">{entry.field}</div>
                {entry.oldValue && <div className="text-[10px] text-navy-400 mt-0.5">
                  <span className="text-red-500">{entry.oldValue}</span> → <span className="text-emerald-600">{entry.newValue}</span>
                </div>}
                <div className="text-[10px] text-navy-500 mt-0.5">by {entry.changedBy}{entry.reason ? ` · ${entry.reason}` : ""}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LoanProductsPage() {
  const [products, setProducts] = useState<LoanProduct[]>(mockLoanProducts);
  const [modal, setModal] = useState<LoanProduct | null>(null);
  const [auditProduct, setAuditProduct] = useState<LoanProduct | null>(null);
  const [expanded, setExpanded] = useState<string | null>("prod-001");

  // Collateral calculator
  const [collCondition, setCollCondition] = useState("good");
  const [collMarket,    setCollMarket]    = useState(10000);
  const [collProdId,    setCollProdId]    = useState("prod-001");
  const [collTierId,    setCollTierId]    = useState("r001-4");

  const selProd   = products.find(p => p.id === collProdId) ?? products[0];
  const selTier   = selProd.rates.find(r => r.id === collTierId) ?? selProd.rates[0];
  const ltvRatio  = selProd.ltvMode === "product_override"
    ? (selProd.ltvOverrideValue ?? 60)
    : (mockLtvConditionScale.find(c => c.condition === collCondition)?.maxLtvRatio ?? 50);
  const maxLoan   = Math.min(collMarket * ltvRatio / 100, selProd.maxAmount);
  const cappedLoan= Math.max(Math.min(maxLoan, selProd.maxAmount), selProd.minAmount);
  const interest  = cappedLoan * selTier.interestRate / 100;
  const fee       = selProd.processingFeeType === "percentage" ? cappedLoan * selProd.processingFee / 100 : selProd.processingFee;
  const totalRep  = cappedLoan + interest + fee;
  const weeklyPay = totalRep / selTier.durationValue;

  const saveProduct = (p: LoanProduct) =>
    setProducts(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]);

  const cloneProduct = (p: LoanProduct) => {
    const clone = { ...p, id: `prod-${Date.now()}`, slug: "", name: `${p.name} (Copy)`, isActive: false, auditLog: [], rates: p.rates.map(r => ({ ...r, id: `r-${Date.now()}-${r.displayOrder}` })) };
    setModal(clone);
  };

  const toggleActive = (id: string) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString().split("T")[0] } : p));

  return (
    <div className="space-y-6">
      {modal       && <ProductModal product={modal}        onSave={saveProduct} onClose={() => setModal(null)} />}
      {auditProduct && <AuditPanel  log={auditProduct.auditLog} onClose={() => setAuditProduct(null)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Loan Products</h1>
          <p className="page-subtitle">Configure rates, fees and collateral policy · Changes apply to new loans only · All edits are audit logged</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(blankProduct())}>
          <Plus size={15} /> New Product
        </button>
      </div>

      {/* Summary ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Products",       value: products.filter(p => p.isActive).length.toString() },
          { label: "Total Rate Tiers",      value: products.reduce((s,p) => s + p.rates.filter(r => r.isActive).length, 0).toString() },
          { label: "Universal Max LTV",     value: "50% FSV" },
          { label: "Rate Locked At",        value: "Origination" },
        ].map(s => (
          <div key={s.label} className="philix-card p-4 text-center">
            <div className="text-xl font-bold font-mono text-navy-900">{s.value}</div>
            <div className="text-xs text-navy-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Product list */}
        <div className="xl:col-span-2 space-y-3">
          {products.sort((a,b) => a.displayOrder - b.displayOrder).map(prod => {
            const Icon = typeIcon(prod.productType);
            const isExpanded = expanded === prod.id;
            return (
              <div key={prod.id} className={`philix-card overflow-hidden transition-all ${!prod.isActive ? "opacity-60" : ""}`}>
                {/* Header */}
                <div className="p-4 flex items-center gap-3 bg-warm-50 border-b border-warm-200">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${prod.isActive ? "bg-navy-900" : "bg-warm-300"}`}>
                    <Icon size={16} className={prod.isActive ? "text-gold-400" : "text-navy-400"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy-900" style={{ fontFamily: "Fraunces, serif" }}>{prod.name}</div>
                    <div className="text-xs text-navy-400 truncate">{prod.targetBorrower}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prod.isActive ? "bg-emerald-100 text-emerald-700" : "bg-warm-200 text-navy-400"}`}>
                      {prod.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <button onClick={() => setAuditProduct(prod)} title="Audit log" className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-warm-200 rounded-lg transition-colors"><History size={14} /></button>
                    <button onClick={() => cloneProduct(prod)} title="Clone" className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-warm-200 rounded-lg transition-colors"><Copy size={14} /></button>
                    <button onClick={() => toggleActive(prod.id)} title={prod.isActive ? "Deactivate" : "Activate"} className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-warm-200 rounded-lg transition-colors">
                      {prod.isActive ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} />}
                    </button>
                    <button onClick={() => setModal(prod)} className="btn-secondary py-1.5 px-3 text-xs"><Edit3 size={12} /> Edit</button>
                    <button onClick={() => setExpanded(isExpanded ? null : prod.id)} className="p-1.5 text-navy-400 hover:bg-warm-200 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {/* Rate tiers */}
                    <div>
                      <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-2">Rate Schedule (Flat Interest · §6.1)</div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {prod.rates.filter(r => r.isActive).map(rate => (
                          <div key={rate.id} className="bg-warm-50 border border-warm-200 rounded-xl p-2.5 text-center">
                            <div className="text-lg font-bold font-mono text-gold-700">{rate.interestRate}%</div>
                            <div className="text-[10px] text-navy-500 font-medium">{rate.displayLabel}</div>
                            <div className="text-[9px] text-navy-300 mt-1 font-mono">{K(1000 * (1 + rate.interestRate / 100))}</div>
                            <div className="text-[8px] text-navy-300">on K1,000</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Config grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {[
                        { label: "Min Loan",       value: K(prod.minAmount) },
                        { label: "Max Loan",       value: K(prod.maxAmount) },
                        { label: "Processing Fee", value: prod.processingFee === 0 ? "Waived" : `${prod.processingFee}% ${prod.processingFeeType === "fixed" ? "(fixed)" : ""}` },
                        { label: "Late Penalty",   value: `${prod.penaltyRate}% ${prod.penaltyPeriod.replace(/_/g, " ")}` },
                        { label: "Grace Period",   value: `${prod.gracePeriodDays} days` },
                        { label: "Collateral",     value: prod.collateralRequired ? `Required (${prod.ltvMode === "product_override" ? `${prod.ltvOverrideValue}% fixed` : "Condition-based"})` : "Optional" },
                        { label: "Interest Type",  value: prod.interestType === "flat" ? "Flat (§6.1)" : "Reducing" },
                        { label: "Auto-Renewal",   value: prod.autoRenewal ? "Yes" : "No" },
                      ].map(d => (
                        <div key={d.label} className="bg-warm-50 rounded-lg px-3 py-2">
                          <div className="text-[9px] text-navy-400 uppercase tracking-wide">{d.label}</div>
                          <div className="text-xs font-semibold text-navy-800 mt-0.5">{d.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Documents + Campuses */}
                    <div className="flex flex-wrap gap-3">
                      {prod.eligibleCampuses.length > 0 && (
                        <div>
                          <div className="text-[9px] text-navy-400 uppercase font-bold mb-1.5">Eligible Campuses</div>
                          <div className="flex gap-1.5">{prod.eligibleCampuses.map(c => <span key={c} className="text-xs bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full font-semibold">{c}</span>)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[9px] text-navy-400 uppercase font-bold mb-1.5">Required Documents</div>
                        <div className="flex gap-1.5 flex-wrap">{prod.requiredDocuments.map(d => <span key={d} className="text-xs bg-gold-100 text-gold-800 px-2 py-0.5 rounded-full font-semibold">{d}</span>)}</div>
                      </div>
                    </div>

                    {/* Collateral rule */}
                    {prod.collateralRequired && (
                      <div className="flex items-center gap-2 text-xs bg-navy-900 text-navy-200 rounded-xl px-4 py-3">
                        <Shield size={13} className="text-gold-400 flex-shrink-0" />
                        {prod.ltvMode === "product_override"
                          ? <span>LTV fixed at <span className="text-gold-400 font-semibold">{prod.ltvOverrideValue}%</span> of market value regardless of condition · K10,000 device → max loan <span className="text-gold-400 font-semibold">{K(10000 * (prod.ltvOverrideValue ?? 60) / 100)}</span></span>
                          : <span>LTV by condition — Excellent <span className="text-gold-400 font-semibold">70%</span> · Good <span className="text-gold-400 font-semibold">60%</span> · Fair <span className="text-gold-400 font-semibold">50%</span> · Poor <span className="text-gold-400 font-semibold">40%</span> of market value</span>
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Collateral calculator */}
          <div className="philix-card p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
                <Calculator size={14} className="text-gold-400" />
              </div>
              <div>
                <h3 className="section-title leading-none">Collateral Calculator</h3>
                <p className="text-[10px] text-navy-400 mt-0.5">Max loan from asset forced sale value</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="input-label">Collateral Condition</label>
                <select className="input-base text-sm" value={collCondition} onChange={e => setCollCondition(e.target.value)}>
                  {mockLtvConditionScale.map(c => <option key={c.condition} value={c.condition}>{c.label} — {c.maxLtvRatio}% LTV</option>)}
                </select>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="input-label m-0">Market Value</label>
                  <span className="font-mono font-bold text-navy-700">{K(collMarket)}</span>
                </div>
                <input type="range" min={500} max={200000} step={500} value={collMarket} onChange={e => setCollMarket(Number(e.target.value))} className="w-full" />
              </div>
              <div className="bg-warm-100 border border-warm-200 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-navy-500">Market Value</span><span className="font-mono font-semibold text-navy-800">{K(collMarket)}</span></div>
                {selProd.ltvMode === "product_override"
                  ? <div className="flex justify-between"><span className="text-navy-500">LTV (Fixed Override)</span><span className="font-mono font-semibold text-navy-800">{ltvRatio}%</span></div>
                  : <div className="flex justify-between"><span className="text-navy-500">LTV (Condition: {mockLtvConditionScale.find(c => c.condition === collCondition)?.label})</span><span className="font-mono font-semibold text-navy-800">{ltvRatio}%</span></div>
                }
                <div className="h-px bg-warm-300" />
                <div className="flex justify-between"><span className="font-semibold text-navy-700">Max Loan ({ltvRatio}% LTV)</span><span className="font-mono font-bold text-gold-700">{K(maxLoan)}</span></div>
              </div>
              <div>
                <label className="input-label">Product</label>
                <select className="input-base text-sm" value={collProdId} onChange={e => { setCollProdId(e.target.value); const p = products.find(x => x.id === e.target.value); if (p) setCollTierId(p.rates[0]?.id ?? ""); }}>
                  {products.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label mb-2 block">Duration</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {selProd.rates.filter(r => r.isActive).map(r => (
                    <button key={r.id} onClick={() => setCollTierId(r.id)}
                      className={`py-2 text-xs rounded-xl font-bold transition-all border ${collTierId === r.id ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-600 border-warm-300 hover:border-navy-400"}`}>
                      {r.displayLabel}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-warm-200 pt-3 space-y-2 text-xs">
                {[
                  { label: "Principal",                     value: K(cappedLoan) },
                  { label: `Interest (${selTier.interestRate}% flat)`, value: K(interest),   gold: true },
                  { label: `Processing Fee (${selProd.processingFee}${selProd.processingFeeType === "percentage" ? "%" : "K"})`, value: fee === 0 ? "Waived" : K(fee) },
                  { label: "Total Repayable",               value: K(totalRep),    bold: true },
                  { label: `Per ${selTier.durationUnit === "weeks" ? "Week" : "Month"} ÷${selTier.durationValue}`, value: K(weeklyPay), emerald: true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-navy-400">{row.label}</span>
                    <span className={`font-mono font-semibold ${row.bold ? "text-navy-900 text-sm" : row.gold ? "text-gold-700" : row.emerald ? "text-emerald-700" : "text-navy-700"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-navy-900 rounded-xl p-4 text-center">
                <div className="text-[10px] text-navy-400 mb-1">Client repays per {selTier.durationUnit === "weeks" ? "week" : "month"}</div>
                <div className="text-2xl font-bold font-mono text-gold-400">{K(weeklyPay)}</div>
                <div className="text-[10px] text-navy-400 mt-1">for {selTier.displayLabel}</div>
              </div>
            </div>
          </div>

          {/* Capital protection callout */}
          <div className="philix-card p-4 border-l-4 border-gold-500">
            <div className="flex items-start gap-3">
              <AlertTriangle size={15} className="text-gold-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-navy-800" style={{ fontFamily: "Fraunces, serif" }}>Capital Protection Policy</div>
                <div className="text-xs text-navy-500 mt-1 space-y-1">
                  <p>All loans capped at <strong>50% of Forced Sale Value</strong> of collateral.</p>
                  <p className="text-gold-700 font-medium">Philix Finance can recover 100% of the loan even by selling collateral at below-market forced sale prices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
