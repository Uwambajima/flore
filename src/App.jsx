import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Header, Footer } from "./Layout";

const API = "http://localhost:5000";

// ── Toast ─────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all
            ${t.type === "success" ? "bg-emerald-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}`}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          <span>{t.msg}</span>
          <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

// ── Modal ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <input {...props} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-gray-50" />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <select {...props} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-gray-50">
        {children}
      </select>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg, text }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${color} flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${bg} ${text} flex items-center justify-center text-2xl`}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{value ?? "—"}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function Badge({ text }) {
  const colors = { Male: "bg-blue-100 text-blue-700", Female: "bg-pink-100 text-pink-700" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[text] || "bg-gray-100 text-gray-600"}`}>
      {text}
    </span>
  );
}

// ── Main App ──────────────────────────────────────────
export default function App() {
  const { toasts, add: toast, remove } = useToast();
  const [tab, setTab] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [p, d, a, s] = await Promise.all([
        axios.get(`${API}/patients`),
        axios.get(`${API}/doctors`),
        axios.get(`${API}/appointments`),
        axios.get(`${API}/stats`),
      ]);
      setPatients(p.data); setDoctors(d.data);
      setAppointments(a.data); setStats(s.data);
    } catch { toast("Failed to load data", "error"); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const closeModal = () => setModal(null);

  const savePatient = async (form) => {
    try {
      if (form.id) {
        await axios.put(`${API}/patients/${form.id}`, form);
        setPatients(p => p.map(x => x.id === form.id ? { ...x, ...form } : x));
        toast("Patient updated");
      } else {
        const res = await axios.post(`${API}/patients`, form);
        setPatients(p => [...p, { ...form, id: res.data.id }]);
        setStats(s => ({ ...s, patients: (s.patients || 0) + 1 }));
        toast("Patient added");
      }
      closeModal();
    } catch (e) { toast(e.response?.data?.error || "Error saving patient", "error"); }
  };

  const deletePatient = async (id) => {
    if (!confirm("Delete this patient?")) return;
    try {
      await axios.delete(`${API}/patients/${id}`);
      setPatients(p => p.filter(x => x.id !== id));
      setStats(s => ({ ...s, patients: s.patients - 1 }));
      toast("Patient deleted");
    } catch { toast("Error deleting patient", "error"); }
  };

  const saveDoctor = async (form) => {
    try {
      if (form.id) {
        await axios.put(`${API}/doctors/${form.id}`, form);
        setDoctors(d => d.map(x => x.id === form.id ? { ...x, ...form } : x));
        toast("Doctor updated");
      } else {
        const res = await axios.post(`${API}/doctors`, form);
        setDoctors(d => [...d, { ...form, id: res.data.id }]);
        setStats(s => ({ ...s, doctors: (s.doctors || 0) + 1 }));
        toast("Doctor added");
      }
      closeModal();
    } catch (e) { toast(e.response?.data?.error || "Error saving doctor", "error"); }
  };

  const deleteDoctor = async (id) => {
    if (!confirm("Delete this doctor?")) return;
    try {
      await axios.delete(`${API}/doctors/${id}`);
      setDoctors(d => d.filter(x => x.id !== id));
      setStats(s => ({ ...s, doctors: s.doctors - 1 }));
      toast("Doctor deleted");
    } catch { toast("Error deleting doctor", "error"); }
  };

  const saveAppointment = async (form) => {
    try {
      if (form.id) {
        await axios.put(`${API}/appointments/${form.id}`, form);
        toast("Appointment updated");
      } else {
        const res = await axios.post(`${API}/appointments`, form);
        form.id = res.data.id;
        setStats(s => ({ ...s, appointments: (s.appointments || 0) + 1 }));
        toast("Appointment booked");
      }
      await fetchAll(); closeModal();
    } catch (e) { toast(e.response?.data?.error || "Error saving appointment", "error"); }
  };

  const deleteAppointment = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await axios.delete(`${API}/appointments/${id}`);
      setAppointments(a => a.filter(x => x.id !== id));
      setStats(s => ({ ...s, appointments: s.appointments - 1 }));
      toast("Appointment deleted");
    } catch { toast("Error deleting appointment", "error"); }
  };

  const filtered = (list, keys) =>
    list.filter(item => keys.some(k => String(item[k] || "").toLowerCase().includes(search.toLowerCase())));

  const tabs = [
    { id: "dashboard",    label: "Dashboard",    icon: "📊" },
    { id: "patients",     label: "Patients",     icon: "🧑⚕️" },
    { id: "doctors",      label: "Doctors",      icon: "👨⚕️" },
    { id: "appointments", label: "Appointments", icon: "📅" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Toast toasts={toasts} remove={remove} />

      <Header tabs={tabs} activeTab={tab} onTabChange={(id) => { setTab(id); setSearch(""); }} />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-500 text-sm mt-1">Welcome to HealthCare+ management system</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon="🧑⚕️" label="Total Patients"  value={stats.patients}     color="border-blue-500"   bg="bg-blue-50"   text="text-blue-600" />
              <StatCard icon="👨⚕️" label="Total Doctors"   value={stats.doctors}      color="border-emerald-500" bg="bg-emerald-50" text="text-emerald-600" />
              <StatCard icon="📅"   label="Appointments"    value={stats.appointments} color="border-purple-500" bg="bg-purple-50"  text="text-purple-600" />
              <StatCard icon="📆"   label="Today"           value={stats.today}        color="border-orange-500" bg="bg-orange-50"  text="text-orange-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-3">Recent Appointments</h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Doctor</th>
                    <th className="px-4 py-3 text-left">Specialty</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map(a => (
                    <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-900">{a.patient}</td>
                      <td className="px-4 py-3 text-gray-700">{a.doctor}</td>
                      <td className="px-4 py-3 text-gray-500">{a.specialty}</td>
                      <td className="px-4 py-3">
                        <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                          {a.appointment_date?.slice(0, 10)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No appointments yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PATIENTS ── */}
        {tab === "patients" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Patients</h2>
                <p className="text-gray-500 text-sm mt-0.5">{patients.length} total patients</p>
              </div>
              <button onClick={() => setModal({ type: "patient", data: {} })}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow">
                + Add Patient
              </button>
            </div>
            <input placeholder="🔍  Search patients..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Age</th>
                    <th className="px-4 py-3 text-left">Gender</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered(patients, ["patient_id", "name", "gender"]).map(p => (
                    <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.patient_id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.age}</td>
                      <td className="px-4 py-3"><Badge text={p.gender} /></td>
                      <td className="px-4 py-3 flex gap-3">
                        <button onClick={() => setModal({ type: "patient", data: p })}
                          className="text-blue-500 hover:text-blue-700 text-xs font-semibold">Edit</button>
                        <button onClick={() => deletePatient(p.id)}
                          className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No patients found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DOCTORS ── */}
        {tab === "doctors" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Doctors</h2>
                <p className="text-gray-500 text-sm mt-0.5">{doctors.length} total doctors</p>
              </div>
              <button onClick={() => setModal({ type: "doctor", data: {} })}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow">
                + Add Doctor
              </button>
            </div>
            <input placeholder="🔍  Search doctors..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered(doctors, ["doctor_id", "name", "specialty"]).map(d => (
                <div key={d.id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">👨⚕️</div>
                    <div>
                      <p className="font-bold text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{d.doctor_id}</p>
                    </div>
                  </div>
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-lg font-semibold mb-3">
                    {d.specialty || "General"}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setModal({ type: "doctor", data: d })}
                      className="flex-1 text-center text-blue-500 hover:text-blue-700 text-xs font-semibold border border-blue-200 rounded-xl py-1.5 hover:bg-blue-50 transition">Edit</button>
                    <button onClick={() => deleteDoctor(d.id)}
                      className="flex-1 text-center text-red-400 hover:text-red-600 text-xs font-semibold border border-red-200 rounded-xl py-1.5 hover:bg-red-50 transition">Delete</button>
                  </div>
                </div>
              ))}
              {doctors.length === 0 && (
                <p className="col-span-3 text-center text-gray-400 py-10">No doctors found</p>
              )}
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS ── */}
        {tab === "appointments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Appointments</h2>
                <p className="text-gray-500 text-sm mt-0.5">{appointments.length} total appointments</p>
              </div>
              <button onClick={() => setModal({ type: "appointment", data: {} })}
                className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow">
                + Book Appointment
              </button>
            </div>
            <input placeholder="🔍  Search appointments..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Doctor</th>
                    <th className="px-4 py-3 text-left">Specialty</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered(appointments, ["patient", "doctor", "specialty"]).map(a => (
                    <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-900">{a.patient}</td>
                      <td className="px-4 py-3 text-gray-700">{a.doctor}</td>
                      <td className="px-4 py-3 text-gray-500">{a.specialty}</td>
                      <td className="px-4 py-3">
                        <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                          {a.appointment_date?.slice(0, 10)}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-3">
                        <button onClick={() => setModal({ type: "appointment", data: a })}
                          className="text-blue-500 hover:text-blue-700 text-xs font-semibold">Edit</button>
                        <button onClick={() => deleteAppointment(a.id)}
                          className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No appointments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {modal?.type === "patient" && <PatientModal data={modal.data} onSave={savePatient} onClose={closeModal} />}
      {modal?.type === "doctor" && <DoctorModal data={modal.data} onSave={saveDoctor} onClose={closeModal} />}
      {modal?.type === "appointment" && (
        <AppointmentModal data={modal.data} patients={patients} doctors={doctors} onSave={saveAppointment} onClose={closeModal} />
      )}
    </div>
  );
}

function PatientModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({ patient_id: "", name: "", age: "", gender: "", ...data });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.patient_id || !form.name) return alert("ID and Name are required");
    setLoading(true); await onSave(form); setLoading(false);
  };
  return (
    <Modal title={form.id ? "Edit Patient" : "Add Patient"} onClose={onClose}>
      <Input label="Patient ID" value={form.patient_id} onChange={set("patient_id")} placeholder="P001" disabled={!!form.id} />
      <Input label="Full Name" value={form.name} onChange={set("name")} placeholder="John Doe" />
      <Input label="Age" type="number" value={form.age} onChange={set("age")} placeholder="25" />
      <Select label="Gender" value={form.gender} onChange={set("gender")}>
        <option value="">Select gender</option>
        <option>Male</option><option>Female</option>
      </Select>
      <button onClick={submit} disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition">
        {loading ? "Saving..." : form.id ? "Update Patient" : "Add Patient"}
      </button>
    </Modal>
  );
}

function DoctorModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({ doctor_id: "", name: "", specialty: "", ...data });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.doctor_id || !form.name) return alert("ID and Name are required");
    setLoading(true); await onSave(form); setLoading(false);
  };
  return (
    <Modal title={form.id ? "Edit Doctor" : "Add Doctor"} onClose={onClose}>
      <Input label="Doctor ID" value={form.doctor_id} onChange={set("doctor_id")} placeholder="D001" disabled={!!form.id} />
      <Input label="Full Name" value={form.name} onChange={set("name")} placeholder="Dr. Smith" />
      <Input label="Specialty" value={form.specialty} onChange={set("specialty")} placeholder="Cardiology" />
      <button onClick={submit} disabled={loading}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition">
        {loading ? "Saving..." : form.id ? "Update Doctor" : "Add Doctor"}
      </button>
    </Modal>
  );
}

function AppointmentModal({ data, patients, doctors, onSave, onClose }) {
  const [form, setForm] = useState({
    patient_id: "", doctor_id: "", appointment_date: "",
    ...data, appointment_date: data.appointment_date?.slice(0, 10) || ""
  });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.patient_id || !form.doctor_id || !form.appointment_date) return alert("All fields are required");
    setLoading(true); await onSave(form); setLoading(false);
  };
  return (
    <Modal title={form.id ? "Edit Appointment" : "Book Appointment"} onClose={onClose}>
      <Select label="Patient" value={form.patient_id} onChange={set("patient_id")}>
        <option value="">Select patient</option>
        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Select>
      <Select label="Doctor" value={form.doctor_id} onChange={set("doctor_id")}>
        <option value="">Select doctor</option>
        {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
      </Select>
      <Input label="Appointment Date" type="date" value={form.appointment_date} onChange={set("appointment_date")} />
      <button onClick={submit} disabled={loading}
        className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition">
        {loading ? "Saving..." : form.id ? "Update Appointment" : "Book Appointment"}
      </button>
    </Modal>
  );
}
