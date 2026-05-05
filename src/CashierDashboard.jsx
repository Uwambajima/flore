import { useEffect, useState } from "react";
import { Header, Footer } from "./Layout";
import { api } from "./api";

const TABS = ["Overview", "Bills", "Payments", "Patients"];

export default function CashierDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("Overview");
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = () => {
    Promise.all([api("/bills"), api("/patients"), api("/doctors")])
      .then(([bs, pts, docs]) => { setBills(bs); setPatients(pts); setDoctors(docs); })
      .catch(err => showToast(err.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const unpaid = bills.filter(b => b.status === "unpaid");
  const paid   = bills.filter(b => b.status === "paid");
  const totalRevenue = paid.reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalPending = unpaid.reduce((s, b) => s + parseFloat(b.amount), 0);

  const payBill = async (id) => {
    try {
      await api(`/bills/${id}/pay`, { method: "PATCH" });
      showToast("Payment recorded!");
      fetchAll();
    } catch (err) { showToast(err.message, "error"); }
  };

  const filteredBills = bills.filter(b =>
    b.patient?.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase()) ||
    b.doctor?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

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
            { icon: "💳", label: "Total Bills",    value: bills.length,              color: "border-violet-500", bg: "bg-violet-50", text: "text-violet-600" },
            { icon: "⏳", label: "Unpaid",         value: unpaid.length,             color: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-600" },
            { icon: "✅", label: "Paid",           value: paid.length,               color: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600" },
            { icon: "💰", label: "Total Revenue",  value: `$${totalRevenue.toFixed(2)}`, color: "border-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
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
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-3xl">💳</div>
              <div>
                <p className="font-bold text-gray-900">{user.name}</p>
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">Cashier</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Email", value: user.email, icon: "✉️" },
                { label: "Phone", value: user.phone || "—", icon: "📞" },
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

            {/* Pending summary */}
            {unpaid.length > 0 && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-xs font-bold text-yellow-600 uppercase mb-2">⚠️ Pending</p>
                <p className="text-2xl font-extrabold text-gray-900">${totalPending.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">{unpaid.length} unpaid bill{unpaid.length > 1 ? "s" : ""}</p>
                <button onClick={() => setTab("Bills")} className="text-xs text-violet-600 font-semibold hover:underline mt-1">View all →</button>
              </div>
            )}
          </div>

          {/* Main Panel */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Tabs */}
            <div className="flex gap-1 p-2 border-b border-gray-100">
              {TABS.map(t => (
                <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                    ${tab === t ? "bg-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                  {t === "Overview" ? "📊" : t === "Bills" ? "💳" : t === "Payments" ? "✅" : "🧑⚕️"} {t}
                </button>
              ))}
            </div>

            <div className="p-6">
              {loading ? <Loader /> : (
                <>
                  {/* ── OVERVIEW ── */}
                  {tab === "Overview" && (
                    <div className="space-y-6">
                      <h2 className="font-bold text-gray-900">Financial Overview</h2>

                      {/* Revenue bar */}
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-semibold text-gray-700">Collection Rate</p>
                          <p className="text-sm font-bold text-gray-900">
                            {bills.length ? Math.round((paid.length / bills.length) * 100) : 0}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-violet-600 to-purple-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${bills.length ? (paid.length / bills.length) * 100 : 0}%` }} />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>Paid: ${totalRevenue.toFixed(2)}</span>
                          <span>Pending: ${totalPending.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Recent unpaid */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-bold text-gray-700">Recent Unpaid Bills</p>
                          <button onClick={() => setTab("Bills")} className="text-xs text-violet-600 font-semibold hover:underline">View all</button>
                        </div>
                        {unpaid.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-6">🎉 All bills are paid!</p>
                        ) : (
                          <div className="space-y-2">
                            {unpaid.slice(0, 5).map(b => (
                              <div key={b.id} className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{b.patient}</p>
                                  <p className="text-xs text-gray-400">{b.description} · Dr. {b.doctor}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="font-bold text-gray-900">${parseFloat(b.amount).toFixed(2)}</p>
                                  <button onClick={() => payBill(b.id)}
                                    className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-violet-700 transition">
                                    Pay
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── BILLS ── */}
                  {tab === "Bills" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-900">All Bills</h2>
                        <button onClick={() => setModal({ type: "bill" })}
                          className="text-xs font-bold text-violet-600 hover:underline">+ Create Bill</button>
                      </div>
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="🔍 Search by patient, doctor or description..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none bg-gray-50 mb-4" />
                      {filteredBills.length === 0 ? <Empty icon="💳" text="No bills found" /> : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-4 py-3 text-left rounded-l-xl">Patient</th>
                                <th className="px-4 py-3 text-left">Description</th>
                                <th className="px-4 py-3 text-left">Doctor</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left rounded-r-xl">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBills.map(b => (
                                <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                  <td className="px-4 py-3 font-semibold text-gray-900">{b.patient}</td>
                                  <td className="px-4 py-3 text-gray-600">{b.description}</td>
                                  <td className="px-4 py-3 text-gray-500">Dr. {b.doctor}</td>
                                  <td className="px-4 py-3 font-bold text-gray-900">${parseFloat(b.amount).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-gray-400 text-xs">{b.created_at?.slice(0, 10)}</td>
                                  <td className="px-4 py-3">
                                    {b.status === "unpaid" ? (
                                      <button onClick={() => payBill(b.id)}
                                        className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-violet-700 transition">
                                        💳 Pay
                                      </button>
                                    ) : (
                                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold">✓ Paid</span>
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

                  {/* ── PAYMENTS ── */}
                  {tab === "Payments" && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4">Payment History</h2>
                      {paid.length === 0 ? <Empty icon="✅" text="No payments recorded yet" /> : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="px-4 py-3 text-left rounded-l-xl">Patient</th>
                                <th className="px-4 py-3 text-left">Description</th>
                                <th className="px-4 py-3 text-left">Doctor</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left rounded-r-xl">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paid.map(b => (
                                <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                  <td className="px-4 py-3 font-semibold text-gray-900">{b.patient}</td>
                                  <td className="px-4 py-3 text-gray-600">{b.description}</td>
                                  <td className="px-4 py-3 text-gray-500">Dr. {b.doctor}</td>
                                  <td className="px-4 py-3 font-bold text-emerald-600">${parseFloat(b.amount).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-gray-400 text-xs">{b.created_at?.slice(0, 10)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-4 pt-4 border-t flex justify-end">
                            <p className="text-sm font-bold text-gray-700">Total Collected: <span className="text-emerald-600 text-lg">${totalRevenue.toFixed(2)}</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── PATIENTS ── */}
                  {tab === "Patients" && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4">Patient Accounts</h2>
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="🔍 Search patients..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none bg-gray-50 mb-4" />
                      {filteredPatients.length === 0 ? <Empty icon="🧑⚕️" text="No patients found" /> : (
                        <div className="space-y-3">
                          {filteredPatients.map(p => {
                            const patientBills = bills.filter(b => b.patient === p.name);
                            const patientUnpaid = patientBills.filter(b => b.status === "unpaid");
                            const patientTotal = patientUnpaid.reduce((s, b) => s + parseFloat(b.amount), 0);
                            return (
                              <div key={p.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">🧑⚕️</div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.gender || "—"} · Age {p.age || "—"}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-400">{patientBills.length} bill{patientBills.length !== 1 ? "s" : ""}</p>
                                  {patientUnpaid.length > 0 ? (
                                    <p className="text-sm font-bold text-yellow-600">${patientTotal.toFixed(2)} due</p>
                                  ) : (
                                    <p className="text-xs text-emerald-600 font-semibold">✓ All paid</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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

      {/* Create Bill Modal */}
      {modal?.type === "bill" && (
        <CreateBillModal
          patients={patients}
          doctors={doctors}
          onClose={() => setModal(null)}
          onSuccess={() => { showToast("Bill created!"); fetchAll(); setModal(null); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function CreateBillModal({ patients, doctors, onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({ patient_id: "", doctor_id: "", description: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id || !form.doctor_id || !form.description || !form.amount)
      return showToast("All fields required", "error");
    setLoading(true);
    try {
      await api("/bills", { method: "POST", body: JSON.stringify(form) });
      onSuccess();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">💳 Create Bill</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Patient</label>
            <select value={form.patient_id} onChange={set("patient_id")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none bg-gray-50 text-sm">
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Doctor</label>
            <select value={form.doctor_id} onChange={set("doctor_id")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none bg-gray-50 text-sm">
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty || "General"}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <input value={form.description} onChange={set("description")} placeholder="e.g. Consultation fee, Lab test..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none bg-gray-50 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount ($)</label>
            <input type="number" value={form.amount} onChange={set("amount")} placeholder="0.00" min="0" step="0.01"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none bg-gray-50 text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg">
            {loading ? "Creating..." : "Create Bill"}
          </button>
        </form>
      </div>
    </div>
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
