import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { X, RefreshCw, ExternalLink, TrendingUp, MousePointer, Calendar, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";
import { urlAPI } from "../../api/client";
import WarpSpinner from "./WarpSpinner";
import Button from "./Button";

const PRESETS = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3.5 py-2.5 rounded-xl border"
      style={{
        background: "rgba(15,23,42,0.9)", backdropFilter: "blur(12px)",
        borderColor: "rgba(14,165,233,0.35)",
        boxShadow: "0 0 20px rgba(14,165,233,0.2)",
      }}>
      <div className="font-mono-custom text-[10px] text-slate-400 mb-1">{label}</div>
      <div className="flex items-center gap-2 text-white text-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-warp-neon" style={{ boxShadow: "0 0 6px #0ea5e9" }} />
        {payload[0].value} clicks
      </div>
    </div>
  );
};

export default function AnalyticsModal({ url, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  const shortCode = url?.shortUrl?.split("/").pop();

  const load = useCallback(async () => {
    if (!shortCode) return;
    setLoading(true);
    try {
      const end = endOfDay(new Date());
      const start = startOfDay(subDays(new Date(), days - 1));
      const fmt = (d) => format(d, "yyyy-MM-dd'T'HH:mm:ss");
      const { data: res } = await urlAPI.getAnalytics(shortCode, fmt(start), fmt(end));

      // Fill missing days with 0
      const map = {};
      (res || []).forEach((r) => { map[r.clickDate] = r.count; });
      const filled = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, "yyyy-MM-dd");
        filled.push({ date: format(d, "MMM d"), clicks: map[key] || 0 });
      }
      setData(filled);
    } catch {
      toast.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [shortCode, days]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const total = data.reduce((s, d) => s + d.clicks, 0);
  const peak  = Math.max(...data.map((d) => d.clicks), 0);
  const avg   = data.length ? (total / data.length).toFixed(1) : "0";

  const statCards = [
    { icon: MousePointer, label: "All-time", value: url?.clickCount ?? "—" },
    { icon: TrendingUp,   label: "Period",   value: total,    accent: true },
    { icon: BarChart2,    label: "Peak Day", value: peak },
    { icon: Calendar,     label: "Daily Avg",value: avg },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden border animate-scale-in"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(28px)",
          borderColor: "rgba(37,99,235,0.2)",
          boxShadow: "0 32px 80px rgba(15,23,42,0.18), 0 0 60px rgba(14,165,233,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe" }}>
              📊
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">Link Analytics</h2>
              <a href={url?.shortUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-warp-500 font-mono-custom hover:text-warp-700 flex items-center gap-1 hover:underline">
                {url?.shortUrl} <ExternalLink size={9} />
              </a>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 px-7 pt-5">
          {statCards.map(({ icon: Icon, label, value, accent }) => (
            <div key={label}
              className="flex flex-col gap-1 p-3.5 rounded-2xl border"
              style={{ background: "rgba(248,250,255,0.8)", borderColor: "rgba(203,213,225,0.5)" }}>
              <span className="text-[10px] font-display uppercase tracking-wider text-slate-400">{label}</span>
              <span className={`font-display font-bold text-2xl leading-none ${accent ? "text-warp-600" : "text-slate-800"}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Original URL */}
        <div className="mx-7 mt-4 px-3.5 py-2.5 rounded-xl border flex items-center gap-2 overflow-hidden"
          style={{ background: "rgba(248,250,255,0.8)", borderColor: "rgba(203,213,225,0.5)" }}>
          <span className="text-[10px] text-warp-400 font-mono-custom shrink-0">↪ ORIGINAL</span>
          <span className="text-xs text-slate-500 truncate" title={url?.originalUrl}>{url?.originalUrl}</span>
        </div>

        {/* Day presets */}
        <div className="flex items-center gap-2 px-7 mt-4">
          {PRESETS.map((p) => (
            <button key={p.days} onClick={() => setDays(p.days)}
              className="font-display font-semibold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all duration-200"
              style={days === p.days
                ? { background: "linear-gradient(135deg,#2563eb,#0ea5e9)", color: "white", border: "none", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }
                : { background: "rgba(248,250,255,0.8)", borderColor: "rgba(203,213,225,0.5)", color: "#94a3b8" }
              }>
              {p.label}
            </button>
          ))}
          <button onClick={load}
            className={`ml-auto flex items-center gap-1.5 text-[11px] font-display font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border text-slate-400 hover:text-warp-600 hover:border-warp-300 transition-colors ${loading ? "opacity-50" : ""}`}
            disabled={loading}>
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Chart */}
        <div className="px-4 mt-4 h-64 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
              <WarpSpinner size={44} /> Fetching analytics…
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <span className="text-4xl">📭</span>
              <p className="text-sm">No clicks in this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis
                  dataKey="date" tickLine={false} axisLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "Space Mono" }}
                  interval={days > 14 ? 4 : 1}
                />
                <YAxis
                  tickLine={false} axisLine={false} allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "Space Mono" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="clicks"
                  stroke="#0ea5e9" strokeWidth={2.5}
                  fill="url(#cg)"
                  dot={{ fill: "#0ea5e9", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#0ea5e9", stroke: "white", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-7 py-5 mt-1 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} size="sm">Close</Button>
          <Button variant="secondary" onClick={load} loading={loading} size="sm">
            <RefreshCw size={12} /> Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
