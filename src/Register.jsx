import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api";

const ROLES = [
  { key: "patient",  label: "Patient",  icon: "🧑⚕️", grad: "from-blue-600 to-cyan-500",    ring: "focus:ring-blue-400" },
  { key: "doctor",   label: "Doctor",   icon: "👨⚕️", grad: "from-emerald-600 to-teal-500", ring: "focus:ring-emerald-400" },
  { key: "cashier",  label: "Cashier",  icon: "💳",   grad: "from-violet-600 to-purple-500", ring: "focus:ring-violet-400" },
];

const SPECIALTIES = [
  "Cardiology","Dermatology","Neurology","Orthopedics",
  "Pediatrics","Psychiatry","Radiology","Surgery","General Medicine",
];

export default function Register() {
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    age: "", gender: "", phone: "", address: "",
    doctor_id: "", specialty: "", experience: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const active = ROLES.find(r => r.key === role);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirmPassword)
      return setError("All fields required");
    if (form.password !== form.confirmPassword)
      return setError("Passwords don't match");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (role === "patient" && (!form.age || !form.gender || !form.phone))
      return setError("Age, gender and phone are required");
    if (role === "doctor" && (!form.doctor_id || !form.specialty))
      return setError("Doctor ID and specialty are required");

    setLoading(true);
    try {
      await api("/register", { method: "POST", body: JSON.stringify({ ...form, role }) });
      navigate("/login", { state: { role } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-6">
          ← Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">+</div>
            <span className="text-2xl font-extrabold text-gray-900">Health<span className="text-blue-600">Care</span></span>
          </div>
          <p className="text-gray-500 text-sm">Create your account to get started.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 border border-gray-100">
          {/* Role Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-2xl">
            {ROLES.map(r => (
              <button key={r.key} onClick={() => { setRole(r.key); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                  ${role === r.key ? `bg-gradient-to-r ${r.grad} text-white shadow-md` : "text-gray-500 hover:text-gray-700"}`}>
                <span>{r.icon}</span> {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common */}
            <Field label="Full Name" type="text" value={form.name} onChange={set("name")}
              placeholder={role === "doctor" ? "Dr. John Smith" : "John Doe"} ring={active.ring} />
            <Field label="Email Address" type="email" value={form.email} onChange={set("email")}
              placeholder="your@email.com" ring={active.ring} />

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Field label="Password" type={showPw ? "text" : "password"} value={form.password}
                  onChange={set("password")} placeholder="••••••••" ring={active.ring} />
              </div>
              <Field label="Confirm Password" type={showPw ? "text" : "password"} value={form.confirmPassword}
                onChange={set("confirmPassword")} placeholder="••••••••" ring={active.ring} />
            </div>
            <div className="flex items-center justify-between -mt-1">
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={showPw} onChange={() => setShowPw(p => !p)} className="rounded" />
                Show passwords
              </label>
              <Link to="/forgot-password" className="text-xs text-blue-500 hover:text-blue-700 font-semibold hover:underline transition">
                Forgot password?
              </Link>
            </div>

            {/* Patient Fields */}
            {role === "patient" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Age" type="number" value={form.age} onChange={set("age")} placeholder="25" ring={active.ring} />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                    <select value={form.gender} onChange={set("gender")}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 ${active.ring} focus:outline-none bg-gray-50 text-sm`}>
                      <option value="">Select gender</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <Field label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 234 567 8900" ring={active.ring} />
                <Field label="Address" type="text" value={form.address} onChange={set("address")} placeholder="123 Main St, City" ring={active.ring} />
              </>
            )}

            {/* Cashier Fields */}
            {role === "cashier" && (
              <>
                <Field label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 234 567 8900" ring={active.ring} />
                <Field label="Employee ID" type="text" value={form.doctor_id} onChange={set("doctor_id")} placeholder="C001" ring={active.ring} />
              </>
            )}
            {role === "doctor" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Doctor ID" type="text" value={form.doctor_id} onChange={set("doctor_id")} placeholder="D001" ring={active.ring} />
                  <Field label="Years of Experience" type="number" value={form.experience} onChange={set("experience")} placeholder="5" ring={active.ring} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specialty</label>
                  <select value={form.specialty} onChange={set("specialty")}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 ${active.ring} focus:outline-none bg-gray-50 text-sm`}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}

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
                  Creating account...
                </span>
              ) : `Register as ${active.label}`}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-blue-600 font-bold hover:underline">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ring, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input {...props} className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 ${ring} focus:outline-none focus:border-transparent bg-gray-50 text-sm transition`} />
    </div>
  );
}
