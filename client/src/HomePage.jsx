import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import AuthModal from "./AuthModal";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");
const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const imageSource = (image) => !image || image.startsWith("http") ? image : `${API_URL.replace(/\/api$/, "")}${image}`;

const ShoeCard = ({ product }) => {
  const salePrice = product.price * (1 - (product.discountPercent || 0) / 100);
  return <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"><div className="grid aspect-square place-items-center bg-slate-100"><img src={imageSource(product.images?.[0]) || "https://placehold.co/600x600/e2e8f0/334155?text=Shoe"} alt={product.name} className="h-full w-full object-cover" /></div><div className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">{product.brand}</p><h3 className="mt-1 font-bold text-slate-900">{product.name}</h3><div className="mt-2 flex items-center gap-2"><span className="font-bold text-slate-900">{money.format(salePrice)}</span>{product.discountPercent > 0 && <><span className="text-sm text-slate-400 line-through">{money.format(product.price)}</span><span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">-{product.discountPercent}%</span></>}</div></div></article>;
};

const PopularShoes = ({ products }) => <section className="mx-auto max-w-6xl px-5 py-12"><p className="text-sm font-bold text-blue-600">MOST LOVED</p><h2 className="mb-6 text-3xl font-black">Popular shoes</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map((product) => <ShoeCard key={product._id} product={product} />)}</div></section>;

export default function HomePage() {
  const [home, setHome] = useState({ hero: {}, featured: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => { fetch(`${API_URL}/home`).then(async (response) => { if (!response.ok) throw new Error(); return response.json(); }).then(setHome).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    if (!home.popular?.length) return undefined;
    const host = document.createElement("div");
    document.querySelector("#shop")?.before(host);
    const root = createRoot(host);
    root.render(<PopularShoes products={home.popular} />);
    return () => root.unmount();
  }, [home.popular]);
  return <div className="bg-slate-50"><header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><a href="#top" className="text-xl font-black tracking-tight text-slate-900">SOLE<span className="text-blue-600">STORE</span></a><nav className="flex gap-4 text-sm font-semibold text-slate-600"><a href="#featured">Featured</a><a href="#shop">Shop</a><button onClick={() => setAuthOpen(true)} className="rounded-md bg-slate-900 px-3 py-1.5 text-white">Account</button></nav></header><main id="top"><section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-2 md:items-center md:py-20"><div><p className="font-bold uppercase tracking-widest text-blue-600">New collection</p><h1 className="mt-3 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">{home.hero.title || "Shoes for every step."}</h1><p className="mt-5 max-w-md text-lg text-slate-600">{home.hero.subtitle || "Discover the pair made for your everyday movement."}</p><a href="#shop" className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700">Shop shoes</a></div><div className="grid aspect-square place-items-center rounded-3xl bg-linear-to-br from-blue-600 to-indigo-900 p-8 text-center text-6xl shadow-xl sm:text-8xl">👟</div></section><section id="featured" className="mx-auto max-w-6xl px-5 py-12"><div className="mb-6 flex items-end justify-between"><div><p className="text-sm font-bold text-blue-600">CURATED FOR YOU</p><h2 className="text-3xl font-black">Featured shoes</h2></div></div>{loading ? <p className="text-slate-500">Loading shoes...</p> : <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{home.featured.map((product) => <ShoeCard key={product._id} product={product} />)}</div>}</section><section id="shop" className="mx-auto max-w-6xl px-5 pb-16"><h2 className="mb-6 text-3xl font-black">Latest arrivals</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{home.products.map((product) => <ShoeCard key={product._id} product={product} />)}</div>{!loading && home.products.length === 0 && <p className="text-slate-500">ยังไม่มีสินค้าในร้าน</p>}</section></main>{authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}</div>;
}
