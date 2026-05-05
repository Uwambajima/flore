import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "📅", title: "Easy Appointments", desc: "Book and manage appointments with your doctor in seconds.", color: "bg-blue-50 text-blue-600" },
  { icon: "🔒", title: "Secure & Private", desc: "Your health data is encrypted and never shared without consent.", color: "bg-purple-50 text-purple-600" },
  { icon: "👨‍⚕️", title: "Expert Doctors", desc: "Access a wide network of certified specialists across all fields.", color: "bg-green-50 text-green-600" },
  { icon: "📊", title: "Health Records", desc: "View your full appointment history and medical profile anytime.", color: "bg-orange-50 text-orange-600" },
  { icon: "🔔", title: "Real-time Updates", desc: "Get instant notifications on appointment confirmations.", color: "bg-pink-50 text-pink-600" },
  { icon: "💊", title: "Specialty Care", desc: "From cardiology to pediatrics — find the right specialist.", color: "bg-cyan-50 text-cyan-600" },
];

const STATS = [
  { value: 500, suffix: "+", label: "Doctors" },
  { value: 12000, suffix: "+", label: "Patients" },
  { value: 98, suffix: "%", label: "Satisfaction" },
  { value: 24, suffix: "/7", label: "Support" },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Patient", text: "Booking my appointment was so easy. The doctor was amazing and the whole process took less than 2 minutes!", avatar: "👩‍🦰", stars: 5 },
  { name: "Dr. James K.", role: "Cardiologist", text: "Managing my patients has never been this streamlined. I can see all my appointments at a glance.", avatar: "👨‍⚕️", stars: 5 },
  { name: "Amina T.", role: "Patient", text: "I love how I can see all my appointments in one place. The interface is clean and very easy to use.", avatar: "👩", stars: 5 },
];

const SOCIALS = [
  { name: "Facebook", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg> },
  { name: "Twitter", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: "Instagram", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { name: "LinkedIn", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { name: "YouTube", href: "#", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
];

function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ value, suffix, label }) {
  const count = useCounter(value);
  return (
    <div className="text-center p-6">
      <p className="text-4xl md:text-5xl font-extrabold text-white">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-blue-200 mt-2 text-sm font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">+</div>
            <span className="text-xl font-bold text-gray-900">Health<span className="text-blue-600">Care</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#how" className="hover:text-blue-600 transition">How it works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition">Reviews</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition">
              Sign In
            </button>
            <button onClick={() => navigate("/register")}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
              🏥 Hospital Management System
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              Your Health,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                Our Priority
              </span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              A modern platform connecting patients and doctors. Book appointments, manage records, and deliver better care — all in one place.
            </p>

            {/* Role Cards */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              {[
                { role: "patient", icon: "🧑‍⚕️", title: "I'm a Patient", desc: "Book appointments & view your health records", grad: "from-blue-500 to-cyan-400", border: "border-blue-400/30" },
                { role: "doctor",  icon: "👨‍⚕️", title: "I'm a Doctor",  desc: "Manage your patients & schedule", grad: "from-emerald-500 to-teal-400", border: "border-emerald-400/30" },
              ].map(r => (
                <button key={r.role}
                  onClick={() => navigate("/login", { state: { role: r.role } })}
                  className={`group flex-1 max-w-sm mx-auto sm:mx-0 bg-gradient-to-br ${r.grad} rounded-2xl p-6 text-left shadow-2xl border ${r.border} hover:scale-105 hover:shadow-blue-500/25 transition-all duration-300`}>
                  <div className="text-4xl mb-3">{r.icon}</div>
                  <p className="text-lg font-bold mb-1">{r.title}</p>
                  <p className="text-sm text-white/80">{r.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                    Sign in <span className="text-lg">→</span>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-blue-200 text-sm">
              New here?{" "}
              <button onClick={() => navigate("/register")} className="text-white font-bold underline underline-offset-2 hover:no-underline">
                Create a free account
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Everything you need</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Powerful tools designed for both patients and healthcare professionals.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center text-2xl mb-4`}>{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Process</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">How it works</h2>
            <p className="text-gray-500 mt-3">Get started in just 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            {[
              { step: "01", icon: "📝", title: "Create Account", desc: "Register as a patient or doctor in under a minute with your basic details.", color: "bg-blue-600" },
              { step: "02", icon: "🔍", title: "Find Your Doctor", desc: "Browse certified specialists by specialty and choose the right one for you.", color: "bg-indigo-600" },
              { step: "03", icon: "✅", title: "Book & Confirm", desc: "Pick a date, confirm your appointment, and receive instant confirmation.", color: "bg-purple-600" },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center text-center relative">
                <div className={`w-16 h-16 rounded-2xl ${s.color} text-white flex items-center justify-center text-2xl font-black mb-4 shadow-lg z-10`}>
                  {s.step}
                </div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">What people say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex gap-1 mb-4">
                  {Array(t.stars).fill(0).map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t pt-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">Ready to get started?</h2>
          <p className="text-blue-200 mb-10 text-lg">Join thousands of patients and doctors already using HealthCare+</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/register")}
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition shadow-xl text-sm">
              Create Free Account
            </button>
            <button onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white/15 backdrop-blur text-white font-bold rounded-2xl hover:bg-white/25 transition border border-white/20 text-sm">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">+</div>
                <span className="text-white font-bold text-lg">Health<span className="text-blue-400">Care</span></span>
              </div>
              <p className="text-sm text-gray-500">Modern hospital management system</p>
            </div>
            <div className="flex gap-3">
              {SOCIALS.map(s => (
                <a key={s.name} href={s.href} title={s.name}
                  className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} HealthCare+. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
