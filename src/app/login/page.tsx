"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("printiqo@gmail.com");
  const [password, setPassword] = useState("printiqo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/admin/categories");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return <div style={{ background: "#ffffff", height: "100vh" }} />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/admin/categories");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* HEADER SECTION - Orange & Green */}
      <header style={{
        background: "linear-gradient(135deg, #D32F2F 0%, #374151 100%)",
        padding: "24px 20px",
        boxShadow: "0 2px 8px rgba(255, 140, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }}>
        {/* Printiqo Logo Placeholder */}
        <div style={{
          width: "56px",
          height: "56px",
          background: "#ffffff",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}>
          <img src="/images/logo.png" alt="Printiqo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <h1 style={{
            color: "#ffffff",
            margin: 0,
            fontSize: "24px",
            fontWeight: 800,
            fontFamily: "'Syne', sans-serif"
          }}>
            Printiqo
          </h1>
          <p style={{
            color: "#ffffff",
            margin: 0,
            fontSize: "12px",
            fontWeight: 500,
            opacity: 0.9
          }}>
            Admin Portal
          </p>
        </div>
      </header>

      {/* LOGIN FORM SECTION */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "40px 20px"
      }}>
        <div style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        }}>
          <h2 style={{
            color: "#374151",
            marginBottom: "8px",
            fontFamily: "'Syne', sans-serif",
            fontSize: "20px",
            textAlign: "center",
            fontWeight: 700
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: "#666666",
            marginBottom: "24px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            textAlign: "center",
            margin: "0 0 24px 0"
          }}>
            Sign in to your account
          </p>

          {error && (
            <div style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              border: "1px solid #ef5350"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{
                display: "block",
                color: "#374151",
                fontSize: "12px",
                marginBottom: "6px",
                fontWeight: 600,
                textTransform: "uppercase"
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="printiqo@gmail.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#f9f9f9",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  color: "#333333",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#D32F2F"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                color: "#374151",
                fontSize: "12px",
                marginBottom: "6px",
                fontWeight: 600,
                textTransform: "uppercase"
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#f9f9f9",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  color: "#333333",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#D32F2F"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                background: loading ? "#D32F2F" : "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "10px",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.3s",
                fontFamily: "'DM Sans', sans-serif"
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid #e0e0e0",
            textAlign: "center"
          }}>
            <p style={{
              color: "#999999",
              fontSize: "12px",
              margin: 0
            }}>
              © 2025 Printiqo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}