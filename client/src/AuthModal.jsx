import { useState } from "react";
import ProductManager from "./ProductManagerWithUpload";
import ProductFlagsManager from "./ProductFlagsManager";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");
const emptyRegister = { name: "", email: "", password: "", phone: "", address: "" };

export default function AuthModal({ onClose }) {
  const savedToken = localStorage.getItem("token");
  const savedRole = (() => { try { return JSON.parse(atob(savedToken?.split(".")[1] || "")).role; } catch { return null; } })();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const changeTab = (next) => { setTab(next); setForm(next === "login" ? { email: "", password: "" } : emptyRegister); setMessage(""); };
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch(`${API_URL}/auth/${tab}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to continue");
      localStorage.setItem("token", data.token);
      onClose();
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };
  const field = (name) => (event) => setForm({ ...form, [name]: event.target.value });
  const input = "w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100";
  if (savedRole === "admin") {
    return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="relative mx-auto my-8 w-full max-w-xl rounded-2xl bg-white p-7 shadow-2xl"><button onClick={onClose} className="absolute right-4 top-3 text-2xl text-slate-500 hover:text-slate-900" aria-label="Close">×</button><p className="text-sm font-bold text-blue-600">ADMIN PANEL</p><h2 className="mt-1 text-2xl font-black">Manage shoe products</h2><ProductManager /><ProductFlagsManager /></section></div>;
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-label="Account access" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"><button onClick={onClose} className="absolute right-4 top-3 text-2xl text-slate-500 hover:text-slate-900" aria-label="Close">×</button><p className="text-sm font-bold text-blue-600">SOLESTORE</p><h2 className="mt-1 text-2xl font-black">Account access</h2><div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1"><button onClick={() => changeTab("login")} className={`rounded-md py-2 text-sm font-bold ${tab === "login" ? "bg-white text-blue-700 shadow" : "text-slate-500"}`}>Log in</button><button onClick={() => changeTab("register")} className={`rounded-md py-2 text-sm font-bold ${tab === "register" ? "bg-white text-blue-700 shadow" : "text-slate-500"}`}>Register</button></div>{message && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}<form onSubmit={submit} className="mt-5 grid gap-3">{tab === "register" && <input className={input} placeholder="Name" value={form.name} onChange={field("name")} required />}<input className={input} type="email" placeholder="Email" value={form.email} onChange={field("email")} required /><input className={input} type="password" minLength="8" placeholder="Password (at least 8 characters)" value={form.password} onChange={field("password")} required />{tab === "register" && <><input className={input} placeholder="Phone (optional)" value={form.phone} onChange={field("phone")} /><textarea className={input} placeholder="Address (optional)" value={form.address} onChange={field("address")} /></>}<button disabled={loading} className="mt-2 rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300">{loading ? "Working..." : tab === "login" ? "Log in" : "Create account"}</button></form></section></div>;
}
