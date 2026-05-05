import { useNavigate } from "react-router-dom";

const SOCIALS = [
  { name: "Facebook", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg> },
  { name: "Twitter", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "Instagram", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { name: "LinkedIn", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { name: "YouTube", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: "GitHub", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
];

// ── Shared Header ──────────────────────────────────────
export function Header({ user, onLogout, onBook, tabs, activeTab, onTabChange }) {
  const navigate = useNavigate();
  const isDoctor  = user?.role === "doctor";
  const isCashier = user?.role === "cashier";
  const gradClass = isDoctor
    ? "from-emerald-700 to-emerald-600"
    : isCashier
    ? "from-violet-700 to-violet-600"
    : "from-blue-700 to-blue-600";

  // Admin/App header (no user)
  if (!user) {
    return (
      <header className="bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">+</div>
            <span className="text-xl font-bold text-gray-900">Health<span className="text-blue-600">Care</span></span>
          </div>
          <nav className="flex gap-1">
            {tabs?.map(t => (
              <button key={t.id} onClick={() => onTabChange(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === t.id ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}>
                <span className="mr-1.5">{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
    );
  }

  // Patient / Doctor header
  return (
    <header className={`bg-gradient-to-r ${gradClass} text-white shadow-lg sticky top-0 z-30`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")}
            className={`text-sm font-semibold transition flex items-center gap-1.5 ${isDoctor ? "text-emerald-200 hover:text-white" : "text-blue-200 hover:text-white"}`}>
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-xs font-black">+</div>
            HealthCare
          </button>
          <div className={`w-px h-5 ${isDoctor ? "bg-emerald-500" : isCashier ? "bg-violet-400" : "bg-blue-500"}`} />
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${isDoctor ? "bg-emerald-500" : isCashier ? "bg-violet-500" : "bg-blue-500"}`}>
              {isDoctor ? "👨⚕️" : isCashier ? "💳" : "🧑⚕️"}
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">{user.name}</p>
              <p className={`text-xs ${isDoctor ? "text-emerald-200" : isCashier ? "text-violet-200" : "text-blue-200"}`}>
                {isDoctor
                  ? `${user.specialty || "Doctor"}${user.experience ? ` · ${user.experience} yrs` : ""}`
                  : isCashier
                  ? "Cashier · Finance & Billing"
                  : `Patient${user.age ? ` · Age ${user.age}` : ""}${user.gender ? ` · ${user.gender}` : ""}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isDoctor && !isCashier && onBook && (
            <button onClick={onBook}
              className="px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition shadow">
              + Book Appointment
            </button>
          )}
          <button onClick={onLogout}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Shared Footer ──────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">+</div>
              <span className="text-white font-bold text-lg">Health<span className="text-blue-400">Care</span></span>
            </div>
            <p className="text-sm text-gray-500">Modern hospital management system</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex gap-2">
              {SOCIALS.map(s => (
                <a key={s.name} href={s.href} title={s.name}
                  className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} HealthCare+. All rights reserved. Built by florence software developer.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
