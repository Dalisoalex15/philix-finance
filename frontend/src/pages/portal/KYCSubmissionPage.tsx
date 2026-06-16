import { useState } from "react";
import { CheckCircle, X, AlertCircle, Shield, Upload } from "lucide-react";
import { useClientAuthStore } from "../../store/clientAuth";

const DOC_SLOTS = [
  { key: "nrcFront", label: "NRC — Front", hint: "Clear, unobstructed photo of the front", required: true, icon: "🪪" },
  { key: "nrcBack", label: "NRC — Back", hint: "Clear photo of the back side", required: true, icon: "🪪" },
  { key: "selfie", label: "Selfie holding NRC", hint: "Your face and NRC both clearly visible in one photo", required: true, icon: "🤳" },
  { key: "proofOfAddress", label: "Proof of Address", hint: "Utility bill, bank statement, or lease agreement (not older than 3 months)", required: false, icon: "🏠" },
];

export default function KYCSubmissionPage() {
  const client = useClientAuthStore(s => s.client)!;
  const [nrcNumber, setNrcNumber] = useState(client.nrcNumber || "");
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFile = (key: string, file: File) => {
    setFiles(p => ({ ...p, [key]: file }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const removeFile = (key: string) => setFiles(p => { const n = { ...p }; delete n[key]; return n; });

  const submit = () => {
    const e: Record<string, string> = {};
    if (nrcNumber.length < 8) e.nrcNumber = "Enter a valid NRC number (e.g. 123456/78/9)";
    DOC_SLOTS.filter(s => s.required).forEach(s => {
      if (!files[s.key]) e[s.key] = `${s.label} is required`;
    });
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1800);
  };

  if (client.kycStatus === "VERIFIED") {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <Shield size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">KYC Verified ✓</h2>
        <p className="text-slate-400 text-sm">Your identity has been successfully verified. You have full access to all loan products.</p>
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-emerald-400 font-semibold">VERIFIED</span></div>
          <div className="flex justify-between"><span className="text-slate-500">NRC Number</span><span className="text-slate-200 font-mono">{client.nrcNumber}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Client Number</span><span className="text-slate-200">{client.clientNumber}</span></div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Documents Submitted!</h2>
          <p className="text-slate-400 text-sm">Your KYC documents have been received. Verification typically takes 1–2 business days.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">NRC Number</span><span className="text-slate-200 font-mono">{nrcNumber}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Documents</span><span className="text-slate-200">{Object.keys(files).length} uploaded</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-amber-400 font-semibold">Under Review</span></div>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-3 text-xs text-blue-300">
          A Philix Finance compliance officer will review your documents and notify you by call or email once verified.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Identity Verification (KYC)</h1>
        <p className="text-slate-500 text-sm mt-1">Upload your NRC and supporting documents to verify your identity</p>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-3 rounded-xl p-4 ${
        client.kycStatus === "REJECTED" ? "bg-red-900/20 border border-red-800/40" :
        client.kycStatus === "SUBMITTED" ? "bg-amber-900/20 border border-amber-800/40" :
        "bg-slate-800/50 border border-slate-700"
      }`}>
        <AlertCircle size={14} className={
          client.kycStatus === "REJECTED" ? "text-red-400" :
          client.kycStatus === "SUBMITTED" ? "text-amber-400" :
          "text-slate-500"
        } />
        <div>
          <div className="font-semibold text-sm text-slate-300">
            Current KYC Status: <span className={
              client.kycStatus === "REJECTED" ? "text-red-400" :
              client.kycStatus === "SUBMITTED" ? "text-amber-400" :
              "text-slate-400"
            }>{client.kycStatus.replace("_", " ")}</span>
          </div>
          <div className="text-xs text-slate-500">
            {client.kycStatus === "REJECTED" ? "Your previous submission was rejected. Please re-submit clearer documents." :
             client.kycStatus === "SUBMITTED" ? "Your documents are currently under review." :
             "Complete identity verification to access full loan limits."}
          </div>
        </div>
      </div>

      {/* NRC Number */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-slate-200">NRC Information</h3>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">NRC Number *</label>
          <input className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 font-mono tracking-wider"
            placeholder="000000/00/0" value={nrcNumber}
            onChange={e => { setNrcNumber(e.target.value); setErrors(p => ({ ...p, nrcNumber: "" })); }} />
          {errors.nrcNumber && <p className="text-red-400 text-xs mt-1">{errors.nrcNumber}</p>}
          <p className="text-xs text-slate-600 mt-1.5">Format: 6-digit-number / 2-digits / 1-digit (e.g. 123456/78/9)</p>
        </div>
      </div>

      {/* Document uploads */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h3 className="font-bold text-slate-200">Document Uploads</h3>

        {DOC_SLOTS.map(slot => {
          const file = files[slot.key];
          const hasError = errors[slot.key];
          return (
            <div key={slot.key}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-sm">{slot.icon}</span>
                <span className="text-sm font-medium text-slate-300">{slot.label}</span>
                {slot.required && <span className="text-red-400 text-xs">*</span>}
                {!slot.required && <span className="text-xs text-slate-600 ml-1">(optional)</span>}
              </div>
              <div className="text-xs text-slate-600 mb-2">{slot.hint}</div>

              {file ? (
                <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${hasError ? "border-red-700 bg-red-900/10" : "border-emerald-600 bg-emerald-900/10"}`}>
                  <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-emerald-300 truncate">{file.name}</div>
                    <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB · {file.type.replace("image/", "").toUpperCase()}</div>
                  </div>
                  <button onClick={() => removeFile(slot.key)} className="text-slate-600 hover:text-red-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all hover:border-indigo-600 hover:bg-indigo-900/10 ${hasError ? "border-red-700 bg-red-900/10" : "border-slate-700"}`}>
                  <Upload size={22} className={`mb-2 ${hasError ? "text-red-500" : "text-slate-600"}`} />
                  <div className="text-sm text-slate-400 font-medium">Upload {slot.label}</div>
                  <div className="text-xs text-slate-600 mt-1">JPEG, PNG, HEIC — max 10MB</div>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files?.[0] && addFile(slot.key, e.target.files[0])} />
                </label>
              )}
              {hasError && <p className="text-red-400 text-xs mt-1">{hasError}</p>}
            </div>
          );
        })}
      </div>

      {/* Guidelines */}
      <div className="bg-amber-900/10 border border-amber-900/30 rounded-xl p-4">
        <div className="text-xs font-semibold text-amber-400 mb-2">Photo Quality Guidelines</div>
        <ul className="space-y-1 text-xs text-slate-500">
          <li>• Ensure all text on the NRC is clearly readable</li>
          <li>• Avoid glare, shadows, or blurry images</li>
          <li>• The NRC must not be expired or damaged</li>
          <li>• For the selfie, both your face and the NRC must be visible</li>
          <li>• Photos must be taken in good lighting</li>
        </ul>
      </div>

      <button onClick={submit} disabled={submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
        {submitting
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting documents...</>
          : <><Shield size={15} /> Submit for Verification</>}
      </button>

      <p className="text-center text-xs text-slate-600 pb-4">
        Your documents are encrypted in transit and stored securely. Only authorised compliance staff can access them.
      </p>
    </div>
  );
}
