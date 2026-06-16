import { useState } from "react";
import { CheckCircle, X, Upload, AlertCircle } from "lucide-react";

interface PhotoSlot {
  key: string;
  label: string;
  hint: string;
  required: boolean;
}

const SLOTS: PhotoSlot[] = [
  { key: "front", label: "Front View", hint: "Clear photo showing the front of the item", required: true },
  { key: "back", label: "Back / Side View", hint: "Back or side angle of the collateral", required: true },
  { key: "serial", label: "Serial / Model Number", hint: "Close-up of the serial number, model sticker, or ID plate", required: false },
  { key: "receipt", label: "Purchase Receipt / Ownership Document", hint: "Original receipt, title, or ownership proof", required: false },
];

const COLLATERAL_TYPES = ["Electronics (TV, Phone, Laptop)","Furniture","Vehicle","Land Title","Livestock","Business Stock","Jewellery","Other"];

export default function CollateralSubmissionPage() {
  const [collateralType, setCollateralType] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [linkedLoan, setLinkedLoan] = useState("PHX-L-2024-0034");
  const [photos, setPhotos] = useState<Record<string, File>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPhoto = (key: string, file: File) => {
    setPhotos(p => ({ ...p, [key]: file }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const removePhoto = (key: string) => {
    setPhotos(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!collateralType) e.type = "Select a collateral type";
    if (!description) e.description = "Describe the collateral";
    if (!estimatedValue) e.value = "Enter estimated value";
    if (!photos.front) e.front = "Front photo is required";
    if (!photos.back) e.back = "Back/side photo is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Collateral Submitted!</h2>
          <p className="text-slate-400 text-sm">Your collateral photos and information have been received. A Loan Officer will assess and confirm within 2 business days.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-slate-200">{collateralType}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Est. Value</span><span className="text-slate-200">K{Number(estimatedValue).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Photos</span><span className="text-slate-200">{Object.keys(photos).length} uploaded</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Linked Loan</span><span className="text-slate-200 font-mono">{linkedLoan}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-amber-400 font-semibold">Under Review</span></div>
        </div>
        <button onClick={() => { setSubmitted(false); setPhotos({}); setDescription(""); setCollateralType(""); setEstimatedValue(""); }}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm">
          Submit Another Collateral
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Submit Collateral</h1>
        <p className="text-slate-500 text-sm mt-1">Upload photos and details of items you're pledging as loan security</p>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-300">
          <strong className="text-blue-200">Photo Requirements:</strong> Photos must be clear, well-lit, and taken within the last 7 days.
          The item must be identifiable in the photos. Blurry or unclear photos will be rejected.
        </div>
      </div>

      {/* Collateral info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-200">Collateral Details</h3>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Collateral Type *</label>
          <select className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={collateralType} onChange={e => { setCollateralType(e.target.value); setErrors(p => ({ ...p, type: "" })); }}>
            <option value="">Select type</option>
            {COLLATERAL_TYPES.map(c => <option key={c}>{c}</option>)}
          </select>
          {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Description *</label>
          <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
            placeholder="e.g. Samsung 50-inch Smart TV — Model QA50Q60BAKXXA — Black" value={description}
            onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: "" })); }} />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Estimated Market Value (K) *</label>
            <input type="number" className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
              placeholder="e.g. 4500" value={estimatedValue}
              onChange={e => { setEstimatedValue(e.target.value); setErrors(p => ({ ...p, value: "" })); }} />
            {errors.value && <p className="text-red-400 text-xs mt-1">{errors.value}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Link to Loan</label>
            <select className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={linkedLoan} onChange={e => setLinkedLoan(e.target.value)}>
              <option value="PHX-L-2024-0034">PHX-L-2024-0034 (Active)</option>
              <option value="">New Application</option>
            </select>
          </div>
        </div>
      </div>

      {/* Photo uploads */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-slate-200">Photo Documentation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SLOTS.map(slot => {
            const file = photos[slot.key];
            const hasError = errors[slot.key];
            return (
              <div key={slot.key}>
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-xs text-slate-400 font-medium">{slot.label}</span>
                  {slot.required && <span className="text-red-400 text-xs">*</span>}
                  {!slot.required && <span className="text-xs text-slate-600">(optional)</span>}
                </div>
                {file ? (
                  <div className="relative border-2 border-emerald-600 bg-emerald-900/10 rounded-xl p-3 flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={16} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-emerald-400 truncate">{file.name}</div>
                      <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button onClick={() => removePhoto(slot.key)} className="text-slate-600 hover:text-red-400 flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all hover:border-indigo-600 hover:bg-indigo-900/10 ${hasError ? "border-red-700 bg-red-900/10" : "border-slate-700"}`}>
                    <Upload size={20} className={`mb-2 ${hasError ? "text-red-500" : "text-slate-500"}`} />
                    <div className="text-xs text-slate-400 font-medium text-center">Tap to upload</div>
                    <div className="text-[10px] text-slate-600 text-center mt-0.5">{slot.hint}</div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && addPhoto(slot.key, e.target.files[0])} />
                  </label>
                )}
                {hasError && <p className="text-red-400 text-xs mt-1">{hasError}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={submit} disabled={submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
        {submitting
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
          : <><Upload size={15} /> Submit Collateral</>}
      </button>

      <p className="text-center text-xs text-slate-600 pb-4">
        By submitting, you consent to Philix Finance officers physically inspecting this collateral item.
      </p>
    </div>
  );
}
