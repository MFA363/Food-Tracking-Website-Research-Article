import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { registerUser } from "@/lib/firebase";

export default function Register() {
  const { lang } = useLanguage(); const { setUser } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!email || !password || !confirmPassword) return setError("Email dan kata sandi wajib diisi.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Masukkan alamat email yang valid.");
    if (password.length < 6) return setError("Kata sandi minimal 6 karakter.");
    if (password !== confirmPassword) return setError("Konfirmasi kata sandi tidak sesuai.");
    setLoading(true);
    try {
      const profile = await registerUser(email, password, { email, name: email.split("@")[0], role: "user", height: 0, weight: 0, age: 0, gender: "male", job: "", activityLevel: "moderate", language: lang });
      setUser(profile); navigate("/dashboard");
    } catch (err) { setError(err instanceof Error ? err.message : "Akun tidak dapat dibuat. Silakan coba lagi."); } finally { setLoading(false); }
  };
  const field = "w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2";
  const style = { background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" };
  return <main className="min-h-screen grid lg:grid-cols-2" style={{ background: "var(--background)" }}>
    <section className="hidden lg:flex flex-col justify-between p-12" style={{ background: "var(--primary)", color: "white" }}>
      <Link to="/" className="font-display text-2xl font-bold">CalNut</Link><div><p className="text-sm uppercase tracking-[0.2em] text-white/70">Platform Praktik Gizi</p><h1 className="mt-4 max-w-md font-display text-4xl font-black leading-tight">Data pangan Indonesia untuk pembelajaran dan layanan gizi yang lebih terstruktur.</h1></div><p className="text-sm text-white/70">Lengkapi profil profesional Anda setelah masuk untuk menyesuaikan perhitungan.</p>
    </section>
    <section className="flex items-center justify-center px-5 py-12"><div className="w-full max-w-md">
      <Link to="/" className="font-display text-xl font-bold lg:hidden" style={{ color: "var(--primary)" }}>CalNut</Link><h1 className="mt-8 font-display text-3xl font-black" style={{ color: "var(--foreground)" }}>Buat akun</h1><p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Gunakan email institusional atau pribadi Anda. Detail profil dapat dilengkapi dari dasbor.</p>
      {error && <p className="mt-5 rounded-lg border px-4 py-3 text-sm" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}>{error}</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>Email<input className={`${field} mt-2`} style={style} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>Kata sandi<input className={`${field} mt-2`} style={style} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>Konfirmasi kata sandi<input className={`${field} mt-2`} style={style} type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        <button className="w-full rounded-lg py-3 font-display font-bold disabled:opacity-50" style={{ background: "var(--primary)", color: "white" }} disabled={loading}>{loading ? "Membuat akun…" : "Buat akun"}</button>
      </form><p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Sudah memiliki akun? <Link to="/login" className="font-semibold" style={{ color: "var(--primary)" }}>Masuk</Link></p>
    </div></section>
  </main>;
}
