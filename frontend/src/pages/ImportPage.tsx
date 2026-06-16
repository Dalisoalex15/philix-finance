import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X } from "lucide-react";
import { mockImportLogs, formatDate } from "../lib/mock-data";

const importTypes = [
  { key: "clients", label: "Client Data", description: "Import borrowers from spreadsheet", fields: "firstName, lastName, NRC, phone, address, dateOfBirth" },
  { key: "loans", label: "Loan Portfolio", description: "Import existing active or closed loans", fields: "loanNumber, clientNRC, principal, rate, disbursedDate, maturityDate" },
  { key: "payments", label: "Payment History", description: "Import bulk payment records", fields: "loanNumber, amount, paymentDate, paymentMethod, reference" },
  { key: "collateral", label: "Collateral Register", description: "Import collateral items", fields: "clientNRC, type, brand, model, serialNumber, estimatedValue" },
  { key: "expenses", label: "Expense Records", description: "Import historical expenses", fields: "date, category, amount, vendorName, description" },
];

export default function ImportPage() {
  const [selectedType, setSelectedType] = useState("clients");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [logs] = useState(mockImportLogs);

  const selected = importTypes.find(t => t.key === selectedType)!;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".csv"))) setFile(f);
  };

  const simulate = () => {
    setImporting(true);
    setTimeout(() => { setImporting(false); setDone(true); }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Import</h1>
          <p className="page-subtitle">Import client records, loans, payments and more from Excel or CSV</p>
        </div>
        <a href="#" className="btn-secondary text-xs py-1.5">
          <FileSpreadsheet size={12} /> Download Template
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Type Selector */}
          <div className="philix-card p-4">
            <h3 className="section-title mb-3">What are you importing?</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {importTypes.map(type => (
                <button key={type.key} onClick={() => { setSelectedType(type.key); setFile(null); setDone(false); }}
                  className={`p-3 rounded-lg border text-left transition-all ${selectedType === type.key ? "border-indigo-500 bg-indigo-600/15" : "border-slate-700 hover:border-slate-600"}`}>
                  <div className={`text-sm font-semibold ${selectedType === type.key ? "text-indigo-300" : "text-slate-300"}`}>{type.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Zone */}
          <div className="philix-card p-4">
            <h3 className="section-title mb-3">Upload File</h3>
            <div className="text-xs text-slate-500 mb-3">
              Required columns: <span className="font-mono text-slate-400">{selected.fields}</span>
            </div>
            {done ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle size={40} className="text-emerald-400" />
                <div className="text-slate-200 font-semibold">Import Complete</div>
                <div className="text-xs text-slate-500">24 records imported · 1 skipped (duplicate)</div>
                <button onClick={() => { setDone(false); setFile(null); }} className="btn-secondary text-xs py-1.5 mt-2">Import Another File</button>
              </div>
            ) : (
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragOver ? "border-indigo-500 bg-indigo-950/30" : file ? "border-emerald-600 bg-emerald-950/20" : "border-slate-700 hover:border-slate-600"}`}>
                {file ? (
                  <div className="space-y-2">
                    <FileSpreadsheet size={32} className="text-emerald-400 mx-auto" />
                    <div className="font-medium text-slate-200">{file.name}</div>
                    <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                    <button onClick={() => setFile(null)} className="text-xs text-red-400 hover:underline flex items-center gap-1 mx-auto"><X size={10} /> Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={32} className="text-slate-600 mx-auto" />
                    <div className="text-slate-400">Drag & drop your Excel (.xlsx) or CSV file here</div>
                    <div className="text-xs text-slate-600">or</div>
                    <label className="btn-secondary text-xs py-1.5 cursor-pointer inline-flex items-center gap-1">
                      <Upload size={12} /> Browse File
                      <input type="file" accept=".xlsx,.csv" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                )}
              </div>
            )}

            {file && !done && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Skip first N rows (headers)</label>
                    <input type="number" className="input-base" defaultValue={1} min={0} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">On Duplicate</label>
                    <select className="input-base">
                      <option>Skip</option>
                      <option>Update Existing</option>
                      <option>Create New</option>
                    </select>
                  </div>
                </div>
                <button onClick={simulate} disabled={importing} className="btn-primary w-full">
                  {importing ? <><RefreshCwIcon /> Importing...</> : "Start Import"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Import History */}
        <div className="philix-card p-4">
          <h3 className="section-title mb-3">Import History</h3>
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  {log.status === "SUCCESS" ? <CheckCircle size={12} className="text-emerald-400" /> : log.status === "PARTIAL" ? <AlertTriangle size={12} className="text-amber-400" /> : <X size={12} className="text-red-400" />}
                  <span className="text-xs font-semibold text-slate-300">{log.importType?.replace("_", " ") || "Import"}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{log.fileName}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {log.recordsImported} imported · {log.recordsSkipped || 0} skipped
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{log.createdAt ? formatDate(log.createdAt) : "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCwIcon() {
  return <svg className="inline mr-1 animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;
}
