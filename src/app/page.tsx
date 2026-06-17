"use client";

import { useEffect, useMemo, useState } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";

type Product = {
  id: number;
  title: string;
  artist?: string;
  category: string;
  price: number;
  oldPrice?: number;
  duration?: string;
  previewText?: string;
  downloadUrl?: string;
  previewUrl?: string;
  coverUrl?: string;
  isPremium?: boolean;
  isDemo?: boolean;
  bannerText?: string;
  sold?: boolean;
};

const WHATSAPP = "905452008795";
const ADMIN_PASSWORD = "h545200";
const demoProducts: Product[] = [
  { id: 1, title: "Racon Bitti", artist: "Kefalet Beatz", category: "Arabesk Beat", price: 500, oldPrice: 750, duration: "03:12", previewText: "Tek lisanslı beat", previewUrl: "" },
  { id: 2, title: "Son Nefesim", artist: "Kefalet Beatz", category: "Melenkolik Beat", price: 500, duration: "02:58", previewText: "Duygusal melankolik beat", previewUrl: "" }
];

function youtubeLink(url?: string) {
  return url && url.startsWith("http") ? url : "#";
}

function whatsappUrl(p: Product) {
  const text = encodeURIComponent(`Merhaba Kefalet Store üzerinden beat satın almak istiyorum.\n\nBeat: ${p.title}\nKategori: ${p.category}\nFiyat: ${p.price} TL\nLisans: Tek lisanslı / satılınca tekrar satışa çıkmaz.`);
  return `https://wa.me/${WHATSAPP}?text=${text}`;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [categories, setCategories] = useState<string[]>(["Melenkolik Beat", "Arabesk Beat"]);
  const [selected, setSelected] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>({ id: 0, title: "", category: "Arabesk Beat", price: 500, oldPrice: 0, duration: "03:00", artist: "Kefalet Beatz" });

  useEffect(() => {
    const unsubProducts = onValue(ref(db, "products"), snap => {
      const list: Product[] = [];
      snap.forEach(child => {
        const val = child.val();
        if (val?.title) list.push(val);
      });
      if (list.length) setProducts(list.sort((a,b)=>b.id-a.id));
    });
    const unsubCategories = onValue(ref(db, "categories"), snap => {
      const list: string[] = [];
      snap.forEach(child => { if (child.val()) list.push(child.val()); });
      if (list.length) setCategories([...new Set(list)]);
    });
    return () => { unsubProducts(); unsubCategories(); };
  }, []);

  const filtered = useMemo(() => products.filter(p => {
    const okCat = selected === "Tümü" || p.category === selected;
    const q = query.toLowerCase();
    const okSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return okCat && okSearch;
  }), [products, selected, query]);

  function saveProduct() {
    const id = form.id || Math.max(0, ...products.map(p => p.id)) + 1;
    const product = { ...form, id, artist: form.artist || "Kefalet Beatz", price: Number(form.price || 0), oldPrice: Number(form.oldPrice || 0) };
    set(ref(db, `products/${id}`), product);
    setEditing(null);
    setForm({ id: 0, title: "", category: categories[0] || "Arabesk Beat", price: 500, oldPrice: 0, duration: "03:00", artist: "Kefalet Beatz" });
  }

  function editProduct(p: Product) { setEditing(p); setForm(p); }
  function deleteProduct(id: number) { remove(ref(db, `products/${id}`)); }
  function markSold(p: Product) { set(ref(db, `products/${p.id}`), { ...p, sold: true }); }

  return <main className="page">
    <header className="header">
      <div className="logo"><h1>KEFALET STORE</h1><p>Tek lisanslı beat ve remix mağazası</p></div>
      <div className="muted">🎵 Satılan beat tekrar satışa çıkmaz.</div>
    </header>

    <div className="notice">🎵 Tüm beatler tek lisanslıdır.<br/>Satılan beat tekrar satışa çıkmaz.</div>

    <input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Beat ara..." />
    <div className="filters">
      {["Tümü", ...categories].map(c => <button key={c} className={`chip ${selected===c?"active":""}`} onClick={()=>setSelected(c)}>{c}</button>)}
    </div>

    <h2 className="section">Beatler</h2>
    <div className="grid">
      {filtered.map(p => <article className="card" key={p.id}>
        <div className="cover">{p.coverUrl ? <img src={p.coverUrl} alt={p.title}/> : <div><b>KEFALET STORE</b><br/><br/>{p.title}<br/><span className="small">{p.category} • {p.duration}</span><br/><b>{p.price} TL</b></div>}</div>
        <div>{p.sold && <span className="badge sold">SATILDI</span>}{p.isPremium && <span className="badge">PREMIUM</span>}{p.isDemo && <span className="badge demo">DEMO</span>}</div>
        <div className="title">{p.title}</div>
        <div className="muted">{p.artist || "Kefalet Beatz"} • {p.category} • {p.duration || "03:00"}</div>
        <div className="muted">{p.previewText || "Tek lisanslı beat"}</div>
        <div className="price">{p.oldPrice && p.oldPrice > p.price ? <span className="old">{p.oldPrice} TL</span> : null}{p.price} TL</div>
        <div className="actions">
          <a className="btn gold" href={youtubeLink(p.previewUrl)} target="_blank">Ön İzle</a>
          {!p.sold ? <a className="btn dark" href={whatsappUrl(p)} target="_blank">WhatsApp</a> : <button className="btn danger">Satıldı</button>}
        </div>
      </article>)}
    </div>

    <section className="admin">
      <h2>Admin Panel</h2>
      {!adminOpen ? <div className="actions"><input className="input" type="password" placeholder="Admin şifresi" value={adminPass} onChange={e=>setAdminPass(e.target.value)} /><button className="btn gold" onClick={()=>setAdminOpen(adminPass===ADMIN_PASSWORD)}>Giriş</button></div> : <>
        <div className="form">
          <input className="input" placeholder="Parça adı" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <select className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select>
          <input className="input" placeholder="Fiyat" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})}/>
          <input className="input" placeholder="Normal fiyat" value={form.oldPrice || ""} onChange={e=>setForm({...form,oldPrice:Number(e.target.value)})}/>
          <input className="input" placeholder="Süre 03:12" value={form.duration || ""} onChange={e=>setForm({...form,duration:e.target.value})}/>
          <input className="input" placeholder="YouTube linki" value={form.previewUrl || ""} onChange={e=>setForm({...form,previewUrl:e.target.value})}/>
          <input className="input" placeholder="Kapak linki" value={form.coverUrl || ""} onChange={e=>setForm({...form,coverUrl:e.target.value})}/>
          <input className="input" placeholder="İndirme linki" value={form.downloadUrl || ""} onChange={e=>setForm({...form,downloadUrl:e.target.value})}/>
        </div>
        <div className="actions" style={{marginTop:12}}><button className="btn gold" onClick={saveProduct}>{editing ? "Güncelle" : "Ürün Ekle"}</button><button className="btn dark" onClick={()=>setAdminOpen(false)}>Çıkış</button></div>
        <h3>Mevcut Ürünler</h3>
        {products.map(p=><div className="card" key={p.id} style={{marginBottom:8}}><b>{p.title}</b> <span className="muted">{p.price} TL • {p.category}</span><div className="actions" style={{marginTop:8}}><button className="btn dark" onClick={()=>editProduct(p)}>Düzenle</button><button className="btn gold" onClick={()=>markSold(p)}>Satıldı</button><button className="btn danger" onClick={()=>deleteProduct(p.id)}>Sil</button></div></div>)}
      </>}
    </section>
  </main>;
}
