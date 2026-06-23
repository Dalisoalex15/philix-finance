import { useState, useEffect, useCallback } from "react";
import { Gift, Users, Trophy, Copy, CheckCircle, TrendingUp, Star, RefreshCw } from "lucide-react";

const API = "/api";
function getToken() { return localStorage.getItem("philix_staff_token") ?? ""; }

interface TopReferrer { rank: number; id: string; name: string; count: number }
interface ReferralChain { referrer: string; referrerId: string; referredName: string; referredId: string; joinedAt: string }
interface ReferralData {
  totalReferrals: number;
  uniqueReferrers: number;
  chains: ReferralChain[];
  topReferrers: TopReferrer[];
}

function tierColor(rank: number) {
  if (rank === 1) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (rank === 2) return "bg-gray-100 text-gray-700 border-gray-200";
  if (rank === 3) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function tierLabel(count: number) {
  if (count >= 6) return { label: "Gold", color: "text-yellow-700 bg-yellow-100 border-yellow-200" };
  if (count >= 3) return { label: "Silver", color: "text-gray-700 bg-gray-100 border-gray-200" };
  return { label: "Bronze", color: "text-amber-700 bg-amber-50 border-amber-200" };
}

export default function ReferralProgrammePage() {
  const [tab, setTab] = useState<"leaderboard" | "referrals" | "settings">("leaderboard");
  const [copied, setCopied] = useState<string | null>(null);
  const [rewardAmount, setRewardAmount] = useState("100");
  const [rateDiscount, setRateDiscount] = useState("1");
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/referrals`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (r.ok) setData(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalReferrals = data?.totalReferrals ?? 0;
  const topReferrers = data?.topReferrers ?? [];
  const chains = data?.chains ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Referral Programme</h1>
          <p className="page-subtitle">Reward loyal clients for referring new borrowers — unique referral codes and leaderboard</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-sm">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals",         value: totalReferrals,                icon: Users,    color: "indigo" },
          { label: "Active Referrers",         value: data?.uniqueReferrers ?? 0,    icon: Star,     color: "amber" },
          { label: "Potential Discounts",      value: totalReferrals,               icon: Gift,     color: "emerald" },
          { label: "New Clients via Referral", value: totalReferrals,               icon: TrendingUp, color: "blue" },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <k.icon size={16} className={`text-${k.color}-400 mb-2`} />
            <div className="text-2xl font-bold text-navy-900">{k.value}</div>
            <div className="text-xs text-navy-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex border-b border-warm-200 gap-1">
        {(["leaderboard", "referrals", "settings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all ${tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-navy-500 hover:text-navy-700"}`}>
            {t === "leaderboard" ? "Top Referrers" : t === "referrals" ? "Recent Referrals" : "Programme Settings"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8 text-navy-500 flex items-center justify-center gap-2">
          <RefreshCw size={14} className="animate-spin" /> Loading referral data…
        </div>
      )}

      {!loading && tab === "leaderboard" && (
        topReferrers.length === 0 ? (
          <div className="philix-card p-8 text-center text-navy-500">
            <Users size={32} className="mx-auto mb-3 text-navy-300" />
            <div className="font-semibold">No referrals yet</div>
            <div className="text-sm mt-1">When clients use a referral code to register, they'll appear here</div>
          </div>
        ) : (
          <div className="space-y-3">
            {topReferrers.map(r => {
              const tier = tierLabel(r.count);
              const code = `PHX-${r.name.split(" ")[0].toUpperCase().slice(0, 3)}${r.id.slice(-4).toUpperCase()}`;
              return (
                <div key={r.id} className="philix-card p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${tierColor(r.rank)}`}>
                      {r.rank === 1 ? <Trophy size={18} /> : `#${r.rank}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900">{r.name}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tier.color}`}>{tier.label}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-indigo-700">{r.count}</div>
                      <div className="text-xs text-navy-500">Referrals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-emerald-700">K{(r.count * parseInt(rewardAmount)).toLocaleString()}</div>
                      <div className="text-xs text-navy-500">Earned</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-warm-200 text-indigo-700 px-2 py-1 rounded-lg">{code}</code>
                      <button onClick={() => copyCode(code)} className="text-navy-500 hover:text-navy-700 transition-colors">
                        {copied === code ? <CheckCircle size={14} className="text-emerald-700" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {!loading && tab === "referrals" && (
        chains.length === 0 ? (
          <div className="philix-card p-8 text-center text-navy-500">
            <TrendingUp size={32} className="mx-auto mb-3 text-navy-300" />
            <div className="font-semibold">No referral chains yet</div>
          </div>
        ) : (
          <div className="philix-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200 bg-warm-100">
                  <th className="text-left text-xs font-semibold text-navy-500 px-4 py-3">Referrer</th>
                  <th className="text-left text-xs font-semibold text-navy-500 px-4 py-3">Referred Client</th>
                  <th className="text-left text-xs font-semibold text-navy-500 px-4 py-3">Joined</th>
                  <th className="text-right text-xs font-semibold text-navy-500 px-4 py-3">Reward</th>
                </tr>
              </thead>
              <tbody>
                {chains.map((c, i) => (
                  <tr key={i} className="border-b border-warm-200 hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-navy-800">{c.referrer}</td>
                    <td className="px-4 py-3 text-navy-700">{c.referredName}</td>
                    <td className="px-4 py-3 text-navy-500 text-xs">{new Date(c.joinedAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">K{parseInt(rewardAmount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === "settings" && (
        <div className="max-w-lg space-y-4">
          <div className="philix-card p-5 space-y-4">
            <h3 className="font-semibold text-navy-800 mb-3 flex items-center gap-2"><Gift size={16} className="text-indigo-700" /> Programme Configuration</h3>
            <div>
              <label className="text-sm font-medium text-navy-600 mb-1.5 block">Referrer Reward (ZMW per successful referral)</label>
              <input type="number" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} className="input-base" placeholder="100" />
              <p className="text-xs text-navy-500 mt-1">Credited as a rate discount on the referrer's next loan</p>
            </div>
            <div>
              <label className="text-sm font-medium text-navy-600 mb-1.5 block">New Client Benefit — Rate Discount (%)</label>
              <input type="number" value={rateDiscount} onChange={e => setRateDiscount(e.target.value)} className="input-base" placeholder="1" />
              <p className="text-xs text-navy-500 mt-1">Applied to the referred client's first loan interest rate</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500" id="auto-reward" />
              <label htmlFor="auto-reward" className="text-sm text-navy-700">Auto-apply rewards when referred client takes first loan</label>
            </div>
            <button className="btn-primary w-full">Save Settings</button>
          </div>
          <div className="philix-card p-4">
            <h4 className="font-semibold text-navy-700 text-sm mb-3">Tier Thresholds</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-yellow-700 font-semibold">Gold</span><span className="text-navy-600">6+ referrals</span></div>
              <div className="flex justify-between"><span className="text-gray-700 font-semibold">Silver</span><span className="text-navy-600">3–5 referrals</span></div>
              <div className="flex justify-between"><span className="text-amber-700 font-semibold">Bronze</span><span className="text-navy-600">1–2 referrals</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
