import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const WORDS = ["Smarter.", "Faster.", "Better.", "Safer.", "Easier."];

const ICONS = [
  { icon: "🫀", label: "Cardiology",  x: 8,  y: 15, delay: 0 },
  { icon: "🧠", label: "Neurology",   x: 85, y: 10, delay: 0.4 },
  { icon: "💊", label: "Pharmacy",    x: 5,  y: 70, delay: 0.8 },
  { icon: "🔬", label: "Lab",         x: 88, y: 65, delay: 1.2 },
  { icon: "🩺", label: "Diagnosis",   x: 12, y: 42, delay: 0.6 },
  { icon: "🩻", label: "Radiology",   x: 82, y: 38, delay: 1.0 },
  { icon: "🧬", label: "Genetics",    x: 50, y: 5,  delay: 1.4 },
  { icon: "🏥", label: "Hospital",    x: 48, y: 90, delay: 0.2 },
];

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1.5,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 8 + 6,
  opacity: Math.random() * 0.3 + 0.1,
}));

function useTypewriter(words, speed = 100, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setWordIdx(w => (w + 1) % words.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

export default function IntroPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("intro");
  const [visible, setVisible] = useState(false);
  const word = useTypewriter(WORDS);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const go = (dest) => {
    setPhase("exit");
    setTimeout(() => navigate(dest), 650);
  };

  return (
    <div className={`min-h-screen bg-[#030b18] overflow-hidden relative flex flex-col items-center justify-center
      transition-all duration-700 ${phase === "exit" ? "opacity-0 scale-[0.97]" : "opacity-100 scale-100"}`}>

      {/* Grid */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)`,
          backgroundSize: "55px 55px",
        }}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #030b18 100%)" }}
      />

      {/* Glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-700/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]" />

      {/* Particles */}
      {PARTICLES.map(p => (
        <div key={p.id}
          className="absolute rounded-full bg-blue-300 animate-ping"
          style={{
            width: p.size, height: p.size,
            left: `${p.x}%`, top: `${p.y}%`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Floating medical icons */}
      {ICONS.map((item) => (
        <div key={item.label}
          className={`absolute flex flex-col items-center gap-1 transition-all duration-1000
            ${visible ? "opacity-100" : "opacity-0"}`}
          style={{
            left: `${item.x}%`, top: `${item.y}%`,
            transitionDelay: `${item.delay + 0.5}s`,
            animation: `float ${4 + item.delay}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
          }}
        >
          <div className="w-12 h-12 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm shadow-lg hover:bg-white/[0.08] transition-all cursor-default">
            {item.icon}
          </div>
          <span className="text-white/20 text-[10px] font-medium tracking-wide">{item.label}</span>
        </div>
      ))}

      {/* Heartbeat line */}
      <div className={`absolute top-[12%] left-1/2 -translate-x-1/2 w-64 transition-all duration-1000 delay-300
        ${visible ? "opacity-100" : "opacity-0"}`}>
        <svg viewBox="0 0 260 50" className="w-full" fill="none">
          <polyline
            points="0,25 30,25 45,10 55,40 65,5 75,45 85,25 130,25 145,10 155,40 165,5 175,45 185,25 260,25"
            stroke="url(#hbGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="heartbeat-line"
          />
          <defs>
            <linearGradient id="hbGrad" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

        {/* Logo — stagger 1 */}
        <div className={`flex items-center gap-3 mb-5 transition-all duration-700
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.1s" }}>
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/40">
              +
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-30 -z-10" />
          </div>
          <span className="text-4xl font-extrabold text-white tracking-tight">
            Health<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Care</span>
          </span>
        </div>

        {/* Badge — stagger 2 */}
        <div className={`transition-all duration-700 mb-8 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.25s" }}>
          <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold px-5 py-2 rounded-full tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
            Hospital Management System
          </span>
        </div>

        {/* Welcome — stagger 3 */}
        <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.4s" }}>
          <h1 className="text-7xl md:text-9xl font-black text-white leading-none tracking-tighter mb-3"
            style={{ textShadow: "0 0 80px rgba(59,130,246,0.3)" }}>
            Welcome
          </h1>
        </div>

        {/* Typewriter — stagger 4 */}
        <div className={`transition-all duration-700 mb-4 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.55s" }}>
          <h2 className="text-2xl md:text-3xl font-bold h-10 flex items-center justify-center gap-2">
            <span className="text-white/50">Healthcare made</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 min-w-[110px] text-left">
              {word}
            </span>
            <span className="w-0.5 h-7 bg-blue-400 animate-pulse rounded-full" />
          </h2>
        </div>

        {/* Subtitle — stagger 5 */}
        <div className={`transition-all duration-700 mb-12 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.7s" }}>
          <p className="text-white/35 text-base max-w-sm leading-relaxed">
            Connecting patients and doctors for a healthier tomorrow.
          </p>
        </div>

        {/* Buttons — stagger 6 */}
        <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.85s" }}>

          <button onClick={() => go("/register")}
            className="group relative px-12 py-4 rounded-2xl font-bold text-white text-base overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-400" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 blur-xl opacity-0 group-hover:opacity-60 transition-opacity" />
            <span className="relative flex items-center gap-2">
              Get Started
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <button onClick={() => go("/login")}
            className="group px-12 py-4 rounded-2xl font-bold text-white/80 text-base border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25 hover:text-white hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <span className="flex items-center gap-2">
              Sign In
              <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
            </span>
          </button>
        </div>

        {/* Stats row — stagger 7 */}
        <div className={`flex items-center gap-8 mt-14 transition-all duration-700
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "1s" }}>
          {[["500+", "Doctors"], ["12K+", "Patients"], ["98%", "Satisfaction"]].map(([val, lbl]) => (
            <div key={lbl} className="flex flex-col items-center">
              <span className="text-white font-extrabold text-lg leading-none">{val}</span>
              <span className="text-white/25 text-xs mt-1 tracking-wide">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className={`absolute bottom-6 text-white/15 text-xs tracking-widest transition-all duration-1000 delay-[1200ms]
        ${visible ? "opacity-100" : "opacity-0"}`}>
        🔒 Secure · Private · 24/7 Available
      </div>

      {/* Float keyframe */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .heartbeat-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: draw 2.5s ease forwards 0.8s;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
