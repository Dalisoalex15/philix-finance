import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, CreditCard, Package, DollarSign, CheckCircle } from "lucide-react";
import { mockClients, mockCollateral, formatKwacha } from "../lib/mock-data";

const STEPS = [
  { id: 1, label: "Select Client", icon: ChevronRight },
  { id: 2, label: "Select Collateral", icon: Package },
  { id: 3, label: "Loan Parameters", icon: DollarSign },
  { id: 4, label: "Review & Submit", icon: CheckCircle },
];

export default function NewLoanPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<typeof mockClients[0] | null>(null);
  const [selectedCollateral, setSelectedCollateral] = useState<typeof mockCollateral[0] | null>(null);
  const [params, setParams] = useState({
    loanType: "Student Loan",
    principal: 5000,
    interestRate: 15,
    processingFee: 2,
    repaymentFrequency: "MONTHLY",
    totalInstallments: 4,
    firstPaymentDate: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().slice(0, 10);
    })(),
    purpose: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const processingFeeAmount = (params.principal * params.processingFee) / 100;
  const monthlyRate = params.interestRate / 100 / 12;
  const installmentAmount = (params.principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -params.totalInstallments));
  const totalInterest = (installmentAmount * params.totalInstallments) - params.principal;
  const totalDue = params.principal + totalInterest + processingFeeAmount;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate("/loans"), 2000);
  };

  const availableCollateral = mockCollateral.filter(c => c.status === "HELD" && (c as Record<string, unknown>).clientId === selectedClient?.id);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center mb-4 animate-pulse">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Loan Application Submitted!</h2>
        <p className="text-slate-400 mb-1">Application is pending manager approval.</p>
        <p className="text-xs text-slate-500">Redirecting to loans list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Loan Application</h1>
          <p className="page-subtitle">Step-by-step loan origination wizard</p>
        </div>
        <button onClick={() => navigate("/loans")} className="btn-secondary">
          Cancel
        </button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > s.id ? "bg-emerald-600 text-white" :
                step === s.id ? "bg-indigo-600 text-white" :
                "bg-slate-800 text-slate-500"
              }`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <div className={`text-xs mt-1 font-medium hidden sm:block ${step >= s.id ? "text-slate-300" : "text-slate-600"}`}>
                {s.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-emerald-600" : "bg-slate-800"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Client */}
      {step === 1 && (
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Select Borrower</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {mockClients.filter(c => c.status === "ACTIVE").map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedClient?.id === client.id
                    ? "border-indigo-500 bg-indigo-600/10"
                    : "border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {client.firstName[0]}{client.lastName[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{client.firstName} {client.lastName}</div>
                      <div className="text-xs text-slate-500">{client.clientNumber} · {client.type.replace("_", " ")}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium ${client.riskRating === "LOW" ? "text-emerald-400" : client.riskRating === "HIGH" ? "text-red-400" : "text-amber-400"}`}>
                      {client.riskRating} RISK
                    </div>
                    <div className="text-xs text-slate-500">Score: {client.internalScore}</div>
                  </div>
                </div>
                {client._count.loans > 0 && (
                  <div className="text-xs text-slate-500 mt-1">{client._count.loans} previous loan(s)</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedClient}
              className="btn-primary"
            >
              Next: Collateral <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Collateral */}
      {step === 2 && (
        <div className="philix-card p-5">
          <h3 className="section-title mb-2">Select Collateral</h3>
          <p className="text-xs text-slate-500 mb-4">
            Selected Client: <span className="text-slate-300 font-medium">{selectedClient?.firstName} {selectedClient?.lastName}</span>
          </p>

          {availableCollateral.length > 0 ? (
            <div className="space-y-2">
              {availableCollateral.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setSelectedCollateral(col)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCollateral?.id === col.id
                      ? "border-indigo-500 bg-indigo-600/10"
                      : "border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200">{col.brand} {col.model}</div>
                      <div className="text-xs text-slate-500">{col.type.replace("_", " ")} · {col.condition} · {col.vaultId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-emerald-400">Max Loan: {formatKwacha(col.maxLoanAmount)}</div>
                      <div className="text-xs text-slate-500">Market: {formatKwacha(col.marketValue)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Package size={32} className="mx-auto mb-3 opacity-30" />
              <p>No collateral found for this client.</p>
              <p className="text-xs mt-1">Please add collateral first or select a different client.</p>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button onClick={() => setStep(1)} className="btn-secondary">
              <ChevronLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(3)} disabled={!selectedCollateral} className="btn-primary">
              Next: Parameters <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Loan Parameters */}
      {step === 3 && (
        <div className="philix-card p-5">
          <h3 className="section-title mb-4">Loan Parameters</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Loan Type</label>
              <select className="input-base" value={params.loanType} onChange={(e) => setParams(p => ({ ...p, loanType: e.target.value }))}>
                {["Student Loan", "Civil Servant Loan", "Business Loan", "Short-term Loan", "Asset-Backed Loan"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Principal Amount (K) — Max: {selectedCollateral ? formatKwacha(selectedCollateral.maxLoanAmount) : "—"}
              </label>
              <input
                type="number"
                className="input-base"
                value={params.principal}
                onChange={(e) => setParams(p => ({ ...p, principal: parseFloat(e.target.value) || 0 }))}
                max={selectedCollateral?.maxLoanAmount}
              />
              {selectedCollateral && params.principal > selectedCollateral.maxLoanAmount && (
                <p className="text-xs text-red-400 mt-1">Exceeds maximum loan amount for this collateral</p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Annual Interest Rate (%)</label>
              <input type="number" className="input-base" value={params.interestRate} onChange={(e) => setParams(p => ({ ...p, interestRate: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Processing Fee (%)</label>
              <input type="number" className="input-base" value={params.processingFee} onChange={(e) => setParams(p => ({ ...p, processingFee: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Repayment Frequency</label>
              <select className="input-base" value={params.repaymentFrequency} onChange={(e) => setParams(p => ({ ...p, repaymentFrequency: e.target.value }))}>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Number of Installments</label>
              <input type="number" min={1} max={52} className="input-base" value={params.totalInstallments} onChange={(e) => setParams(p => ({ ...p, totalInstallments: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">First Payment Date</label>
              <input type="date" className="input-base" value={params.firstPaymentDate} onChange={(e) => setParams(p => ({ ...p, firstPaymentDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Loan Purpose</label>
              <input className="input-base" placeholder="e.g., School fees, Business inventory" value={params.purpose} onChange={(e) => setParams(p => ({ ...p, purpose: e.target.value }))} />
            </div>
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800/50 rounded-lg">
            {[
              { label: "Installment", value: formatKwacha(installmentAmount), color: "text-indigo-400" },
              { label: "Total Interest", value: formatKwacha(totalInterest), color: "text-amber-400" },
              { label: "Processing Fee", value: formatKwacha(processingFeeAmount), color: "text-slate-300" },
              { label: "Total Repayable", value: formatKwacha(totalDue), color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <button onClick={() => setStep(2)} className="btn-secondary">
              <ChevronLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(4)} className="btn-primary">
              Review Application <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="philix-card p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Borrower</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="text-slate-200">{selectedClient?.firstName} {selectedClient?.lastName}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Client #</span><span className="font-mono text-xs text-slate-300">{selectedClient?.clientNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Risk</span><span className="text-slate-200">{selectedClient?.riskRating}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Score</span><span className="text-slate-200">{selectedClient?.internalScore}/100</span></div>
              </div>
            </div>
            <div className="philix-card p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Collateral</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Asset</span><span className="text-slate-200">{selectedCollateral?.brand} {selectedCollateral?.model}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Vault ID</span><span className="font-mono text-xs text-slate-300">{selectedCollateral?.vaultId}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Condition</span><span className="text-slate-200">{selectedCollateral?.condition}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Market Value</span><span className="text-slate-200">{formatKwacha(selectedCollateral?.marketValue || 0)}</span></div>
              </div>
            </div>
            <div className="philix-card p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Loan Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Principal</span><span className="text-slate-200">{formatKwacha(params.principal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Rate</span><span className="text-slate-200">{params.interestRate}% p.a.</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Installments</span><span className="text-slate-200">{params.totalInstallments} × {formatKwacha(installmentAmount)}</span></div>
                <div className="flex justify-between border-t border-slate-800 pt-2"><span className="text-slate-400">Total Repayable</span><span className="text-emerald-400 font-bold">{formatKwacha(totalDue)}</span></div>
              </div>
            </div>
          </div>

          <div className="philix-card p-5 border-amber-800/50 border">
            <div className="flex items-start gap-3">
              <CreditCard size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-slate-200 mb-1">Pending Manager Approval</div>
                <p className="text-xs text-slate-400">
                  This loan application will be submitted with status "Pending Approval". A manager or super admin
                  will need to review and approve before disbursement. The client will be notified upon approval.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="btn-secondary">
              <ChevronLeft size={14} /> Back
            </button>
            <button onClick={handleSubmit} className="btn-success">
              <Check size={14} />
              Submit Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
