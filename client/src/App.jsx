import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import ProductManager from "./ProductManagerWithUpload";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");
const initialRegister = { name: "", email: "", password: "", phone: "", address: "" };
const initialLogin = { email: "", password: "" };

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  return data;
}

const Input = ({ label, ...props }) => <label className="grid gap-1.5 text-sm font-medium text-slate-700">{label}<input className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" {...props} /></label>;

export default function App() {
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState(initialLogin);
  const [register, setRegister] = useState(initialRegister);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("เข้าสู่ระบบหรือสร้างบัญชีใหม่");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const authenticatedApi = (path) => api(path, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
  const loadProfile = async () => { try { const { user: currentUser } = await authenticatedApi("/auth/me"); setUser(currentUser); if (currentUser.role === "admin") { const data = await authenticatedApi("/auth/admin/dashboard"); setAdminMessage(data.message); } } catch { localStorage.removeItem("token"); } };
  useEffect(() => { if (localStorage.getItem("token")) loadProfile(); }, []);
  useEffect(() => {
    if (user?.role !== "admin") return undefined;
    const host = document.createElement("div");
    document.querySelector("main section")?.append(host);
    const root = createRoot(host);
    root.render(<ProductManager />);
    return () => root.unmount();
  }, [user]);
  const submit = async (event) => { event.preventDefault(); setLoading(true); setError(false); setMessage("กำลังดำเนินการ..."); try { const form = tab === "login" ? login : register; const data = await api(`/auth/${tab}`, { method: "POST", body: JSON.stringify(form) }); localStorage.setItem("token", data.token); setUser(data.user); setMessage("สำเร็จ"); if (data.user.role === "admin") { const dashboard = await authenticatedApi("/auth/admin/dashboard"); setAdminMessage(dashboard.message); } } catch (submissionError) { setError(true); setMessage(submissionError.message); } finally { setLoading(false); } };
  const changeTab = (nextTab) => { setTab(nextTab); setError(false); setMessage(""); };
  const logout = () => { localStorage.removeItem("token"); setUser(null); setAdminMessage(""); setMessage("ออกจากระบบแล้ว"); setError(false); };
  const setField = (setter) => (event) => setter((value) => ({ ...value, [event.target.name]: event.target.value }));
  const activeForm = tab === "login" ? login : register;
  const activeSetter = tab === "login" ? setLogin : setRegister;
  return <main className="grid min-h-screen place-items-center bg-linear-to-br from-blue-100 via-slate-50 to-indigo-100 p-4"><section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl shadow-slate-300/40 sm:p-9"><div className="mb-7"><p className="text-sm font-semibold text-blue-600">PORTABLE TRACK</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Account Access</h1></div>{user ? <div className="space-y-5"><div className="rounded-xl bg-slate-50 p-5"><h2 className="text-xl font-bold">ยินดีต้อนรับ, {user.name}</h2><p className="mt-2 text-slate-600">อีเมล: {user.email}</p><span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">สิทธิ์: {user.role}</span></div>{adminMessage && <p className="rounded-lg bg-amber-50 p-4 text-amber-800">{adminMessage}</p>}<button onClick={logout} className="w-full rounded-lg bg-slate-700 px-4 py-2.5 font-semibold text-white hover:bg-slate-800">ออกจากระบบ</button></div> : <><div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">{[["login", "เข้าสู่ระบบ"], ["register", "สมัครสมาชิก"]].map(([value, label]) => <button key={value} onClick={() => changeTab(value)} className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === value ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>{label}</button>)}</div><p className={`mb-4 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`} aria-live="polite">{message}</p><form className="grid gap-4" onSubmit={submit}>{tab === "register" && <Input label="ชื่อ" name="name" value={register.name} onChange={setField(setRegister)} required />}<Input label="อีเมล" name="email" type="email" value={activeForm.email} onChange={setField(activeSetter)} required /><Input label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" name="password" type="password" minLength="8" value={activeForm.password} onChange={setField(activeSetter)} required />{tab === "register" && <><Input label="โทรศัพท์" name="phone" value={register.phone} onChange={setField(setRegister)} /><label className="grid gap-1.5 text-sm font-medium text-slate-700">ที่อยู่<textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" name="address" value={register.address} onChange={setField(setRegister)} /></label></>}<button disabled={loading} className="mt-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">{loading ? "กำลังดำเนินการ..." : tab === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</button></form></>}</section></main>;
}
