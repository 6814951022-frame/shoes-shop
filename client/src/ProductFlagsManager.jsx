import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProductFlagsManager() {
  const [products, setProducts] = useState([]); const [message, setMessage] = useState("");
  const request = async (path, options = {}) => { const response = await fetch(`${API_URL}${path}`, { ...options, headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", ...options.headers } }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Request failed"); return data; };
  const load = async () => { try { setProducts(await request("/products?status=available")); } catch (error) { setMessage(error.message); } };
  useEffect(() => { load(); }, []);
  const toggle = async (product, field) => { try { const updated = await request(`/products/${product._id}`, { method: "PUT", body: JSON.stringify({ [field]: !product[field] }) }); setProducts(products.map((item) => item._id === updated._id ? updated : item)); setMessage("Display setting saved"); } catch (error) { setMessage(error.message); } };
  return <section className="mt-6 border-t border-slate-200 pt-6"><h2 className="text-lg font-bold">Storefront display</h2><p className="text-sm text-slate-500">Choose featured and popular shoes.</p>{message && <p className="mt-2 text-sm text-blue-700">{message}</p>}<div className="mt-3 space-y-2">{products.map((product) => <div key={product._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">{product.name}</span><div className="flex gap-3"><label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(product.isFeatured)} onChange={() => toggle(product, "isFeatured")} /> Featured</label><label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(product.isPopular)} onChange={() => toggle(product, "isPopular")} /> Popular</label></div></div>)}</div></section>;
}
