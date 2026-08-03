"use client";
import { useState, useEffect, useCallback, ReactNode } from "react";
import Image from "next/image";

/* ================= TYPES ================= */

type Category = {
  _id: string;
  name: string;
  image?: string;
  products?: any[]; // Just array of ids or objects
  color?: string;
};

type FormType = {
  name: string;
  image: string;
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

type HeaderProps = {
  title: string;
  sub: string;
  onAdd: () => void;
};

/* ================= COMPONENT ================= */

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormType>({ name: "", image: "" });
  const [loading, setLoading] = useState(false);
  const api = process.env.NEXT_PUBLIC_API_URL;

  const fetchCategories = useCallback(async () => {
    fetch(`${api}/category`)
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, [api]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setForm(prev => ({ ...prev, image: b64 }));
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat._id);
    setForm({ name: cat.name, image: cat.image || "" });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ name: "", image: "" });
    setEditId(null);
    setShowModal(false);
  };

  const addCategory = async () => {
    if (!form.name.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token") || "";
      let res;

      if (editId) {
        res = await fetch(`${api}/category/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": token },
          body: JSON.stringify({ category: form }),
        });
      } else {
        res = await fetch(`${api}/category/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": token },
          body: JSON.stringify({ ...form, isActive: true, products: [] }),
        });
      }
      
      if (!res.ok) {
        if (res.status === 401) {
          alert("Unauthorized. Please log in.");
          setLoading(false);
          return;
        }
        const text = await res.text();
        alert(`Error: ${text}`);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        fetchCategories();
        resetForm();
      } else {
        alert(data.error || "Failed to save category");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if(!confirm("Are you sure you want to delete this category?")) return;
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${api}/category/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
      });

      if (!res.ok) {
        if (res.status === 401) return alert("Unauthorized. Please log in.");
        const text = await res.text();
        return alert(`Error: ${text}`);
      }

      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c._id !== id));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <style>{`
        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; transition: border-color 0.18s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; display: flex; flex-direction: column; }
        .card:hover { border-color: #D32F2F; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transform: translateY(-2px); transition: all 0.3s ease; }
        .btn-primary { background: #D32F2F; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .btn-primary:hover { background: #B71C1C; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #374151; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .btn-ghost:hover { color: #D32F2F; border-color: #D32F2F; background: #fff5f0; }
        .input { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; color: #111827; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 14px; width: 100%; outline: none; transition: border-color 0.15s; }
        .input:focus { border-color: #D32F2F; }
        .overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; overflow-y: auto; }
        .upload-input { display: none; }
        .upload-box { display: block; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center; background: #f8fafc; transition: all 0.2s; cursor: pointer; }
        .upload-box:hover { border-color: #D32F2F; background: #fff5f0; }

        @media (max-width: 768px) {
          .btn-primary { padding: 8px 16px; font-size: 12px; }
          .btn-ghost { padding: 6px 10px; font-size: 11px; }
          .input { font-size: 14px; padding: 8px 10px; }
        }
        @media (max-width: 640px) {
          .btn-primary { width: 100%; }
          .overlay { padding: 12px; }
        }
      `}</style>

      <PageHeader title="Categories" sub={`${categories.length} total categories`} onAdd={() => { resetForm(); setShowModal(true); }} />

      {/* CATEGORY LIST */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 24, width: "100%" }}>
        {categories.map((cat) => (
          <div key={cat._id} className="card">
            {/* Image Section */}
            <div style={{ width: "100%", height: 180, background: "#f8fafc", position: "relative" }}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12 }}>
                  No Image
                </div>
              )}
            </div>

            {/* Info Section */}
            <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", fontFamily: "'Syne', sans-serif" }}>{cat.name}</h3>
                <div style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, color: "#475569" }}>
                  {cat.products?.length || 0} items
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b", flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              </p>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                <button className="btn-ghost" onClick={() => handleEdit(cat)}>Edit</button>
                <button className="btn-ghost" onClick={() => remove(cat._id)} style={{ color: "#ef4444", borderColor: "#fee2e2" }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="overlay" onClick={resetForm}>
          <div className="card" style={{ width: "clamp(300px, 90vw, 500px)", padding: "clamp(16px, 4vw, 28px)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(16px, 4vw, 20px)", fontWeight: 700, color: "#374151", marginBottom: 20 }}>
              {editId ? "Edit Category" : "New Category"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FieldLabel label="Category Name">
                <input
                  className="input"
                  value={form.name}
                  placeholder="e.g. Mugs"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </FieldLabel>



              <FieldLabel label="Category Image (Required)">
                <label className="upload-box" style={{ padding: form.image ? "8px" : "24px" }}>
                  {form.image ? (
                    <img src={form.image} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 6 }} />
                  ) : (
                    <div style={{ fontSize: 13, color: "#4b5563" }}>📁 Click to upload image</div>
                  )}
                  <input className="upload-input" type="file" accept="image/*" onChange={handleFile} />
                </label>
              </FieldLabel>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={resetForm} style={{ flex: "1 0 auto", minWidth: "80px" }}>Cancel</button>
              <button className="btn-primary" onClick={addCategory} disabled={loading || !form.name || !form.image} style={{ flex: "1 0 auto", minWidth: "80px" }}>
                {loading ? "Saving..." : (editId ? "Save Changes" : "Add Category")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function FieldLabel({ label, children }: FieldProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function PageHeader({ title, sub, onAdd }: HeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, width: "100%" }}>
      <div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, color: "#374151", margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 13, color: "#4b5563", margin: "4px 0 0 0" }}>{sub}</p>
      </div>
      <button className="btn-primary" onClick={onAdd}>+ Add New</button>
    </div>
  );
}