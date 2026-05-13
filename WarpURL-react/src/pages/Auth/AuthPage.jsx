import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

/* ── Validation ─────────────────────────────────────────────── */
function validateLogin({ username, password }) {
  const e = {};
  if (!username.trim()) e.username = "Username is required";
  if (!password)        e.password = "Password is required";
  else if (password.length < 6) e.password = "Min 6 characters";
  return e;
}

function validateRegister({ username, email, password }) {
  const e = {};
  if (!username.trim())    e.username = "Username is required";
  else if (username.length < 3) e.username = "Min 3 characters";
  if (!email.trim())       e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
  if (!password)           e.password = "Password is required";
  else if (password.length < 6) e.password = "Min 6 characters";
  return e;
}

/* ── Floating orb ───────────────────────────────────────────── */
function Orb({ className, style }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ filter: "blur(70px)", ...style }}
    />
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginF, setLoginF] = useState({ username: "", password: "" });
  const [regF,   setRegF]   = useState({ username: "", email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggle = (m) => { setMode(m); setErrors({}); };

  /* Login */
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validateLogin(loginF);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authAPI.login(loginF);
      login(data.token, { username: loginF.username });
      toast.success("Welcome back ⚡");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  /* Register */
  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateRegister(regF);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await authAPI.register(regF);
      const { data } = await authAPI.login({ username: regF.username, password: regF.password });
      login(data.token, { username: regF.username, email: regF.email });
      toast.success("Account created! 🚀");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Orbs */}
      <Orb className="w-[600px] h-[500px] -top-48 -left-24 animate-float"
        style={{ background: "radial-gradient(circle,rgba(37,99,235,0.13) 0%,transparent 70%)" }} />
      <Orb className="w-[500px] h-[400px] -bottom-32 -right-16 animate-float"
        style={{ background: "radial-gradient(circle,rgba(14,165,233,0.11) 0%,transparent 70%)", animationDelay: "3s" }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[880px] min-h-[600px] rounded-3xl overflow-hidden flex animate-scale-in"
        style={{ boxShadow: "0 32px 80px rgba(15,23,42,0.14), 0 0 60px rgba(37,99,235,0.09)", border: "1px solid rgba(37,99,235,0.18)" }}
      >
        {/* ── Left brand panel ──────────────────────────────── */}
        <div
          className="hidden md:flex flex-col justify-center p-12 relative overflow-hidden"
          style={{
            flex: "0 0 42%",
            background: "linear-gradient(145deg,#0f172a 0%,#1e3a8a 65%,#1e40af 100%)",
          }}
        >
          {/* grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
          {/* glow blob */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle,#0ea5e9,transparent 70%)" }} />

          <div className="relative z-10 flex flex-col gap-8">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow"
                  style={{ borderTopColor: "#60a5fa", borderRightColor: "rgba(96,165,250,0.2)" }} />
                <div className="absolute rounded-full border-2 border-transparent animate-spin-reverse"
                  style={{ inset: 9, borderBottomColor: "#0ea5e9", borderLeftColor: "rgba(14,165,233,0.2)" }} />
                <Zap size={18} className="relative z-10 text-blue-300" />
              </div>
              <div>
                <div className="font-display font-bold text-3xl text-white tracking-wider">WARP</div>
                <div className="font-display font-medium text-xs text-blue-400 tracking-[0.25em]">URL</div>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <h2 className="font-display font-bold text-3xl text-white leading-tight">
                Compress the Web.
              </h2>
              <h2 className="font-display font-bold text-3xl text-blue-400 leading-tight">
                Amplify your Reach.
              </h2>
            </div>

            <p className="text-sm text-blue-200/70 leading-relaxed max-w-[260px]">
              Enterprise-grade link shortening with real-time analytics and JWT-secured access.
            </p>

            {/* Mini stats */}
            <div className="flex items-center gap-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm self-start">
              {[["∞", "Links"], ["⚡", "Fast"], ["🔐", "Secure"]].map(([v, k], i) => (
                <div key={k} className="flex flex-col items-center px-5 py-3 border-r border-white/10 last:border-r-0">
                  <span className="text-xl leading-none mb-0.5">{v}</span>
                  <span className="font-display text-[9px] uppercase tracking-wider text-white/40">{k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ──────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-12"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(24px)" }}>
          <div className="w-full max-w-sm">

            {/* Toggle */}
            <div className="relative flex bg-slate-100 rounded-2xl p-1 mb-8 border border-slate-200/60">
              {/* Sliding indicator */}
              <div
                className="absolute top-1 bottom-1 rounded-xl transition-all duration-500 border border-warp-300/40"
                style={{
                  width: "calc(50% - 4px)",
                  left: mode === "login" ? 4 : "calc(50%)",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.1)",
                  transition: "left 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => toggle(m)}
                  className={`relative z-10 flex-1 py-2.5 font-display font-semibold text-[12px] uppercase tracking-[0.08em] rounded-xl transition-colors duration-200 ${
                    mode === m ? "text-warp-700" : "text-slate-400"
                  }`}
                >
                  {m === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>

            {/* Sliding forms */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{
                  width: "200%",
                  transform: mode === "register" ? "translateX(-50%)" : "translateX(0)",
                  transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {/* LOGIN */}
                <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4" style={{ width: "50%" }}>
                  <div className="mb-1">
                    <h3 className="font-display font-bold text-xl text-slate-900">Welcome back</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Sign in to your WarpURL account</p>
                  </div>
                  <Input label="Username" placeholder="your_username" value={loginF.username}
                    onChange={(e) => setLoginF((p) => ({ ...p, username: e.target.value }))}
                    error={errors.username} icon={User} autoComplete="username" />
                  <Input label="Password" type="password" placeholder="••••••••" value={loginF.password}
                    onChange={(e) => setLoginF((p) => ({ ...p, password: e.target.value }))}
                    error={errors.password} icon={Lock} autoComplete="current-password" />
                  <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
                    ⚡ Warp In
                  </Button>
                  <p className="text-center text-sm text-slate-400">
                    No account?{" "}
                    <button type="button" onClick={() => toggle("register")}
                      className="text-warp-600 font-medium hover:text-warp-700 underline underline-offset-2">
                      Register now
                    </button>
                  </p>
                </form>

                {/* REGISTER */}
                <form onSubmit={handleRegister} noValidate className="flex flex-col gap-4" style={{ width: "50%" }}>
                  <div className="mb-1">
                    <h3 className="font-display font-bold text-xl text-slate-900">Create account</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Join WarpURL — it's free</p>
                  </div>
                  <Input label="Username" placeholder="cool_username" value={regF.username}
                    onChange={(e) => setRegF((p) => ({ ...p, username: e.target.value }))}
                    error={errors.username} icon={User} autoComplete="username" />
                  <Input label="Email" type="email" placeholder="you@example.com" value={regF.email}
                    onChange={(e) => setRegF((p) => ({ ...p, email: e.target.value }))}
                    error={errors.email} icon={Mail} autoComplete="email" />
                  <Input label="Password" type="password" placeholder="min 6 characters" value={regF.password}
                    onChange={(e) => setRegF((p) => ({ ...p, password: e.target.value }))}
                    error={errors.password} icon={Lock} autoComplete="new-password" />
                  <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
                    🚀 Launch Account
                  </Button>
                  <p className="text-center text-sm text-slate-400">
                    Have an account?{" "}
                    <button type="button" onClick={() => toggle("login")}
                      className="text-warp-600 font-medium hover:text-warp-700 underline underline-offset-2">
                      Sign in
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
