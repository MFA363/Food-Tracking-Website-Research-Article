import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { loginUser } from "@/lib/firebase";

export default function Login() {
  const { t } = useLanguage();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError(t("errorRequired")); return; }
    setLoading(true);
    try {
      const profile = await loginUser(email, password);
      setUser(profile);
      navigate(profile.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errorLogin"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{ background: "var(--primary)" }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-lg bg-white/20">N</div>
          <span className="font-display font-bold text-2xl text-white">NutriSiji</span>
        </Link>
        <div>
          <blockquote className="text-white/90 text-xl font-display font-semibold leading-relaxed mb-4">
            "Makanan yang kamu konsumsi setiap hari membentuk siapa dirimu. Pantau dengan bijak."
          </blockquote>
          <p className="text-white/60 text-sm">— NutriSiji, untuk hidup lebih sehat</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[["40+", "Jenis Makanan"], ["12", "Nutrisi Dipantau"], ["5", "Bahasa"]].map(([val, lbl]) => (
            <div key={lbl} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="font-display font-black text-2xl text-white">{val}</p>
              <p className="text-white/70 text-xs mt-1">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>N</div>
            <span className="font-display font-bold text-xl" style={{ color: "var(--foreground)" }}>NutriSiji</span>
          </Link>

          <h1 className="font-display font-black text-3xl mb-2" style={{ color: "var(--foreground)" }}>{t("loginTitle")}</h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>{t("loginSubtitle")}</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm border" style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("password")}</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {loading ? t("loading") : t("loginBtn")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            {t("noAccount")}{" "}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              {t("registerBtn")}
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 p-4 rounded-xl border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>Mode Demo:</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Admin: <strong>admin@nutrisiji.id</strong> / <strong>admin123</strong></p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Atau daftar akun baru sebagai pengguna</p>
          </div>
        </div>
      </div>
    </div>
  );
}
