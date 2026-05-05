import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IntroPage from "./IntroPage";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";
import CashierDashboard from "./CashierDashboard";

export default function AppRouter() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("hc_user")); } catch { return null; }
  });

  const handleLogin = (u) => {
    sessionStorage.setItem("hc_user", JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("hc_user");
    setUser(null);
  };

  const home = user
    ? user.role === "doctor" ? "/doctor/dashboard"
    : user.role === "cashier" ? "/cashier/dashboard"
    : "/patient/dashboard"
    : "/";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <IntroPage /> : <Navigate to={home} />} />
        <Route path="/home" element={!user ? <LandingPage /> : <Navigate to={home} />} />
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={home} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={home} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/patient/dashboard"
          element={user?.role === "patient"
            ? <PatientDashboard user={user} onLogout={handleLogout} />
            : <Navigate to="/login" />}
        />
        <Route path="/doctor/dashboard"
          element={user?.role === "doctor"
            ? <DoctorDashboard user={user} onLogout={handleLogout} />
            : <Navigate to="/login" />}
        />
        <Route path="/cashier/dashboard"
          element={user?.role === "cashier"
            ? <CashierDashboard user={user} onLogout={handleLogout} />
            : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={home} />} />
      </Routes>
    </BrowserRouter>
  );
}
