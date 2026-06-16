import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Table } from "lucide-react";

const exports = [
  {
    group: "Loan Reports",
    items: [
      { label: "Active Loan Portfolio", desc: "All active loans with balance, overdue days, officer" },
      { label: "Loan Repayment Schedule", desc: "Full installment schedule for all or specific loans" },
      { label: "Disbursement Register", desc: "All loan disbursements with amounts and dates" },
      { label: "PAR Report", desc: "Portfolio at Risk by 1, 7, 30, 60, 90 days" },
      { label: "Loan Write-offs Register", desc: "All write-offs with approval and reason" },
    ],
  },
  {
    group: "Client Reports",
    items: [
      { label: "Client Masterlist", desc: "All clients with contact info and KYC status" },
      { label: "KYC Verification Report", desc: "KYC status, risk scores, verified / pending clients" },
      { label: "Collateral Register", desc: "All collateral items with LTV, status, location" },
      { label: "Document Expiry Report", desc: "Documents expiring in next 30, 60, 90 days" },
    ],
  },
  {
    group: "Financial Reports",
    items: [
      { label: "Income Statement (P&L)", desc: "Revenue, expenses, net profit for date range" },
      { label: "Trial Balance", desc: "All account balances from Chart of Accounts" },
      { label: "Daily Cashbook", desc: "Cash receipts and payments with running balance" },
      { label: "Bank Reconciliation", desc: "Bank vs book balance reconciliation summary" },
      { label: "Expense Report", desc: "All expenses by category and period" },
    ],
  },
  {
    group: "Collections & Recovery",
    items: [
      { label: "Overdue Loans Report", desc: "Color-coded: Green/Amber/Orange/Red by days overdue" },
      { label: "Collection Activity Log", desc: "All calls, promises, and outcomes logged" },
      { label: "Penalty & Waiver Report", desc: "Penalty accruals, waivers granted with approval" },
      { label: "Collateral Auction Report", desc: "Listed, sold, and unsold auction items" },
    ],
  },
  {
    group: "Investor & Capital Reports",
    items: [
      { label: "Investor Portfolio Statement", desc: "Per-investor returns, capital, and transaction history" },
      { label: "Capital Management Summary", desc: "Total capital, deployed, available, cost of funds" },
      { label: "Portfolio Profitability", desc: "Loan-level revenue, cost, and net profit analysis" },
    ],
  },
  {
    group: "Audit & Compliance",
    items: [
      { label: "Audit Trail Export", desc: "All system actions with user, timestamp, and change detail" },
      { label: "Compliance Checklist", desc: "Regulatory and internal compliance item status" },
      { label: "Staff Activity Report", desc: "Loan officer performance, tasks, and attendance" },
    ],
  },
];

export default function ExportCenterPage() {
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-06-30");
  const [format, setFormat] = useState("xlsx");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Export Center</h1>
          <p className="page-subtitle">Download any report as Excel or PDF — all data, your format</p>
        </div>
      </div>

      {/* Global Filters */}
      <div className="philix-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-slate-400">Date Range:</div>
          <input type="date" className="input-base py-1.5 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="text-slate-600">to</span>
          <input type="date" className="input-base py-1.5 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <div className="flex gap-1">
            {["xlsx", "csv", "pdf"].map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${format === f ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                .{f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Groups */}
      <div className="space-y-6">
        {exports.map(group => (
          <div key={group.group} className="philix-card overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <Table size={14} className="text-indigo-400" />
              <h3 className="section-title">{group.group}</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {group.items.map(item => (
                <div key={item.label} className="p-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors">
                  {format === "pdf"
                    ? <FileText size={14} className="text-red-400 flex-shrink-0" />
                    : <FileSpreadsheet size={14} className="text-emerald-400 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                  <button className="btn-secondary text-xs py-1.5 flex-shrink-0 flex items-center gap-1">
                    <Download size={11} /> Export
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
