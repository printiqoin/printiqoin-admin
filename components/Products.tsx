"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

/* ─── Types ─────────────────────────────────────────── */
type SizeEntry = { size: string; stock: string; price: string };

type Variant = {
  _id?: string;
  name: string;
  color: string;
  modelName?: string;
  sizeName?: string;
  price: string;
  stock: string;
  sizes: SizeEntry[];
  images: string[];       // base64 previews / stored URLs
  isDefault: boolean;
  variantType?: 'model' | 'color' | 'size';

  duration?: string;
  capacity?: string;
  maxGuests?: string;
  roomType?: string;
  serviceType?: string;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  category?: { _id: string; name: string } | null;
  variants: Variant[];
  isActive: boolean;
  amenities?: string[];
};

type Category = { _id: string; name: string };



const BLANK_VARIANT = (): Variant => ({
  name: "",
  color: "",
  modelName: "",
  sizeName: "",
  price: "",
  stock: "0",
  sizes: [],
  images: [],
  isDefault: false,
  variantType: 'color',
  duration: "",
  capacity: "",
  maxGuests: "",
  roomType: "",
  serviceType: ""
});

/* ─── Helpers ────────────────────────────────────────── */
const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const token = () => localStorage.getItem("token") || "";

const colorMap: Record<string, string> = {
  "sage green": "#8a9a86",
  "sage": "#8a9a86",
  "coffee brown": "#4b3621",
  "coffee": "#4b3621",
  "mauve pink": "#e0b0ff",
  "mauve": "#e0b0ff",
  "olive beige": "#a89f91",
  "olive": "#808000",
  "beige": "#f5f5dc",
  "navy blue": "#000080",
  "navy": "#000080",
  "sky blue": "#87ceeb",
  "mustard yellow": "#ffdb58",
  "mustard": "#ffdb58",
  "dusty pink": "#dcaebb",
  "dusty rose": "#cca0ac",
  "wine red": "#722f37",
  "wine": "#722f37",
  "burgundy": "#800020",
  "charcoal grey": "#36454f",
  "charcoal gray": "#36454f",
  "charcoal": "#36454f",
  "cream": "#fffdd0",
  "khaki": "#c3b091",
  "camel": "#c19a6b",
  "rust": "#b7410e",
  "terracotta": "#e2725b",
  "teal": "#008080",
  "lavender": "#e6e6fa",
  "lilac": "#c8a2c8",
  "peach": "#ffdab9",
  "coral": "#ff7f50",
  "mint green": "#98ff98",
  "mint": "#98ff98",
  "apricot": "#fbceb1",
  "emerald green": "#50c878",
  "emerald": "#50c878",
  "forest green": "#228b22",
  "olive green": "#bab86c",
  "maroon": "#800000",
  "bronze": "#cd7f32",
  "copper": "#b87333",
  "tan": "#d2b48c",
};

const getValidColor = (colorName: string): string => {
  if (!colorName) return "#ccc";
  const clean = colorName.trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
  if (/^#([0-9a-f]{3}){1,2}$/i.test(clean)) return colorName;
  if (colorMap[clean]) return colorMap[clean];
  if (clean.includes("red")) return "#ff0000";
  if (clean.includes("blue")) return "#0000ff";
  if (clean.includes("green")) return "#008000";
  if (clean.includes("yellow")) return "#ffff00";
  if (clean.includes("pink")) return "#ffc0cb";
  if (clean.includes("brown")) return "#a52a2a";
  if (clean.includes("orange")) return "#ffa500";
  if (clean.includes("purple")) return "#800080";
  if (clean.includes("grey") || clean.includes("gray")) return "#808080";
  if (clean.includes("black")) return "#000000";
  if (clean.includes("white")) return "#ffffff";
  if (clean.includes("gold")) return "#ffd700";
  if (clean.includes("silver")) return "#c0c0c0";
  if (clean.includes("beige")) return "#f5f5dc";
  if (clean.includes("wooden") || clean.includes("wood")) return "#8B5A2B";
  return colorName;
};

const PREDEFINED_COLORS = ["Black", "White", "Red", "Blue", "Green", "Wooden", "Gold", "Silver"];

/* ─── Main Component ─────────────────────────────────── */
export default function Products() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);

  // form state
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amenities, setAmenities]   = useState<string[]>([]);
  const [variants, setVariants]     = useState<Variant[]>([{ ...BLANK_VARIANT(), color: "Default", isDefault: true }]);
  const api = process.env.NEXT_PUBLIC_API_URL;

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${api}/product`, { headers: { Authorization: token() } });
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) { console.error(e); }
  }, [api]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${api}/category`);
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) { console.error(e); }
  }, [api]);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  /* ── Variant helpers ── */
  const addVariant = () => setVariants(v => [...v, BLANK_VARIANT()]);

  const removeVariant = (i: number) => {
    setVariants(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      if (next.length && !next.some(v => v.isDefault)) next[0].isDefault = true;
      return next;
    });
  };

  const updateVariant = (i: number, field: keyof Variant, value: unknown) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const setDefault = (i: number) => {
    setVariants(prev => prev.map((v, idx) => ({ ...v, isDefault: idx === i })));
  };

  const addImages = async (i: number, files: FileList) => {
    const b64s = await Promise.all(Array.from(files).map(toBase64));
    setVariants(prev => prev.map((v, idx) =>
      idx === i ? { ...v, images: [...v.images, ...b64s] } : v
    ));
  };

  const removeImage = (vi: number, ii: number) => {
    setVariants(prev => prev.map((v, idx) =>
      idx === vi ? { ...v, images: v.images.filter((_, i) => i !== ii) } : v
    ));
  };

  const addSize = (vi: number) => {
    setVariants(prev => prev.map((v, idx) =>
      idx === vi ? { ...v, sizes: [...v.sizes, { size: "", stock: "0", price: "" }] } : v
    ));
  };

  const applyPreset = (vi: number, labels: string[]) => {
    setVariants(prev => prev.map((v, idx) =>
      idx === vi ? { ...v, sizes: labels.map(l => ({ size: l, stock: "10", price: "" })) } : v
    ));
  };

  const updateSize = (vi: number, si: number, field: keyof SizeEntry, value: string) => {
    setVariants(prev => prev.map((v, idx) =>
      idx === vi ? { ...v, sizes: v.sizes.map((s, i) => i === si ? { ...s, [field]: value } : s) } : v
    ));
  };

  const removeSize = (vi: number, si: number) => {
    setVariants(prev => prev.map((v, idx) =>
      idx === vi ? { ...v, sizes: v.sizes.filter((_, i) => i !== si) } : v
    ));
  };

  /* ── Reset ── */
  const resetForm = () => {
    setName(""); setDescription(""); setCategoryId(""); setAmenities([]);
    setVariants([{ ...BLANK_VARIANT(), color: "Default", isDefault: true }]);
    setEditId(null); setError("");
  };

  /* ── Validate ── */
  const validate = (): string | null => {
    if (!name.trim()) return "Product name is required.";
    if (variants.length === 0) return "At least one variant is required.";
    const colors = variants.map(v => v.color.trim().toLowerCase()).filter(Boolean);
    if (new Set(colors).size !== colors.length) return "Each variant name must be unique.";
    for (const v of variants) {
      const vPrice = Number(v.price) || (v.sizes.length > 0 ? Number(v.sizes[0].price) : 0);
      if (vPrice <= 0) return "Every variant must have a valid price (check your quantities).";
    }
    return null;
  };

  /* ── Save ── */
  const saveProduct = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true); setError("");

    const payload = {
      name, description,
      category: categoryId || undefined,
      amenities,
      variants: variants.map((v, index) => {
        const vPrice = Number(v.price) || (v.sizes.length > 0 ? Number(v.sizes[0].price) : 0);
        const optionName = v.color || (variants.length === 1 ? 'Default' : `Option ${index + 1}`);
        return {
          ...v,
          name: optionName,
          color: optionName,
          price: vPrice,
          stock: Number(v.stock) || 0,
          sizes: v.sizes.map(s => ({
            ...s,
            price: Number(s.price) || vPrice,
            stock: Number(s.stock) || 0
          }))
        };
      }),
    };

    try {
      const url = editId
        ? `${api}/product/update/${editId}`
        : `${api}/product/add`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }

      // update local state directly — no extra fetch needed
      if (editId) {
        setProducts(prev => prev.map(p => p._id === editId ? data.product : p));
      } else {
        setProducts(prev => [...prev, data.product]);
      }
      resetForm();
      setShowModal(false);
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit ── */
  const handleEdit = (p: Product) => {
    setEditId(p._id);
    setName(p.name);
    setDescription(p.description);
    setCategoryId(p.category?._id || "");
    setAmenities(p.amenities || []);
    setVariants(p.variants.map(v => ({
      ...v,
      color: v.color || v.name || "",
      variantType: v.variantType || 'color',
      price: String(v.price),
      stock: String(v.stock || 0),
      sizes: Array.isArray(v.sizes) ? v.sizes.map(s => ({ ...s, price: String(s.price), stock: String(s.stock) })) : []
    })));
    setError("");
    setShowModal(true);
  };

  /* ── Delete ── */
  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`${api}/product/delete/${id}`, {
      method: "DELETE", headers: { Authorization: token() },
    });
    if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <style>{`
        .card{background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);}
        .btn-primary{background:#D32F2F;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;}
        .btn-primary:hover{background:#B71C1C;}
        .btn-primary:disabled{opacity:.5;cursor:not-allowed;}
        .btn-ghost{background:transparent;color:#374151;border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;}
        .btn-ghost:hover{color:#D32F2F;border-color:#D32F2F;background:#fff5f0;}
        .btn-sm{background:#f3f4f6;color:#374151;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;border:1px solid #e2e8f0;}
        .btn-sm:hover{background:#e5e7eb;}
        .input{background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;color:#111827;padding:10px;width:100%;box-sizing:border-box;font-size:13px;outline:none;}
        .input:focus{border-color:#D32F2F;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999;}
        .variant-card{background:#f8f9fa;border:1px solid #e2e8f0;border-radius:10px;padding:16px;position:relative;}
        .variant-card.default{border-color:#D32F2F;}
        .variant-tab { padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer; border-radius: 6px; border: 1px solid transparent; background: transparent; color: #4b5563; }
        .variant-tab.active { background: #D32F2F; color: #fff; }
        .err{color:#ef4444;font-size:12px;margin-bottom:12px;background:#ef444415;padding:8px 12px;border-radius:6px;}
        .trow td{padding:14px 20px;border-bottom:1px solid #e2e8f0;color:#111827;font-size:13px;}
        .color-dot{width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:6px;border:1px solid #00000030;}
        .img-thumb{width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;}
        .img-remove{position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .modal-card{scrollbar-width:none;-ms-overflow-style:none;}
        .modal-card::-webkit-scrollbar{display:none;}
        
        @media (max-width: 1024px) {
          .btn-primary { padding: 8px 16px; font-size: 12px; }
          .btn-ghost { padding: 5px 10px; font-size: 11px; }
          .trow td { padding: 10px 12px; font-size: 12px; }
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        @media (max-width: 768px) {
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { position: absolute; top: -9999px; left: -9999px; }
          table { min-width: 100% !important; }
          .trow { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .trow td { display: flex; flex-direction: column; align-items: flex-start; padding: 8px 0; border: none; border-bottom: 1px solid #f3f4f6; }
          .trow td:last-child { border-bottom: none; }
          .trow td:before { content: attr(data-label); font-weight: 700; color: #4b5563; font-size: 11px; text-transform: uppercase; margin-bottom: 6px; }
          .overlay { padding: 16px; }
          .modal-card { width: calc(100% - 32px) !important; max-height: 90vh !important; }
        }
        @media (max-width: 640px) {
          .modal-card { width: calc(100% - 24px) !important; padding: 16px !important; }
          .input { font-size: 14px; }
          .btn-primary { padding: 8px 12px; font-size: 12px; width: 100%; }
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12, width: "100%" }}>
        <div>
          <h1 style={{ color: "#374151", fontFamily: "'Syne',sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, margin: 0 }}>Products</h1>
          <p style={{ color: "#4b5563", fontSize: 13, margin: "4px 0 0 0" }}>{products.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Product</button>
      </div>

      {/* Search */}
      <input className="input" style={{ marginBottom: 20, width: "100%" }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />

      {/* Table */}
      <div className="card" style={{ overflowX: "auto", overflowY: "hidden", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Image & Name</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Category</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Price</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Status</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Stock</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Created Date</td>
              <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase" }}>Actions</td>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#4b5563", fontSize: 13 }}>No products yet</td></tr>
            )}
            {filtered.map(p => {
              const def = p.variants?.find(v => v.isDefault) || p.variants?.[0];
              const totalStock = p.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;
              const date = new Date(parseInt(p._id.substring(0, 8), 16) * 1000).toLocaleDateString();
              
              return (
                <tr key={p._id} className="trow">
                  <td data-label="Image & Name">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {def?.images?.[0]
                        ? <Image src={def.images[0]} className="img-thumb" alt={p.name} width={40} height={40} style={{ objectFit: "cover" }} />
                        : <div style={{ width: 40, height: 40, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
                      }
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                    </div>
                  </td>
                  <td data-label="Category" style={{ color: "#D32F2F", fontSize: 12 }}>{p.category?.name || "—"}</td>
                  <td data-label="Price" style={{ color: "#4b5563", fontSize: 12 }}>{def ? `₹${Number(def.price).toFixed(2)}` : "—"}</td>
                  <td data-label="Status">
                    <span style={{ background: p.isActive !== false ? "#dcfce7" : "#fee2e2", color: p.isActive !== false ? "#166534" : "#991b1b", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                      {p.isActive !== false ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td data-label="Stock" style={{ color: "#4b5563", fontSize: 12 }}>{totalStock}</td>
                  <td data-label="Created Date" style={{ color: "#4b5563", fontSize: 12 }}>{date}</td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-ghost" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-ghost" onClick={() => remove(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="card modal-card" style={{ width: "clamp(300px, 90vw, 620px)", padding: "clamp(16px, 4vw, 28px)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 20 }}>
              {editId ? "Edit Product" : "New Product"}
            </div>

            {error && <div className="err">{error}</div>}

            {/* Base fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <Field label="Product Name">
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Custom Mug" />
              </Field>
              <Field label="Description">
                <textarea className="input" value={description} rows={3} onChange={e => setDescription(e.target.value)} placeholder="Product description" style={{ resize: "vertical" }} />
              </Field>
              <Field label="Category">
                <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">— Select category —</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
            </div>

            {/* Variants */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                Variants <span style={{ color: "#4b5563", fontWeight: 400 }}>({variants.length})</span>
              </div>
              <button className="btn-sm" onClick={addVariant}>+ Add Variant</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {variants.map((v, i) => (
                <VariantCard
                  key={i}
                  variant={v}
                  index={i}
                  total={variants.length}
                  onUpdate={updateVariant}
                  onRemove={removeVariant}
                  onSetDefault={setDefault}
                  onAddImages={addImages}
                  onRemoveImage={removeImage}
                  onAddSize={addSize}
                  onUpdateSize={updateSize}
                  onRemoveSize={removeSize}
                  onApplyPreset={applyPreset}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={saveProduct} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Field ─────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#D32F2F" }}>{label}</label>
      {children}
    </div>
  );
}

/* ─── VariantCard ────────────────────────────────────── */
function VariantCard({
  variant, index, total, onUpdate, onRemove, onSetDefault, onAddImages, onRemoveImage,
  onAddSize, onUpdateSize, onRemoveSize, onApplyPreset,
}: {
  variant: Variant;
  index: number;
  total: number;
  onUpdate: (i: number, field: keyof Variant, value: unknown) => void;
  onRemove: (i: number) => void;
  onSetDefault: (i: number) => void;
  onAddImages: (i: number, files: FileList) => void;
  onRemoveImage: (vi: number, ii: number) => void;
  onAddSize: (vi: number) => void;
  onUpdateSize: (vi: number, si: number, field: keyof SizeEntry, value: string) => void;
  onRemoveSize: (vi: number, si: number) => void;
  onApplyPreset: (vi: number, labels: string[]) => void;
}) {
  return (
    <div className={`variant-card${variant.isDefault ? " default" : ""}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {total > 1 && (
        <button
          onClick={() => onRemove(index)}
          style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}
        >×</button>
      )}


      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <Field label="Model Name(s) (comma separated)">
          <input className="input" style={{ padding: "10px", width: "100%", boxSizing: "border-box" }} value={variant.modelName || ""} onChange={e => onUpdate(index, "modelName", e.target.value)} placeholder="e.g. iPhone 13, iPhone 14" />
        </Field>

        <Field label="Color(s) - Select multiple">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {PREDEFINED_COLORS.map(c => {
              const hex = getValidColor(c);
              const colorStr = `${c}|${hex}`;
              const selectedColors = (variant.color || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
              // Check if the current color is in the string (either just by name or by Name|Hex format)
              const isSelected = selectedColors.some(s => s === c.toLowerCase() || s.startsWith(c.toLowerCase() + "|"));
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    let current = (variant.color || "").split(",").map(s => s.trim()).filter(Boolean);
                    if (isSelected) {
                      current = current.filter(s => !(s.toLowerCase() === c.toLowerCase() || s.toLowerCase().startsWith(c.toLowerCase() + "|")));
                    } else {
                      current.push(colorStr);
                    }
                    onUpdate(index, "color", current.join(", "));
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 10px 4px 4px", borderRadius: 20,
                    border: isSelected ? "1px solid #000" : "1px solid #e2e8f0",
                    background: isSelected ? "#f3f4f6" : "#fff",
                    cursor: "pointer", fontSize: 12, fontWeight: 500
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    backgroundColor: hex,
                    border: "1px solid rgba(0,0,0,0.1)"
                  }} />
                  {c}
                </button>
              )
            })}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#f9fafb", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>ADD CUSTOM COLOR</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input 
                id={`custom-hex-${index}`}
                type="color" 
                style={{ width: 36, height: 36, padding: 0, border: "none", cursor: "pointer", background: "transparent" }}
                defaultValue="#000000"
                title="Pick Custom Hex"
              />
              <input 
                id={`custom-name-${index}`}
                className="input" 
                style={{ padding: "8px 10px", width: "100%", boxSizing: "border-box", fontSize: 13 }} 
                placeholder="Color Name (e.g. Sky Blue)" 
              />
              <button 
                type="button"
                className="btn-sm"
                onClick={() => {
                  const hexInput = document.getElementById(`custom-hex-${index}`) as HTMLInputElement;
                  const nameInput = document.getElementById(`custom-name-${index}`) as HTMLInputElement;
                  if (hexInput && nameInput && nameInput.value.trim()) {
                    const newColor = `${nameInput.value.trim()}|${hexInput.value}`;
                    const current = (variant.color || "").split(",").map(s => s.trim()).filter(Boolean);
                    onUpdate(index, "color", [...current, newColor].join(", "));
                    nameInput.value = ""; // reset
                  }
                }}
              >
                Add
              </button>
            </div>
            
            {(variant.color || "").split(",").filter(Boolean).length > 0 && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>SELECTED COLORS:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(variant.color || "").split(",").map(s => s.trim()).filter(Boolean).map((colorStr, i) => {
                    const [cName, cHex] = colorStr.includes("|") ? colorStr.split("|") : [colorStr, getValidColor(colorStr)];
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#e5e7eb", padding: "2px 6px 2px 2px", borderRadius: 12, fontSize: 11 }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: cHex || "#000" }} />
                        {cName}
                        <button type="button" style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0 2px", color: "#6b7280" }} onClick={() => {
                          const current = (variant.color || "").split(",").map(s => s.trim()).filter(Boolean);
                          current.splice(i, 1);
                          onUpdate(index, "color", current.join(", "));
                        }}>×</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </Field>

        <Field label="Price (₹)">
          <input className="input" type="number" min="0" value={variant.price} onChange={e => onUpdate(index, "price", e.target.value)} placeholder="0" />
        </Field>
        
        <Field label="Total Stock">
          <input className="input" type="number" min="0" value={variant.stock} onChange={e => onUpdate(index, "stock", e.target.value)} placeholder="0" />
        </Field>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 12, color: "#D32F2F", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 600 }}>
          <input type="checkbox" checked={variant.isDefault} onChange={() => onSetDefault(index)} />
          Default variant
        </label>
      </div>

      {/* Images - Unlimited */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#D32F2F" }}>
            Product Images <span style={{ color: "#555570", fontWeight: 400 }}>({variant.images.length})</span>
          </span>
          <label style={{ cursor: "pointer", background: "#f3f4f6", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#374151", border: "1px solid #e2e8f0" }}>
            + Add Images
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              style={{ display: "none" }} 
              onChange={e => {
                if (e.target.files) {
                  onAddImages(index, e.target.files);
                }
              }} 
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 10 }}>
          {variant.images.map((src, i) => {
            const isMain = i === 0;
            return (
              <div key={i} style={{ 
                position: "relative", 
                aspectRatio: "1/1", 
                background: "#f9fafb", 
                borderRadius: 8, 
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                <Image src={src} alt={`img-${i}`} fill style={{ objectFit: "cover" }} unoptimized />
                <button className="img-remove" onClick={() => onRemoveImage(index, i)} style={{ zIndex: 2 }}>×</button>
                <div style={{ 
                  position: "absolute", 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  background: isMain ? "#D32F2F" : "rgba(0,0,0,0.7)", 
                  color: "#fff", 
                  fontSize: "9px", 
                  textAlign: "center", 
                  padding: "2px 0",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  {isMain ? "MAIN" : `SUB ${i}`}
                </div>
              </div>
            );
          })}
          {variant.images.length === 0 && (
            <div style={{ 
              gridColumn: "1 / -1",
              background: "#f9fafb", 
              borderRadius: 8, 
              border: "1px dashed #e2e8f0",
              padding: "16px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "70px"
            }}>
              <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>
                No images added.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sizes Section - Now always shown */}
      <div style={{ marginTop: 10, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#D32F2F" }}>Sizes / Options <span style={{ color: "#555570", fontWeight: 400 }}>({variant.sizes.length})</span></span>
          <button className="btn-sm" onClick={() => onAddSize(index)}>+ Add Value</button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {variant.sizes.map((sz, si) => (
            <div key={si} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center", background: "#f9fafb", padding: 8, borderRadius: 6, border: "1px solid #f3f4f6" }}>
              <input className="input" style={{ padding: "8px 10px", fontSize: 12 }} placeholder="Value (e.g. XL or 128GB)" value={sz.size} onChange={e => onUpdateSize(index, si, 'size', e.target.value)} />
              <input className="input" style={{ padding: "8px 10px", fontSize: 12 }} type="number" min="0" placeholder="Stock" value={sz.stock} onChange={e => onUpdateSize(index, si, 'stock', e.target.value)} />
              <button style={{ background: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontSize: 16, padding: "0 4px" }} onClick={() => onRemoveSize(index, si)}>×</button>
            </div>
          ))}
          {variant.sizes.length === 0 && (
            <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textAlign: "center", padding: "10px 0" }}>
              No extra sizes added.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

