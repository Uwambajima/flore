import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID  = "service_wfxkocc";
const EMAILJS_TEMPLATE_ID = "template_1oq99sm";
const EMAILJS_PUBLIC_KEY  = "rkRRUNntjzkJf-8tK";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=verify code, 3=new password
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const sentCode = useRef("");

  // Step 1 — check email exists then send code
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email.");
    setLoading(true);
    try {
      const code = generateCode();
      sentCode.current = code;
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { to_email: email.trim().toLowerCase(), otp_code: code },
        EMAILJS_PUBLIC_KEY
      );
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify the code
  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError("");
    if (!codeInput.trim()) return setError("Please enter the code.");
    if (codeInput.trim() !== sentCode.current) return setError("Invalid code. Please try again.");
    setStep(3);
  };

  // Step 3 — reset password
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.password || !form.confirm) return setError("All fields required.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const rRes = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: form.password }),
      });
      const rText = await rRes.text();
      let rData;
      try { rData = JSON.parse(rText); } catch { throw new Error("Server is unavailable. Please try again later."); }
      if (!rRes.ok) throw new Error(rData.error);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Verify Email", "Enter Code", "New Password"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <button onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-6">
          ← Back to Sign In
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">+</div>
            <span className="text-2xl font-extrabold text-gray-900">Health<span className="text-blue-600">Care</span></span>
          </div>
          <p className="text-gray-500 text-sm">Reset your password</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 border border-gray-100">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0
                    ${step >= s ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-gray-100 text-gray-400"}`}>
                    {step > s ? "✓" : s}
                  </div>
                  <span className={`text-xs font-semibold transition-colors whitespace-nowrap ${step >= s ? "text-gray-700" : "text-gray-400"}`}>
                    {label}
                  </span>
                  {s < STEPS.length && <div className={`flex-1 h-0.5 rounded transition-all duration-500 ${step > s ? "bg-blue-600" : "bg-gray-100"}`} />}
                </div>
              );
            })}
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset!</h3>
              <p className="text-gray-500 text-sm">Redirecting you to sign in...</p>
            </div>

          ) : step === 1 ? (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🔑</div>
                <h2 className="text-lg font-bold text-gray-900">Forgot your password?</h2>
                <p className="text-gray-400 text-sm mt-1">Enter the email linked to your account.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-sm transition" />
              </div>
              {error && <ErrorBox msg={error} />}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 shadow-lg transition-all">
                {loading ? <Spinner text="Sending code..." /> : "Send Reset Code →"}
              </button>
            </form>

          ) : step === 2 ? (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">📧</div>
                <h2 className="text-lg font-bold text-gray-900">Check your email</h2>
                <p className="text-gray-400 text-sm mt-1">
                  We sent a 6-digit code to <span className="text-blue-600 font-semibold">{email}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reset Code</label>
                <input type="text" value={codeInput} onChange={e => setCodeInput(e.target.value)}
                  placeholder="123456" maxLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-sm text-center tracking-[0.5em] font-bold transition" />
              </div>
              {error && <ErrorBox msg={error} />}
              <button type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 shadow-lg transition-all">
                Verify Code →
              </button>
              <button type="button" onClick={() => { setStep(1); setError(""); setCodeInput(""); }}
                className="w-full text-center text-sm text-gray-400 hover:text-blue-600 transition">
                ← Use a different email
              </button>
            </form>

          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🔒</div>
                <h2 className="text-lg font-bold text-gray-900">Set new password</h2>
                <p className="text-gray-400 text-sm mt-1">For <span className="text-blue-600 font-semibold">{email}</span></p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-sm transition pr-12" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <input type={showPw ? "text" : "password"} value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-sm transition" />
              </div>
              {form.password && <PasswordStrength password={form.password} />}
              {error && <ErrorBox msg={error} />}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 shadow-lg transition-all">
                {loading ? <Spinner text="Resetting..." /> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
      <span className="mt-0.5">⚠️</span> <span>{msg}</span>
    </div>
  );
}

function Spinner({ text }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      {text}
    </span>
  );
}

function PasswordStrength({ password }) {
  const checks = [password.length >= 6, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-400", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : "bg-gray-100"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? "text-red-400" : score === 2 ? "text-yellow-500" : score === 3 ? "text-blue-500" : "text-green-500"}`}>
        {labels[score]}
      </p>
    </div>
  );
}
