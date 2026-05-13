import { useState, useEffect, useCallback } from "react";
import { Link2, Search, ArrowUpDown, RotateCcw, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { urlAPI } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";
import UrlCard from "../../components/ui/UrlCard";
import AnalyticsModal from "../../components/ui/AnalyticsModal";
import Button from "../../components/ui/Button";
import WarpSpinner from "../../components/ui/WarpSpinner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [longUrl, setLongUrl] = useState("");
  const [shortenLoading, setShortenLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [analyticsUrl, setAnalyticsUrl] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  /* Fetch URLs */
  const fetchUrls = useCallback(async () => {
    setUrlsLoading(true);
    try {
      const { data } = await urlAPI.getMyUrls();
      setUrls(data || []);
    } catch {
      toast.error("Failed to load your links");
    } finally {
      setUrlsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  /* Shorten */
  const handleShorten = async (e) => {
    e.preventDefault();
    const trimmed = longUrl.trim();
    if (!trimmed) { toast.error("Please paste a URL first"); return; }
    if (!/^https?:\/\/.+/.test(trimmed)) {
      toast.error("URL must start with http:// or https://"); return;
    }
    setShortenLoading(true);
    try {
      const { data } = await urlAPI.shorten(trimmed);
      setUrls((prev) => [data, ...prev]);
      setLongUrl("");
      toast.success("URL warped! ⚡", { duration: 3000 });
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.shortUrl);
        toast.success("Short URL copied to clipboard", { icon: "📋", duration: 2000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to shorten URL");
    } finally {
      setShortenLoading(false);
    }
  };

  /* Filter + Sort */
  const filtered = urls
    .filter((u) =>
      !search ||
      u.originalUrl?.toLowerCase().includes(search.toLowerCase()) ||
      u.shortUrl?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "clicks"
        ? (b.clickCount || 0) - (a.clickCount || 0)
        : new Date(b.createdDate || 0) - new Date(a.createdDate || 0)
    );

  const totalClicks = urls.reduce((s, u) => s + (u.clickCount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pb-20">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative py-14 overflow-hidden">
          {/* Background orbs */}
          <div className="absolute pointer-events-none"
            style={{
              width: 480, height: 280, top: 0, left: -80,
              background: "radial-gradient(ellipse,rgba(37,99,235,0.07) 0%,transparent 70%)",
              filter: "blur(50px)",
              animation: "float 10s ease-in-out infinite",
            }} />
          <div className="absolute pointer-events-none"
            style={{
              width: 360, height: 280, top: 0, right: -60,
              background: "radial-gradient(ellipse,rgba(14,165,233,0.07) 0%,transparent 70%)",
              filter: "blur(50px)",
              animation: "float 8s ease-in-out infinite reverse",
            }} />

          <div className="relative z-10">
            {/* Greeting pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-5 text-sm font-medium animate-fade-up"
              style={{ background: "rgba(239,246,255,0.8)", borderColor: "#bfdbfe", color: "#1d4ed8" }}>
              <span>👋</span> Welcome back, <strong>{user?.username}</strong>
            </div>

            <h1
              className="font-display font-bold leading-[1.08] mb-3 animate-fade-up"
              style={{ fontSize: "clamp(30px,5vw,54px)", animationDelay: "0.08s" }}
            >
              Warp any URL into{" "}
              <span className="gradient-text">light speed</span>
            </h1>

            <p className="text-slate-500 text-base max-w-lg mb-8 animate-fade-up" style={{ animationDelay: "0.16s" }}>
              Paste your long URL below and get a sharp, trackable short link in milliseconds.
            </p>

            {/* Shorten form */}
            <form onSubmit={handleShorten}
              className="flex gap-3 max-w-3xl animate-fade-up"
              style={{ animationDelay: "0.24s" }}>
              <div
                className="flex items-center gap-3 flex-1 rounded-2xl px-4 transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  border: "1.5px solid rgba(37,99,235,0.2)",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.07)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0ea5e9";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12), 0 0 30px rgba(14,165,233,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(37,99,235,0.2)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.07)";
                }}
              >
                <Link2 size={18} className="text-warp-400 shrink-0" />
                <input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="https://your-very-long-url.com/paste/it/here..."
                  disabled={shortenLoading}
                  className="flex-1 py-5 text-[15px] bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                />
                {longUrl && (
                  <button type="button" onClick={() => setLongUrl("")}
                    className="text-slate-400 hover:text-slate-600 text-xs shrink-0 px-1">
                    ✕
                  </button>
                )}
              </div>
              <Button type="submit" loading={shortenLoading} size="lg"
                style={{ whiteSpace: "nowrap", minWidth: 140 }}>
                <Zap size={15} /> Warp It
              </Button>
            </form>

            {/* Stats row */}
            <div
              className="inline-flex items-center mt-8 rounded-2xl overflow-hidden border animate-fade-up"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(203,213,225,0.6)",
                animationDelay: "0.32s",
              }}
            >
              {[
                ["Links Created", urls.length],
                ["Total Clicks", totalClicks.toLocaleString()],
                ["Avg per Link", urls.length ? Math.round(totalClicks / urls.length) : 0],
              ].map(([k, v], i) => (
                <div key={k} className="flex flex-col items-center px-7 py-3.5 border-r border-slate-200/60 last:border-r-0">
                  <span className="font-display font-bold text-2xl text-warp-600 leading-none">{v}</span>
                  <span className="font-display text-[9px] uppercase tracking-wider text-slate-400 mt-1">{k}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── URL List ─────────────────────────────────────────── */}
        <section>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-3">
              Your Links
              <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#2563eb,#0ea5e9)" }}>
                {urls.length}
              </span>
            </h2>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.85)", borderColor: "rgba(203,213,225,0.7)" }}>
                <Search size={13} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search links…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-sm w-44 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
                  style={{ fontFamily: "DM Sans,sans-serif" }}
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.85)", borderColor: "rgba(203,213,225,0.7)" }}>
                <ArrowUpDown size={12} className="text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm bg-transparent border-none outline-none text-slate-600 cursor-pointer"
                  style={{ fontFamily: "DM Sans,sans-serif" }}
                >
                  <option value="newest">Newest first</option>
                  <option value="clicks">Most clicks</option>
                </select>
              </div>

              <button
                onClick={fetchUrls}
                disabled={urlsLoading}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm text-slate-500 hover:text-warp-600 hover:border-warp-300 transition-colors"
                style={{ background: "rgba(255,255,255,0.85)", borderColor: "rgba(203,213,225,0.7)" }}
              >
                <RotateCcw size={12} className={urlsLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          {urlsLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-400">
              <WarpSpinner size={52} />
              <p className="text-sm">Loading your links…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <span className="text-5xl">{search ? "🔍" : "🚀"}</span>
              {search
                ? <><p className="text-sm">No links match "<strong className="text-slate-600">{search}</strong>"</p>
                    <button onClick={() => setSearch("")} className="text-warp-500 text-sm hover:text-warp-700 underline underline-offset-2">Clear search</button></>
                : <p className="text-sm">No links yet — warp your first URL above!</p>
              }
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((url, i) => (
                <UrlCard key={url.id ?? url.shortUrl} url={url} index={i} onAnalytics={setAnalyticsUrl} />
              ))}
            </div>
          )}
        </section>
      </main>

      {analyticsUrl && (
        <AnalyticsModal url={analyticsUrl} onClose={() => setAnalyticsUrl(null)} />
      )}
    </div>
  );
}
