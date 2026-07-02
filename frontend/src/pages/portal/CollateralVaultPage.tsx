// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import {
  Shield, CheckCircle, Clock, AlertCircle, Plus, X, Upload,
  RefreshCw, TrendingUp, Package, Eye, ChevronDown, ChevronUp,
  Loader2, Award, Star,
} from "lucide-react";

function portalToken() { return localStorage.getItem("philix_portal_token") ?? ""; }
function portalH(json?: boolean) {
  const h: Record<string, string> = { Authorization: `Bearer ${portalToken()}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

const K = (n: number) => `K${Number(n ?? 0).toLocaleString("en-ZM", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

interface VaultItem {
  id: string;
  reference: string;
  productType: string;
  status: string;
  createdAt: string;
  collateralType: string | null;
  collateralDesc: string | null;
  collateralValue: number | null;
  collateralCondition: string | null;
  collateralSerial: string | null;
  collateralOwner: string | null;
  collateralYear: string | null;
  hasOwnershipDocs: boolean;
  hasInsurance: boolean;
  collateralPhotos: string | null;
  marketValue: number | null;
  forcedSaleValue: number | null;
  lendingValue: number | null;
  riskScore: number | null;
  riskCategory: string | null;
  repossessionScore: string | null;
  staffMarketValue: number | null;
  staffValuedBy: string | null;
  staffValuedAt: string | null;
  vaultStatus: string | null;
  amountRequested: number;
}

interface LoanForSelect { id: string; reference: string; status: string; productType: string; }

const VAULT_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_VALUATION: { label: "Pending Valuation", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-800/40" },
  VALUED:            { label: "Valued by Staff",   color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-800/40" },
  RELEASED:          { label: "Released",          color: "text-slate-400", bg: "bg-slate-800/60 border-slate-700" },
};
const RISK_META: Record<string, { color: string }> = {
  EXCELLENT: { color: "text-emerald-400" },
  GOOD:      { color: "text-blue-400" },
  MODERATE:  { color: "text-amber-400" },
  REJECT:    { color: "text-red-400" },
};

const COLLATERAL_TYPES = [
  "Electronics (TV, Phone, Laptop)", "Furniture", "Vehicle", "Land Title",
  "Livestock", "Business Stock", "Jewellery", "Other",
];
const PHOTO_SLOTS = [
  { key: "front",   label: "Front View",     required: true  },
  { key: "back",    label: "Back/Side View", required: true  },
  { key: "serial",  label: "Serial Number",  required: false },
  { key: "receipt", label: "Ownership Docs", required: false },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PhotosGrid({ photosJson }: { photosJson: string | null }) {
  if (!photosJson) return null;
  let photos: Record<string, string> = {};
  try { photos = JSON.parse(photosJson); } catch { return null; }
  const entries = Object.entries(photos).filter(([, v]) => v && v.startsWith("data:"));
  if (!entries.length) return null;

  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {entries.map(([key, src]) => (
        <div key={key} className="relative group">
          <img src={src} alt={key}
            className="w-16 h-16 object-cover rounded-xl border border-slate-700 group-hover:scale-105 transition-transform cursor-pointer"
            onClick={() => window.open(src, "_blank")}
          />
          <div className="absolute bottom-0 left-0 right-0 text-[9px] text-center text-white bg-black/60 rounded-b-xl py-0.5 capitalize">{key}</div>
        </div>
      ))}
    </div>
  );
}

function VaultCard({ item }: { item: VaultItem }) {
  const [expanded, setExpanded] = useState(false);
  const vStatus = item.vaultStatus ?? (item.collateralType ? "PENDING_VALUATION" : null);
  const statusMeta = vStatus ? VAULT_STATUS_META[vStatus] ?? VAULT_STATUS_META.PENDING_VALUATION : null;
  const riskMeta = item.riskCategory ? RISK_META[item.riskCategory] : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0d1420", border: "1px solid rgba(201,168,76,0.15)" }}>
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <Package size={18} style={{ color: "#C9A84C" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm truncate">{item.collateralType}</div>
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.collateralDesc}</div>
              <div className="text-[10px] font-mono mt-1" style={{ color: "rgba(201,168,76,0.6)" }}>{item.reference}</div>
            </div>
          </div>
          {statusMeta && (
            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border ${statusMeta.bg} ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          )}
        </div>

        {/* Value Row */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[10px] text-slate-500 mb-0.5">Your Estimate</div>
            <div className="text-sm font-bold text-slate-200">{item.collateralValue ? K(item.collateralValue) : "—"}</div>
          </div>
          <div className="rounded-xl p-2.5 text-center" style={{
            background: item.staffMarketValue ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)",
            border: item.staffMarketValue ? "1px solid rgba(201,168,76,0.3)" : "1px solid rgba(255,255,255,0.06)",
          }}>
            <div className="text-[10px] mb-0.5" style={{ color: item.staffMarketValue ? "rgba(201,168,76,0.7)" : "#64748b" }}>
              {item.staffMarketValue ? "Market Value (Staff)" : "Awaiting Valuation"}
            </div>
            <div className="text-sm font-bold" style={{ color: item.staffMarketValue ? "#C9A84C" : "#334155" }}>
              {item.staffMarketValue ? K(item.staffMarketValue) : "—"}
            </div>
          </div>
        </div>

        {/* Staff valuation note */}
        {item.staffMarketValue && item.staffValuedBy && (
          <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-1">
            <Award size={9} className="text-amber-500" />
            Valued by {item.staffValuedBy} on {new Date(item.staffValuedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        )}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors hover:bg-white/5"
        style={{ color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="flex items-center gap-1.5">
          <Eye size={11} /> {expanded ? "Hide details" : "View details"}
        </span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="pt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {item.collateralCondition && (
              <>
                <span className="text-slate-600">Condition</span>
                <span className="text-slate-300 capitalize font-medium">{item.collateralCondition}</span>
              </>
            )}
            {item.collateralYear && (
              <>
                <span className="text-slate-600">Year</span>
                <span className="text-slate-300 font-medium">{item.collateralYear}</span>
              </>
            )}
            {item.collateralSerial && (
              <>
                <span className="text-slate-600">Serial No.</span>
                <span className="text-slate-300 font-mono font-medium">{item.collateralSerial}</span>
              </>
            )}
            {item.collateralOwner && (
              <>
                <span className="text-slate-600">Owner</span>
                <span className="text-slate-300 font-medium">{item.collateralOwner}</span>
              </>
            )}
            <span className="text-slate-600">Ownership Docs</span>
            <span className={item.hasOwnershipDocs ? "text-emerald-400 font-semibold" : "text-slate-500"}>{item.hasOwnershipDocs ? "Yes ✓" : "No"}</span>
            <span className="text-slate-600">Insurance</span>
            <span className={item.hasInsurance ? "text-emerald-400 font-semibold" : "text-slate-500"}>{item.hasInsurance ? "Yes ✓" : "No"}</span>
          </div>

          {/* Risk assessment */}
          {item.riskScore != null && (
            <div className="rounded-xl p-3 text-xs space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold uppercase tracking-wide text-[10px]">Risk Assessment</span>
                {item.riskCategory && riskMeta && (
                  <span className={`font-bold ${riskMeta.color}`}>{item.riskCategory}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${item.riskScore}%`,
                    background: item.riskScore >= 80 ? "#10b981" : item.riskScore >= 60 ? "#3b82f6" : item.riskScore >= 40 ? "#f59e0b" : "#ef4444",
                  }} />
                </div>
                <span className="text-slate-400 font-bold">{item.riskScore.toFixed(0)}/100</span>
              </div>
              {item.lendingValue && (
                <div className="flex justify-between text-slate-600">
                  <span>Max lending value</span>
                  <span className="text-indigo-400 font-semibold">{K(item.lendingValue)}</span>
                </div>
              )}
            </div>
          )}

          {/* Photos */}
          <PhotosGrid photosJson={item.collateralPhotos} />
        </div>
      )}
    </div>
  );
}

function SubmitForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [collateralType, setCollateralType] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [applicationRef, setApplicationRef] = useState("");
  const [loans, setLoans] = useState<LoanForSelect[]>([]);
  const [photos, setPhotos] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/portal/applications", { headers: portalH() })
      .then(r => r.json())
      .then((d: any[]) => {
        const active = (Array.isArray(d) ? d : []).filter(a =>
          ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "DISBURSED"].includes(a.status)
        );
        setLoans(active);
        if (active.length) setApplicationRef(active[0].reference);
      })
      .catch(() => {});
  }, [open]);

  const addPhoto = (key: string, file: File) => {
    setPhotos(p => ({ ...p, [key]: file }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
    const url = URL.createObjectURL(file);
    setPreviews(p => ({ ...p, [key]: url }));
  };

  const removePhoto = (key: string) => {
    setPhotos(p => { const n = { ...p }; delete n[key]; return n; });
    setPreviews(p => { const n = { ...p }; if (n[key]) { URL.revokeObjectURL(n[key]); delete n[key]; } return n; });
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!collateralType) e.type = "Select a collateral type";
    if (!description.trim()) e.description = "Describe the collateral";
    if (!estimatedValue || isNaN(Number(estimatedValue))) e.value = "Enter a valid estimated value";
    if (!photos.front) e.front = "Front photo is required";
    if (!photos.back) e.back = "Back/side photo is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setApiError("");
    try {
      const photoBase64: Record<string, string> = {};
      for (const [key, file] of Object.entries(photos)) {
        photoBase64[key] = await fileToBase64(file);
      }
      const body: Record<string, unknown> = {
        collateralType, collateralDesc: description.trim(),
        collateralValue: Number(estimatedValue), photos: photoBase64,
      };
      if (applicationRef) body.applicationRef = applicationRef;

      const r = await fetch("/api/portal/applications/collateral", {
        method: "POST", headers: portalH(true), body: JSON.stringify(body),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error ?? `Server error (${r.status})`);
      }
      setOpen(false);
      setCollateralType(""); setDescription(""); setEstimatedValue("");
      setPhotos({}); setPreviews({});
      onSuccess();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg,#C9A84C,#E8C96A,#C9A84C)",
          color: "#0A1F44",
          boxShadow: "0 6px 24px rgba(201,168,76,0.35)",
        }}
      >
        <Plus size={16} /> Add Collateral to Vault
      </button>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0d1420", border: "1px solid rgba(201,168,76,0.3)" }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <Plus size={16} style={{ color: "#C9A84C" }} />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Add Collateral to Vault</div>
            <div className="text-xs text-slate-500">Upload photos and details of items you're pledging</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.3)" }}><X size={16} /></button>
      </div>

      <div className="p-5 space-y-4">
        {/* Type */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(201,168,76,0.7)" }}>Type *</label>
          <select className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: errors.type ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)" }}
            value={collateralType} onChange={e => { setCollateralType(e.target.value); setErrors(p => ({ ...p, type: "" })); }}>
            <option value="" className="bg-slate-900">Select type…</option>
            {COLLATERAL_TYPES.map(c => <option key={c} className="bg-slate-900">{c}</option>)}
          </select>
          {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(201,168,76,0.7)" }}>Description *</label>
          <input className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: errors.description ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)" }}
            placeholder="e.g. Samsung 50-inch Smart TV — Model QA50Q60"
            value={description} onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: "" })); }} />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Value */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(201,168,76,0.7)" }}>Your Estimate (K) *</label>
            <input type="number" className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: errors.value ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)" }}
              placeholder="e.g. 4500" value={estimatedValue}
              onChange={e => { setEstimatedValue(e.target.value); setErrors(p => ({ ...p, value: "" })); }} />
            {errors.value && <p className="text-red-400 text-xs mt-1">{errors.value}</p>}
          </div>
          {/* Loan Link */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "rgba(201,168,76,0.7)" }}>Link to Loan</label>
            {loans.length === 0 ? (
              <div className="text-xs text-slate-600 py-2.5">No active loans</div>
            ) : (
              <select className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                value={applicationRef} onChange={e => setApplicationRef(e.target.value)}>
                {loans.map(l => (
                  <option key={l.id} value={l.reference} className="bg-slate-900">
                    {l.reference} — {l.status}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: "rgba(201,168,76,0.7)" }}>Photos</label>
          <div className="grid grid-cols-2 gap-2">
            {PHOTO_SLOTS.map(slot => {
              const file = photos[slot.key];
              const preview = previews[slot.key];
              const hasError = !!errors[slot.key];
              return (
                <div key={slot.key}>
                  <div className="text-[10px] text-slate-600 mb-1 flex items-center gap-1">
                    {slot.label} {slot.required && <span className="text-red-400">*</span>}
                  </div>
                  {file ? (
                    <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
                      {preview && <img src={preview} alt={slot.label} className="w-full h-24 object-cover" />}
                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-900/30">
                        <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />
                        <span className="text-[10px] text-emerald-300 truncate flex-1">{file.name}</span>
                        <button onClick={() => removePhoto(slot.key)} className="text-slate-500 hover:text-red-400"><X size={10} /></button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-amber-600/40"
                      style={{ borderColor: hasError ? "#ef4444" : "rgba(255,255,255,0.08)", background: hasError ? "rgba(239,68,68,0.05)" : "transparent" }}>
                      <Upload size={16} className={hasError ? "text-red-500" : "text-slate-600"} />
                      <span className="text-[10px] text-slate-600 mt-1">Tap to upload</span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && addPhoto(slot.key, e.target.files[0])} />
                    </label>
                  )}
                  {hasError && <p className="text-red-400 text-[10px] mt-0.5">{errors[slot.key]}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {apiError && (
          <div className="rounded-xl px-3 py-2.5 text-xs text-red-300 flex items-center gap-2"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle size={12} className="flex-shrink-0" /> {apiError}
          </div>
        )}

        <button onClick={submit} disabled={submitting}
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          style={{ background: "linear-gradient(135deg,#C9A84C,#E8C96A,#C9A84C)", color: "#0A1F44" }}>
          {submitting ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Shield size={14} /> Save to Vault</>}
        </button>
      </div>
    </div>
  );
}

export default function CollateralVaultPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/portal/applications/collateral-vault", { headers: portalH() });
      if (r.ok) setItems(await r.json());
      else setError("Could not load vault items.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalClientValue = items.reduce((s, i) => s + (i.collateralValue ?? 0), 0);
  const totalMarketValue = items.reduce((s, i) => s + (i.staffMarketValue ?? 0), 0);
  const valuedCount = items.filter(i => i.staffMarketValue).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={20} style={{ color: "#C9A84C" }} />
            <h1 className="text-2xl font-bold text-white">Collateral Vault</h1>
          </div>
          <p className="text-slate-500 text-sm">All items pledged as security for your loans — including staff valuations</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-slate-700 text-slate-500 hover:text-slate-300 transition-all">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Items", value: items.length, color: "#C9A84C" },
            { label: "Your Estimate", value: K(totalClientValue), color: "#94a3b8" },
            { label: "Staff Valued", value: valuedCount > 0 ? K(totalMarketValue) : `${valuedCount}/${items.length}`, color: valuedCount > 0 ? "#10b981" : "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "#0d1420", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-lg font-black mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-slate-600 font-medium uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-xl p-3.5 flex items-start gap-2.5 text-xs"
        style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.2)" }}>
        <Star size={12} style={{ color: "#C9A84C" }} className="flex-shrink-0 mt-0.5" />
        <div style={{ color: "rgba(201,168,76,0.8)" }}>
          <strong className="text-amber-300">Staff Valuation:</strong> After you submit collateral, a Loan Officer will physically inspect the item and record the real market value within 2 business days. This value is used to determine your maximum loan amount.
        </div>
      </div>

      {/* Loading / error */}
      {loading && (
        <div className="text-center py-12 text-slate-500 text-sm flex items-center justify-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Loading your vault…
        </div>
      )}
      {!loading && error && (
        <div className="rounded-xl p-4 text-sm text-red-400 flex items-center gap-2"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Vault items */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "rgba(201,168,76,0.08)", border: "2px dashed rgba(201,168,76,0.25)" }}>
            <Shield size={32} style={{ color: "rgba(201,168,76,0.4)" }} />
          </div>
          <div>
            <div className="text-slate-300 font-semibold mb-1">Your vault is empty</div>
            <div className="text-slate-600 text-sm">Submit collateral below to secure a loan</div>
          </div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map(item => <VaultCard key={item.id} item={item} />)}
        </div>
      )}

      {/* Submit form */}
      {!loading && <SubmitForm onSuccess={load} />}

      <p className="text-center text-xs text-slate-700 pb-4">
        By submitting collateral, you consent to Philix Finance officers physically inspecting these items.
      </p>
    </div>
  );
}
