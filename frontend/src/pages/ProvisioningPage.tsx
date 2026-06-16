import { Shield, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import { mockProvisionings, mockPAR, formatKwacha, formatDate } from "../lib/mock-data";

export default function ProvisioningPage() {
  const prov = mockProvisionings[0];

  const parBands = [
    { label: "PAR 30 (1–30 days)", amount: prov.par30Amount, rate: prov.rate30, provision: prov.provision30, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "PAR 60 (31–60 days)", amount: prov.par60Amount, rate: prov.rate60, provision: prov.provision60, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "PAR 90 (61–90 days)", amount: prov.par90Amount, rate: prov.rate90, provision: prov.provision90, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Default (90+ days)", amount: prov.defaultAmount, rate: prov.rateDefault, provision: prov.provisionDefault, color: "text-red-600", bg: "bg-red-600/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bad Debt Provisioning</h1>
          <p className="page-subtitle">IFRS 9 compliant loan loss provisioning by PAR band</p>
        </div>
        <button className="btn-secondary"><RefreshCw size={14} /> Recalculate</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Overdue", value: formatKwacha(prov.par30Amount + prov.par60Amount + prov.par90Amount + prov.defaultAmount), color: "text-red-400" },
          { label: "Total Provision", value: formatKwacha(prov.totalProvision), color: "text-amber-400" },
          { label: "Coverage Ratio", value: `${((prov.totalProvision / (prov.par30Amount + prov.par60Amount + prov.par90Amount + prov.defaultAmount)) * 100).toFixed(1)}%`, color: "text-indigo-400" },
          { label: "Period", value: formatDate(prov.periodDate), color: "text-slate-200" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* PAR Bands */}
      <div className="philix-card overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="section-title">Provision Calculation by PAR Band</h3>
          <p className="text-xs text-slate-500 mt-1">Provision rates can be edited in Settings</p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>PAR Band</th>
              <th className="text-right">Outstanding Amount</th>
              <th className="text-right">Provision Rate</th>
              <th className="text-right">Required Provision</th>
            </tr>
          </thead>
          <tbody>
            {parBands.map((band) => (
              <tr key={band.label} className="table-row-hover">
                <td>
                  <span className={`text-sm font-medium ${band.color}`}>{band.label}</span>
                </td>
                <td className="text-right font-mono text-slate-300">{formatKwacha(band.amount)}</td>
                <td className="text-right">
                  <span className={`text-sm font-bold ${band.color}`}>{(band.rate * 100).toFixed(0)}%</span>
                </td>
                <td className="text-right font-bold font-mono text-slate-100">{formatKwacha(band.provision)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-700">
              <td className="px-4 py-3 font-bold text-slate-200">TOTAL REQUIRED PROVISION</td>
              <td className="text-right px-4 py-3 font-mono text-slate-300">
                {formatKwacha(prov.par30Amount + prov.par60Amount + prov.par90Amount + prov.defaultAmount)}
              </td>
              <td></td>
              <td className="text-right px-4 py-3 font-bold font-mono text-red-400 text-lg">{formatKwacha(prov.totalProvision)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Visual bars */}
      <div className="philix-card p-5">
        <h3 className="section-title mb-5">Portfolio At Risk — Visual Breakdown</h3>
        {parBands.map((band) => {
          const total = prov.par30Amount + prov.par60Amount + prov.par90Amount + prov.defaultAmount;
          const pct = (band.amount / total) * 100;
          return (
            <div key={band.label} className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className={`font-medium ${band.color}`}>{band.label}</span>
                <span className="text-slate-300">{formatKwacha(band.amount)} <span className="text-slate-500">({pct.toFixed(0)}%)</span></span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${band.bg.replace("bg-", "bg-").replace("/10", "")}`}
                  style={{ width: `${pct}%`, background: band.color.includes("amber") ? "#f59e0b" : band.color.includes("orange") ? "#f97316" : band.color.includes("red-6") ? "#dc2626" : "#ef4444" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="philix-card p-5 border-amber-800/30 border">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">Provisioning Policy</span>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <p>• PAR 1–30 days: 25% of outstanding balance provisioned</p>
          <p>• PAR 31–60 days: 50% of outstanding balance provisioned</p>
          <p>• PAR 61–90 days: 75% of outstanding balance provisioned</p>
          <p>• PAR 90+ / Default: 100% of outstanding balance provisioned</p>
          <p className="mt-2 text-slate-500">Provisioning is recorded monthly as a debit to Bad Debt Expense and credit to Bad Debt Provision (contra-asset).</p>
        </div>
      </div>
    </div>
  );
}
