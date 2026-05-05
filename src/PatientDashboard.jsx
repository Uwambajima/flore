import { useEffect, useState } from "react";
import { Header, Footer } from "./Layout";
import { api } from "./api";

const TABS = ["Appointments", "Test Results", "Prescriptions", "Billing"];

export default function PatientDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("Appointments");
  const [appointments, setAppointments] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookModal, setBookModal] = useState(false);
  const [bookForm, setBookForm] = useState({ doctor_id: "", appointment_date: "" });
  const [bookError, setBookError] = useState("");
  const [bookLoading, setBookLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = () => {
    Promise.all([
      api("/appointments"),
      api("/test-results"),
      api("/prescriptions"),
      api("/bills"),
      api("/doctors"),
      api("/patients"),
    ]).then(([appts, tests, rxs, bs, docs, pts]) => {
      const me = pts.find(p => p.name.trim().toLowerCase() === user.name.trim().toLowerCase());
      const myName = me?.name || user.name;
      setAppointments(appts.filter(a => a.patient?.trim().toLowerCase() === myName.trim().toLowerCase()));
      setTestResults(tests.filter(t => t.patient?.trim().toLowerCase() === myName.trim().toLowerCase()));
      setPrescriptions(rxs.filter(r => r.patient?.trim().toLowerCase() === myName.trim().toLowerCase()));
      setBills(bs.filter(b => b.patient?.trim().toLowerCase() === myName.trim().toLowerCase()));
      setDoctors(docs);
    }).catch(err => showToast(err.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [user.name]);

  const upcoming = appointments.filter(a => a.appointment_date?.slice(0, 10) >= today && a.status !== "cancelled");
  const past = appointments.filter(a => a.appointment_date?.slice(0, 10) < today || a.status === "completed");
  const unpaidBills = bills.filter(b => b.status === "unpaid");
  const totalOwed = unpaidBills.reduce((s, b) => s + parseFloat(b.amount), 0);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookError("");
    if (!bookForm.doctor_id || !bookForm.appointment_date) return setBookError("All fields required");
    setBookLoading(true);
    try {
      const patients = await api("/patients");
      const patient = patients.find(p => p.name === user.name);
      if (!patient) throw new Error("Patient record not found");
      await api("/appointments", {
        method: "POST",
        body: JSON.stringify({ patient_id: patient.id, doctor_id: bookForm.doctor_id, appointment_date: bookForm.appointment_date }),
      });
      setBookModal(false);
      setBookForm({ doctor_id: "", appointment_date: "" });
      showToast("Appointment booked successfully!");
      fetchAll();
    } catch (err) {
      setBookError(err.message);
    } finally {
      setBookLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await api(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
      showToast("Appointment cancelled");
      fetchAll();
    } catch (err) { showToast(err.message, "error"); }
  };

  const payBill = async (id) => {
    try {
      await api(`/bills/${id}/pay`, { method: "PATCH" });
      showToast("Bill paid successfully!");
      fetchAll();
    } catch (err) { showToast(err.message, "error"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold flex items-center gap-2
          ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <Header user={user} onLogout={onLogout} onBook={() => setBookModal(true)} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "📅", label: "Total",        value: appointments.length,  color: "border-blue-500",   bg: "bg-blue-50",   text: "text-blue-600" },
            { icon: "⏳", label: "Upcoming",     value: upcoming.length,      color: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600" },
            { icon: "🧪", label: "Test Results", value: testResults.length,   color: "border-purple-500", bg: "bg-purple-50", text: "text-purple-600" },
            { icon: "💳", label: "Unpaid Bills", value: `$${totalOwed.toFixed(2)}`, color: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-600" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${s.color} flex items-center gap-4`}>
              <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.text} flex items-center justify-center text-xl`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Profile */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl">🧑⚕️</div>
              <div>
                <p className="font-bold text-gray-900">{user.name}</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Patient</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Email",   value: user.email,          icon: "✉️" },
                { label: "Age",     value: user.age || "—",     icon: "🎂" },
                { label: "Gender",  value: user.gender || "—",  icon: "👤" },
                { label: "Phone",   value: user.phone || "—",   icon: "📞" },
                { label: "Address", value: user.address || "—", icon: "📍" },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{f.label}</p>
                    <p className="text-sm font-semibold text-gray-700 break-all">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {unpaidBills.length > 0 && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-xs font-bold text-yellow-600 uppercase mb-2">⚠️ Pending Bills</p>
                <p className="text-2xl font-extrabold text-gray-900">${totalOwed.toFixed(2)}</p>
                <button onClick={() => setTab("Billing")} className="text-xs text-blue-600 font-semibold hover:underline mt-1">View bills →</button>
              </div>
            )}
          </div>

          {/* Main Panel */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Tabs */}
            <div className="flex gap-1 p-2 border-b border-gray-100">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                    ${tab === t ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                  {t === "Appointments" ? "📅" : t === "Test Results" ? "🧪" : t === "Prescriptions" ? "💊" : "💳"} {t}
                </button>
              ))}
            </div>

            <div className="p-6">
              {loading ? <Loader /> : (
                <>
                  {/* ── APPOINTMENTS ── */}
                  {tab === "Appointments" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-900">My Appointments</h2>
                        <button onClick={() => setBookModal(true)} className="text-xs font-bold text-blue-600 hover:underline">+ Book new</button>
                      </div>
                      {appointments.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-4xl mb-3">📅</p>
                          <p className="text-gray-500 text-sm">No appointments yet</p>
                          <button onClick={() => setBookModal(true)} className="mt-3 text-blue-600 text-sm font-bold hover:underline">Book your first appointment</button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-4 py-3 text-left rounded-l-xl">Doctor</th>
                                <th className="px-4 py-3 text-left">Specialty</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left rounded-r-xl">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {appointments.map(a => (
                                <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                  <td className="px-4 py-3 font-semibold text-gray-900">{a.doctor}</td>
                                  <td className="px-4 py-3 text-gray-500">{a.specialty || "—"}</td>
                                  <td className="px-4 py-3">
                                    <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                                      {a.appointment_date?.slice(0, 10)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3"><StatusBadge status={a.status || "upcoming"} /></td>
                                  <td className="px-4 py-3">
                                    {a.status !== "cancelled" && a.status !== "completed" && (
                                      <button onClick={() => cancelAppointment(a.id)}
                                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg font-semibold transition">
                                        ✕ Cancel
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── TEST RESULTS ── */}
                  {tab === "Test Results" && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4">My Test Results</h2>
                      {testResults.length === 0 ? <Empty icon="🧪" text="No test results yet" /> : (
                        <div className="space-y-3">
                          {testResults.map(t => (
                            <div key={t.id} className="border border-gray-100 rounded-xl p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900">{t.test_name}</p>
                                  <p className="text-xs text-gray-400">Dr. {t.doctor} · {t.created_at?.slice(0, 10)}</p>
                                </div>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">🧪 Result</span>
                              </div>
                              <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{t.result}</p>
                              {t.notes && <p className="mt-1 text-xs text-gray-400">Notes: {t.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── PRESCRIPTIONS ── */}
                  {tab === "Prescriptions" && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4">My Prescriptions</h2>
                      {prescriptions.length === 0 ? <Empty icon="💊" text="No prescriptions yet" /> : (
                        <div className="space-y-3">
                          {prescriptions.map(r => (
                            <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900">{r.medication}</p>
                                  <p className="text-xs text-gray-400">Dr. {r.doctor} · {r.created_at?.slice(0, 10)}</p>
                                </div>
                                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-medium">💊 Rx</span>
                              </div>
                              <div className="mt-2 flex gap-4 text-xs text-gray-600">
                                {r.dosage && <span>Dosage: <b>{r.dosage}</b></span>}
                                {r.duration && <span>Duration: <b>{r.duration}</b></span>}
                              </div>
                              {r.instructions && <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{r.instructions}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── BILLING ── */}
                  {tab === "Billing" && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4">My Bills</h2>
                      {bills.length === 0 ? <Empty icon="💳" text="No bills yet" /> : (
                        <div className="space-y-3">
                          {bills.map(b => (
                            <div key={b.id} className={`border rounded-xl p-4 flex items-center justify-between ${b.status === "unpaid" ? "border-yellow-200 bg-yellow-50/30" : "border-gray-100"}`}>
                              <div>
                                <p className="font-bold text-gray-900">{b.description}</p>
                                <p className="text-xs text-gray-400">Dr. {b.doctor} · {b.created_at?.slice(0, 10)}</p>
                                <p className="text-lg font-extrabold text-gray-900 mt-1">${parseFloat(b.amount).toFixed(2)}</p>
                              </div>
                              <div className="text-right">
                                {b.status === "unpaid" ? (
                                  <button onClick={() => payBill(b.id)}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition shadow">
                                    💳 Pay Now
                                  </button>
                                ) : (
                                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-semibold">✓ Paid</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Book Modal */}
      {bookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Book Appointment</h3>
              <button onClick={() => { setBookModal(false); setBookError(""); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Doctor</label>
                <select value={bookForm.doctor_id} onChange={e => setBookForm(f => ({ ...f, doctor_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-sm">
                  <option value="">Choose a doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty || "General"}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Appointment Date</label>
                <input type="date" min={today} value={bookForm.appointment_date}
                  onChange={e => setBookForm(f => ({ ...f, appointment_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-sm" />
              </div>
              {bookError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {bookError}</div>}
              <button type="submit" disabled={bookLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg">
                {bookLoading ? "Booking..." : "Confirm Appointment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    upcoming:  "bg-yellow-50 text-yellow-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-500",
  };
  return <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize ${map[status] || map.upcoming}`}>{status}</span>;
}

function Empty({ icon, text }) {
  return (
    <div className="text-center py-12">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-12 text-gray-400">
      <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading...
    </div>
  );
}
