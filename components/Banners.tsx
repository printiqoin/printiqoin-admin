"use client";
import { useState, useEffect, useCallback, ReactNode } from "react";
import Image from "next/image";

type Banner = {
  _id: string;
  desktopImage: string;
  mobileImage: string;

  isActive: boolean;
};

type FieldProps = { label: string; children: ReactNode };

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");

  const [loading, setLoading] = useState(false);
  const api = process.env.NEXT_PUBLIC_API_URL 

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`${api}/banner`);
      const data = await res.json();
      if (data.banners) setBanners(data.banners.sort((a: Banner, b: Banner) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    } catch (err) {
      console.error(err);
    }
  }, [api]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "tablet" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    if (type === "desktop") setDesktopImage(b64);
    else setMobileImage(b64);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setDesktopImage("");
    setMobileImage("");

    setShowModal(false);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setDesktopImage(banner.desktopImage || "");
    setMobileImage(banner.mobileImage || "");

    setShowModal(true);
  };

  const saveBanner = async () => {
    if (!desktopImage || !mobileImage) {
      alert("Desktop and Mobile images are required!");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const payload = {
        desktopImage, mobileImage
      };
      
      let res;
      if (editingBanner) {
        res = await fetch(`${api}/banner/${editingBanner._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ banner: payload }),
        });
      } else {
        res = await fetch(`${api}/banner/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        fetchBanners();
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save banner");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if(!confirm("Are you sure you want to delete this banner?")) return;
    const token = localStorage.getItem("token") || "";
    const res = await fetch(`${api}/banner/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    if (res.ok) setBanners(prev => prev.filter(b => b._id !== id));
  };

  const toggleActive = async (banner: Banner) => {
    const token = localStorage.getItem("token") || "";
    const res = await fetch(`${api}/banner/${banner._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ banner: { isActive: !banner.isActive } }),
    });
    if (res.ok) fetchBanners();
  };

  return (
    <div>
      <style>{`
        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .btn-primary { background: #D32F2F; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-primary:hover { background: #B71C1C; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #374151; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; }
        .btn-ghost:hover { color: #D32F2F; border-color: #D32F2F; background: #fff5f0; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; overflow-y: auto; }
        .input-field { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #374151; background: #fff; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #D32F2F; box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.1); }
        .upload-input { display: none; }
        .upload-box { display: block; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center; background: #f8fafc; transition: all 0.2s; }
        .upload-box:hover { border-color: #D32F2F; background: #fff5f0; }
        .banner-preview-wrapper { display: flex; gap: 12px; align-items: flex-start; flex: 1; min-width: 0; flex-wrap: wrap; }
        .banner-preview-item { display: flex; flex-direction: column; gap: 4px; }
        .banner-preview-label { font-size: 10px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; }
        .banner-preview-image { background: #f3f4f6; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; }
        
        .toggle { position: relative; width: 38px; height: 22px; display: inline-block; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; inset: 0; background: #e2e8f0; border-radius: 22px; cursor: pointer; transition: 0.2s; }
        .toggle-slider:before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .toggle input:checked + .toggle-slider { background: #D32F2F; }
        .toggle input:checked + .toggle-slider:before { transform: translateX(16px); }

        @media (max-width: 768px) {
          .banner-card { flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
          .banner-actions { width: 100%; justify-content: space-between !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, color: "#374151", margin: 0 }}>Banners</h1>
          <p style={{ fontSize: 13, color: "#4b5563", margin: "4px 0 0 0" }}>{banners.filter(b => b.isActive).length} active</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Banner</button>
      </div>

      {/* Banner list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        {banners.map((banner) => (
          <div key={banner._id} className="card banner-card" style={{ display: "flex", padding: 16, justifyContent: "space-between", alignItems: "center" }}>
            
            <div className="banner-preview-wrapper" style={{ opacity: banner.isActive ? 1 : 0.5 }}>
              <div className="banner-preview-item">
                <span className="banner-preview-label">Desktop</span>
                <div className="banner-preview-image" style={{ width: "200px", height: "auto" }}>
                  <img src={banner.desktopImage} alt="desktop banner" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
                </div>
              </div>
              
              <div className="banner-preview-item">
                <span className="banner-preview-label">Mobile</span>
                <div className="banner-preview-image" style={{ width: "60px", height: "auto" }}>
                  <img src={banner.mobileImage} alt="mobile banner" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
                </div>
              </div>
              

            </div>

            <div className="banner-actions" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <label className="toggle" title={banner.isActive ? "Deactivate" : "Activate"}>
                <input type="checkbox" checked={banner.isActive} onChange={() => toggleActive(banner)} />
                <span className="toggle-slider"></span>
              </label>
              <button className="btn-ghost" onClick={() => openEdit(banner)}>Edit</button>
              <button className="btn-ghost" onClick={() => remove(banner._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={resetForm}>
          <div className="card" style={{ width: "clamp(300px, 90vw, 600px)", padding: "clamp(16px, 5vw, 32px)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(16px, 4vw, 20px)", fontWeight: 700, color: "#374151", marginBottom: 20 }}>
              {editingBanner ? "Edit Banner" : "New Banner"}
            </div>

            
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
              <Field label="Desktop Image (Required) - ~1920x600">
                <label className="upload-box" style={{ cursor: "pointer", padding: desktopImage ? "8px" : "20px" }}>
                  {desktopImage ? (
                    <img src={desktopImage} alt="desktop preview" style={{ width: "100%", maxHeight: "150px", borderRadius: 6, objectFit: "contain" }} />
                  ) : (
                    <div style={{ fontSize: 13, color: "#4b5563" }}>📁 Click to upload desktop image</div>
                  )}
                  <input className="upload-input" type="file" accept="image/*" onChange={(e) => handleFile(e, "desktop")} />
                </label>
              </Field>



              <Field label="Mobile Image (Required) - ~540x600">
                <label className="upload-box" style={{ cursor: "pointer", padding: mobileImage ? "8px" : "20px" }}>
                  {mobileImage ? (
                    <img src={mobileImage} alt="mobile preview" style={{ width: "100%", maxHeight: "150px", borderRadius: 6, objectFit: "contain" }} />
                  ) : (
                    <div style={{ fontSize: 13, color: "#4b5563" }}>📱 Click to upload mobile image</div>
                  )}
                  <input className="upload-input" type="file" accept="image/*" onChange={(e) => handleFile(e, "mobile")} />
                </label>
              </Field>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 32, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={resetForm}>Cancel</button>
              <button className="btn-primary" onClick={saveBanner} disabled={!desktopImage || !mobileImage || loading}>
                {loading ? "Saving..." : "Save Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
