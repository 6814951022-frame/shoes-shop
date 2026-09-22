import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import CartDrawer from "./CartDrawer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const imageSource = (image) => !image || image.startsWith("http") ? image : `${API_URL.replace(/\/api$/, "")}${image}`;

function ProductCard({ product, addToCart }) {
  const available = product.sizes?.filter((item) => item.stock > 0) || [];
  const [size, setSize] = useState(available[0]?.size || "");
  const price = product.price * (1 - (product.discountPercent || 0) / 100);
  return <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><img src={imageSource(product.images?.[0]) || "https://placehold.co/600x600/e2e8f0/334155?text=Shoe"} alt={product.name} className="aspect-square w-full bg-slate-100 object-cover" /><div className="p-4"><p className="text-xs font-bold uppercase text-blue-600">{product.brand}</p><h3 className="mt-1 font-bold text-slate-900">{product.name}</h3><p className="mt-2 font-bold">{money.format(price)}</p><div className="mt-3 flex gap-2"><select value={size} onChange={(event) => setSize(event.target.value)} disabled={!available.length} className="min-w-0 flex-1 rounded border p-2 text-sm">{available.length ? available.map((item) => <option key={item.size} value={item.size}>Size {item.size}</option>) : <option>Out of stock</option>}</select><button disabled={!size} onClick={() => addToCart(product, size)} className="rounded bg-slate-900 px-3 text-sm font-bold text-white disabled:bg-slate-300">Add</button></div></div></article>;
}

export default function ShopHome() {
  const [home, setHome] = useState({ hero: {}, featured: [], popular: [], products: [] });
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { fetch(`${API_URL}/home`).then((response) => response.json()).then(setHome).catch(() => setNotice("Unable to load products")); }, []);
  const addToCart = async (product, size) => {
    const token = localStorage.getItem("token");
    if (!token) return setAuthOpen(true);
    try { const response = await fetch(`${API_URL}/cart`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId: product._id, size: Number(size), quantity: 1 }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to add item"); setNotice(`${product.name} added to cart`); setCartOpen(true); } catch (error) { setNotice(error.message); }
  };
  const Section = ({ title, products }) => products?.length ? <section className="mx-auto max-w-6xl px-5 py-8"><h2 className="mb-5 text-3xl font-black">{title}</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map((product) => <ProductCard key={product._id} product={product} addToCart={addToCart} />)}</div></section> : null;
  return <div className="min-h-screen bg-slate-50"><header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><a className="text-xl font-black">SOLE<span className="text-blue-600">STORE</span></a><div className="flex gap-3"><button onClick={() => setCartOpen(true)} className="rounded-md border px-3 py-1.5 font-bold">Cart</button><button onClick={() => setAuthOpen(true)} className="rounded-md bg-slate-900 px-3 py-1.5 font-bold text-white">Account</button></div></header>{notice && <p className="fixed bottom-4 right-4 z-40 rounded bg-slate-900 px-4 py-3 text-white">{notice}</p>}<main><section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-2 md:items-center"><div><p className="font-bold uppercase tracking-widest text-blue-600">New collection</p><h1 className="mt-3 text-5xl font-black">{home.hero.title || "Shoes for every step."}</h1><p className="mt-5 text-lg text-slate-600">{home.hero.subtitle || "Discover the pair made for your everyday movement."}</p></div><div className="grid aspect-square place-items-center rounded-3xl bg-blue-600 text-8xl">👟</div></section><Section title="Featured shoes" products={home.featured} /><Section title="Popular shoes" products={home.popular} /><Section title="Latest arrivals" products={home.products} /></main>{authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}{cartOpen && <CartDrawer onClose={() => setCartOpen(false)} onRequireLogin={() => { setCartOpen(false); setAuthOpen(true); }} />}</div>;
}
