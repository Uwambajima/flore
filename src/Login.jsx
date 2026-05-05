import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "./api";

const ROLES = [
  { key: "patient", label: "Patient", icon: "🧑⚕️", color: "bg-blue-600",    ring: "focus:ring-blue-400",    grad: "from-blue-600 to-cyan-500" },
  { key: "doctor",  label: "Doctor",  icon: "👨⚕️", color: "bg-emerald-600", ring: "focus:ring-emerald-400", grad: "from-emerald-600 to-teal-500" },
  { key: "cashier", label: "Cashier", icon: "💳",   color: "bg-violet-600",  ring: "focus:ring-violet-400",  grad: "from-violet-600 to-purple-500" },
];

export default function Login({ onLogin }) {
  const location = useLocation();
  const initialRole = ROLES.find(r => r.key === location.state?.role) ? location.state.role : "patient";
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const active = ROLES.find(r => r.key === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("All fields required");
    setLoading(true);
    try {
      const data = await api("/login", { method: "POST", body: JSON.stringify({ ...form, role }) });
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-6">
          ← Back
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">+</div>
            <span className="text-2xl font-extrabold text-gray-900">Health<span className="text-blue-600">Care</span></span>
          </div>
          <p className="text-gray-500 text-sm">Welcome back! Sign in to continue.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 border border-gray-100">
          {/* Role Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-2xl">
            {ROLES.map(r => (
              <button key={r.key} onClick={() => { setRole(r.key); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200
                  ${role === r.key ? `bg-gradient-to-r ${r.grad} text-white shadow-md` : "text-gray-500 hover:text-gray-700"}`}>
                <span>{r.icon}</span> {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com" autoComplete="email"
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 ${active.ring} focus:outline-none focus:border-transparent bg-gray-50 text-sm transition`} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" autoComplete="current-password"
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 ${active.ring} focus:outline-none focus:border-transparent bg-gray-50 text-sm transition pr-12`} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <div className="text-right mt-1">
                <button type="button" onClick={() => navigate("/forgot-password")}
                  className="text-xs text-blue-500 hover:text-blue-700 font-semibold hover:underline transition">
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <span className="mt-0.5">⚠️</span> <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all bg-gradient-to-r ${active.grad} hover:opacity-90 disabled:opacity-50 shadow-lg hover:shadow-xl`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Signing in...
                </span>
              ) : `Sign In as ${active.label}`}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button onClick={() => navigate("/register")} className="text-blue-600 font-bold hover:underline">
              Create one free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
