import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { mockForecasts, formatKwacha } from "../lib/mock-data";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Area, AreaChart } from "recharts";

export default function ForecastingPage() {
  const latest = mockForecasts[mockForecasts.length - 1];
  const first = mockForecasts[0];

  const chartData = mockForecasts.map(f => ({
    month: f.month,
    "Projected Disbursements": f.projectedDisbursements,
    "Projected Collections": f.projectedCollections,
    "Actual Disbursements": f.actualDisbursements,
    "Actual Collections": f.actualCollections,
  }));

  const profitData = mockForecasts.map(f => ({
    month: f.month,
    "Net Cash Flow": f.projectedCollections - f.projectedDisbursements,
  }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cash Flow Forecast</h1>
          <p className="page-subtitle">Projected vs actual disbursements and collections — 6-month rolling view</p>
        </div>
        <button className="btn-secondary text-xs py-1.5"><Target size={12} /> Update Targets</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Projected Disbursements", value: formatKwacha(latest?.projectedDisbursements || 0), color: "text-blue-400", icon: TrendingUp },
          { label: "Projected Collections", value: formatKwacha(latest?.projectedCollections || 0), color: "text-indigo-400", icon: TrendingUp },
          { label: "Expected Net Cash", value: formatKwacha((latest?.projectedCollections || 0) - (latest?.projectedDisbursements || 0)), color: "text-emerald-400", icon: DollarSign },
          { label: "Collection Rate", value: latest && latest.projectedCollections > 0 ? `${Math.round(((latest.actualCollections || 0) / latest.projectedCollections) * 100)}%` : "—", color: "text-amber-400", icon: Target },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="philix-card p-5">
        <h3 className="section-title mb-4">Disbursements vs Collections Forecast</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
            <Legend />
            <Line type="monotone" dataKey="Projected Disbursements" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="Projected Collections" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="Actual Disbursements" stroke="#818cf8" strokeWidth={2} />
            <Line type="monotone" dataKey="Actual Collections" stroke="#34d399" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="philix-card p-5">
        <h3 className="section-title mb-4">Net Cash Flow Projection</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={profitData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="Net Cash Flow" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="philix-card overflow-hidden">
        <div className="p-4 border-b border-slate-800"><h3 className="section-title">Monthly Forecast Details</h3></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Proj. Disbursements</th>
              <th>Proj. Collections</th>
              <th>Act. Disbursements</th>
              <th>Act. Collections</th>
              <th>Net (Proj.)</th>
              <th>Variance</th>
            </tr>
          </thead>
          <tbody>
            {mockForecasts.map(f => {
              const net = f.projectedCollections - f.projectedDisbursements;
              const actNet = (f.actualCollections || 0) - (f.actualDisbursements || 0);
              const variance = actNet - net;
              return (
                <tr key={f.id} className="table-row-hover">
                  <td className="font-semibold text-slate-200">{f.month}</td>
                  <td className="text-blue-400">{formatKwacha(f.projectedDisbursements)}</td>
                  <td className="text-indigo-400">{formatKwacha(f.projectedCollections)}</td>
                  <td className="text-slate-300">{f.actualDisbursements ? formatKwacha(f.actualDisbursements) : <span className="text-slate-600">—</span>}</td>
                  <td className="text-slate-300">{f.actualCollections ? formatKwacha(f.actualCollections) : <span className="text-slate-600">—</span>}</td>
                  <td className={net >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>{formatKwacha(net)}</td>
                  <td className={f.actualCollections ? (variance >= 0 ? "text-emerald-400" : "text-red-400") : "text-slate-600"}>
                    {f.actualCollections ? `${variance >= 0 ? "+" : ""}${formatKwacha(Math.abs(variance))}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
