import { useEffect, useState } from "react";
import { Header, Footer } from "./Layout";
import { api } from "./api";
import emailjs from "@emailjs/browser";

const EJS_SID = "service_wfxkocc";
const EJS_KEY = "rkRRUNntjzkJf-8tK";
const EJS_TEMPLATE = "template_k2rcv2s";

const TABS = ["Appointments", "Test Results", "Prescriptions", "Billing"];

export default function DoctorDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("Appointments");
  const [appointments, setAppointments] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'test'|'prescription'|'bill'|'note', appt? }

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
      api("/patients"),
    ]).then(([appts, tests, rxs, bs, pts]) => {
      setAppointments(appts.filter(a => a.doctor === user.name));
      setTestResults(tests.filter(t => t.doctor === user.name));
      setPrescriptions(rxs.filter(r => r.doctor === user.name));
      setBills(bs.filter(b => b.doctor === user.name));
      setPatients(pts);
    }).catch(err => showToast(err.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [user.name]);

  const doctorRecord = patients.find(p => p.name === user.name);

  const getDoctorId = async () => {
    const docs = await api("/doctors");
    const doc = docs.find(d => d.name === user.name);
    return doc?.id;
  };

  const todayAppts = appointments.filter(a => a.appointment_date?.slice(0, 10) === today);
  const upcoming = appointments.filter(a => a.appointment_date?.slice(0, 10) >= today && a.status !== "cancelled");
  const uniquePatients = new Set(appointments.map(a => a.patient)).size;
  const unpaidBills = bills.filter(b => b.status === "unpaid").reduce((s, b) => s + parseFloat(b.amount), 0);

  const cancelAppointment = async (id) => {
    try {
      await api(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
      showToast("Appointment cancelled");
      fetchAll();
    } catch (err) { showToast(err.message, "error"); }
  };

  const completeAppointment = async (id) => {
    try {
      await api(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: "completed" }) });
      showToast("Marked as completed");
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

      <Header user={user} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "📅", label: "Total Appointments", value: appointments.length,  color: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600" },
            { icon: "📆", label: "Today",              value: todayAppts.length,    color: "border-blue-500",   bg: "bg-blue-50",   text: "text-blue-600" },
            { icon: "🧑⚕️", label: "Unique Patients",  value: uniquePatients,       color: "border-purple-500", bg: "bg-purple-50", text: "text-purple-600" },
            { icon: "💰", label: "Pending Bills",      value: `$${unpaidBills.toFixed(2)}`, color: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-600" },
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
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl">👨⚕️</div>
              <div>
                <p className="font-bold text-gray-900">{user.name}</p>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Doctor</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Email",      value: user.email,                                icon: "✉️" },
                { label: "Doctor ID",  value: user.doctor_id || "—",                    icon: "🪪" },
                { label: "Specialty",  value: user.specialty || "—",                    icon: "🩺" },
                { label: "Experience", value: user.experience ? `${user.experience} yrs` : "—", icon: "⭐" },
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
            {todayAppts.length > 0 && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Today's Schedule</p>
                <div className="space-y-2">
                  {todayAppts.map(a => (
                    <div key={a.id} className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                      <span className="text-sm">🧑⚕️</span>
                      <p className="text-sm font-semibold text-emerald-800">{a.patient}</p>
                    </div>
                  ))}
                </div>
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
                    ${tab === t ? "bg-emerald-600 text-white shadow" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
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
                        <h2 className="font-bold text-gray-900">All Appointments</h2>
                      </div>
                      {appointments.length === 0 ? <Empty icon="📅" text="No appointments yet" /> : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-4 py-3 text-left rounded-l-xl">Patient</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left rounded-r-xl">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {appointments.map(a => (
                                <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                  <td className="px-4 py-3 font-semibold text-gray-900">{a.patient}</td>
                                  <td className="px-4 py-3">
                                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                                      {a.appointment_date?.slice(0, 10)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <StatusBadge status={a.status || "upcoming"} />
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-2 flex-wrap">
                                      {a.status !== "completed" && a.status !== "cancelled" && (
                                        <>
                                          <ActionBtn color="emerald" onClick={() => completeAppointment(a.id)}>✓ Complete</ActionBtn>
                                          <ActionBtn color="red" onClick={() => cancelAppointment(a.id)}>✕ Cancel</ActionBtn>
                                        </>
                                      )}
                                      <ActionBtn color="blue" onClick={() => setModal({ type: "test", patient_id: a.patient_id, patient: a.patient })}>🧪 Test</ActionBtn>
                                      <ActionBtn color="purple" onClick={() => setModal({ type: "prescription", patient_id: a.patient_id, patient: a.patient })}>💊 Rx</ActionBtn>
                                      <ActionBtn color="yellow" onClick={() => setModal({ type: "bill", patient_id: a.patient_id, patient: a.patient })}>💳 Bill</ActionBtn>
                                    </div>
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
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-900">Test Results Sent</h2>
                        <button onClick={() => setModal({ type: "test", patient_id: "", patient: "" })}
                          className="text-xs font-bold text-emerald-600 hover:underline">+ Send Result</button>
                      </div>
                      {testResults.length === 0 ? <Empty icon="🧪" text="No test results sent yet" /> : (
                        <div className="space-y-3">
                          {testResults.map(t => (
                            <div key={t.id} className="border border-gray-100 rounded-xl p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900">{t.test_name}</p>
                                  <p className="text-xs text-gray-400">Patient: {t.patient} · {t.created_at?.slice(0, 10)}</p>
                                </div>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">Result</span>
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
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-900">Prescriptions</h2>
                        <button onClick={() => setModal({ type: "prescription", patient_id: "", patient: "" })}
                          className="text-xs font-bold text-emerald-600 hover:underline">+ New Prescription</button>
                      </div>
                      {prescriptions.length === 0 ? <Empty icon="💊" text="No prescriptions yet" /> : (
                        <div className="space-y-3">
                          {prescriptions.map(r => (
                            <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900">{r.medication}</p>
                                  <p className="text-xs text-gray-400">Patient: {r.patient} · {r.created_at?.slice(0, 10)}</p>
                                </div>
                                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-medium">💊 Rx</span>
                              </div>
                              <div className="mt-2 flex gap-4 text-xs text-gray-600">
                                {r.dosage && <span>Dosage: <b>{r.dosage}</b></span>}
                                {r.duration && <span>Duration: <b>{r.duration}</b></span>}
                              </div>
                              {r.instructions && <p className="mt-1 text-xs text-gray-400">Instructions: {r.instructions}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── BILLING ── */}
                  {tab === "Billing" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-900">Bills</h2>
                        <button onClick={() => setModal({ type: "bill", patient_id: "", patient: "" })}
                          className="text-xs font-bold text-emerald-600 hover:underline">+ Create Bill</button>
                      </div>
                      {bills.length === 0 ? <Empty icon="💳" text="No bills created yet" /> : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-4 py-3 text-left rounded-l-xl">Patient</th>
                                <th className="px-4 py-3 text-left">Description</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left rounded-r-xl">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bills.map(b => (
                                <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                  <td className="px-4 py-3 font-semibold text-gray-900">{b.patient}</td>
                                  <td className="px-4 py-3 text-gray-600">{b.description}</td>
                                  <td className="px-4 py-3 font-bold text-gray-900">${parseFloat(b.amount).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-gray-400 text-xs">{b.created_at?.slice(0, 10)}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${b.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700"}`}>
                                      {b.status === "paid" ? "✓ Paid" : "⏳ Unpaid"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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

      {/* Modals */}
      {modal && (
        <Modal
          modal={modal}
          patients={patients.length > 0 ? patients : [...new Map(appointments.map(a => [a.patient_id, { id: a.patient_id, name: a.patient }])).values()]}
          user={user}
          getDoctorId={getDoctorId}
          onClose={() => setModal(null)}
          onSuccess={(msg) => { showToast(msg); fetchAll(); setModal(null); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function Modal({ modal, patients, user, getDoctorId, onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({
    patient_id: modal.patient_id || "",
    test_name: "", result: "", notes: "",
    medication: "", dosage: "", duration: "", instructions: "",
    description: "", amount: "",
  });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const sendEmail = async (patient_id, subject, content) => {
    try {
      const res = await fetch(`http://localhost:5000/patient-email/${patient_id}`);
      const data = await res.json();
      if (!data.email) return;
      await emailjs.send(EJS_SID, EJS_TEMPLATE, { email: data.email, subject, content, doctor_name: user.name }, EJS_KEY);
    } catch (err) {
      console.warn("Email send failed:", err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const doctor_id = await getDoctorId();
      if (!doctor_id) throw new Error("Doctor record not found");
      if (modal.type === "test") {
        if (!form.patient_id || !form.test_name || !form.result) throw new Error("All fields required");
        await api("/test-results", { method: "POST", body: JSON.stringify({ patient_id: form.patient_id, doctor_id, test_name: form.test_name, result: form.result, notes: form.notes }) });
        await sendEmail(form.patient_id,
          `Your Test Result from Dr. ${user.name}`,
          `Test Name: ${form.test_name}\nResult: ${form.result}\nNotes: ${form.notes || "—"}`);
        onSuccess("Test result sent to patient!");
      } else if (modal.type === "prescription") {
        if (!form.patient_id || !form.medication) throw new Error("Patient and medication required");
        await api("/prescriptions", { method: "POST", body: JSON.stringify({ patient_id: form.patient_id, doctor_id, medication: form.medication, dosage: form.dosage, duration: form.duration, instructions: form.instructions }) });
        await sendEmail(form.patient_id,
          `Prescription from Dr. ${user.name}`,
          `Medication: ${form.medication}\nDosage: ${form.dosage || "—"}\nDuration: ${form.duration || "—"}\nInstructions: ${form.instructions || "—"}`);
        onSuccess("Prescription sent to patient!");
      } else if (modal.type === "bill") {
        if (!form.patient_id || !form.description || !form.amount) throw new Error("All fields required");
        await api("/bills", { method: "POST", body: JSON.stringify({ patient_id: form.patient_id, doctor_id, description: form.description, amount: form.amount }) });
        await sendEmail(form.patient_id,
          `Bill from Dr. ${user.name}`,
          `Description: ${form.description}\nAmount: $${parseFloat(form.amount).toFixed(2)}\nPlease log in to your HealthCare account to pay.`);
        onSuccess("Bill sent to patient!");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const titles = { test: "🧪 Send Test Result", prescription: "💊 New Prescription", bill: "💳 Create Bill" };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{titles[modal.type]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Patient</label>
            <select value={form.patient_id} onChange={set("patient_id")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-gray-50 text-sm">
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {modal.type === "test" && (
            <>
              <MField label="Test Name" value={form.test_name} onChange={set("test_name")} placeholder="e.g. Blood Test, X-Ray" />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Result</label>
                <textarea value={form.result} onChange={set("result")} rows={3} placeholder="Enter test result details..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-gray-50 text-sm resize-none" />
              </div>
              <MField label="Notes (optional)" value={form.notes} onChange={set("notes")} placeholder="Additional notes..." />
            </>
          )}

          {modal.type === "prescription" && (
            <>
              <MField label="Medication" value={form.medication} onChange={set("medication")} placeholder="e.g. Amoxicillin 500mg" />
              <div className="grid grid-cols-2 gap-3">
                <MField label="Dosage" value={form.dosage} onChange={set("dosage")} placeholder="e.g. 1 tablet" />
                <MField label="Duration" value={form.duration} onChange={set("duration")} placeholder="e.g. 7 days" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Instructions</label>
                <textarea value={form.instructions} onChange={set("instructions")} rows={2} placeholder="e.g. Take after meals..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-gray-50 text-sm resize-none" />
              </div>
            </>
          )}

          {modal.type === "bill" && (
            <>
              <MField label="Description" value={form.description} onChange={set("description")} placeholder="e.g. Consultation fee" />
              <MField label="Amount ($)" type="number" value={form.amount} onChange={set("amount")} placeholder="0.00" />
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg">
            {loading ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input {...props} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-gray-50 text-sm transition" />
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

function ActionBtn({ color, onClick, children }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red:     "bg-red-50 text-red-600 hover:bg-red-100",
    blue:    "bg-blue-50 text-blue-700 hover:bg-blue-100",
    purple:  "bg-purple-50 text-purple-700 hover:bg-purple-100",
    yellow:  "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
  };
  return (
    <button onClick={onClick} className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${colors[color]}`}>
      {children}
    </button>
  );
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
