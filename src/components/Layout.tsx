import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/translations";
import type { Language } from "@/lib/types";
import Icon, { type IconName } from "./Icon";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation(); const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const admin = location.pathname.startsWith("/admin");
  const tx = (en: string, id: string) => lang === "id" ? id : en;
  const links: { to: string; label: string; icon: IconName }[] = admin ? [
    { to: "/admin", label: tx("Overview", "Ringkasan"), icon: "grid" },
    { to: "/admin/users", label: tx("User management", "Kelola pengguna"), icon: "users" },
    { to: "/admin/foods", label: tx("Food catalogue", "Katalog pangan"), icon: "food" },
    { to: "/admin/logs", label: tx("Intake records", "Catatan asupan"), icon: "activity" },
  ] : [
    { to: "/dashboard", label: tx("Overview", "Ringkasan"), icon: "grid" },
    { to: "/diary", label: tx("Food diary", "Catatan pangan"), icon: "diary" },
    { to: "/nutrition", label: tx("Nutrition analysis", "Analisis gizi"), icon: "chart" },
    { to: "/case-workspace", label: tx("Case workspace", "Ruang kasus"), icon: "lab" },
    { to: "/history", label: tx("Intake history", "Riwayat asupan"), icon: "activity" },
  ];
  async function handleLogout() {
    setSigningOut(true); setError("");
    try { await logout(); navigate("/login"); } catch { setError(tx("Unable to sign out. Try again.", "Tidak dapat keluar. Coba lagi.")); }
    finally { setSigningOut(false); }
  }
  const currentTitle = links.find((link) => link.to === location.pathname)?.label || t("profile");
  function navItems() {
    return links.map((link) => <NavLink end key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `workspace-nav-link ${isActive ? "is-active" : ""}`}><Icon name={link.icon} /><span>{link.label}</span></NavLink>);
  }
  return <div className={`workspace-shell ${admin ? "admin-workspace" : "user-workspace"}`}>
    <a href="#workspace-content" className="skip-link">Skip to content</a>
    <aside className="workspace-sidebar">
      <Link className="brand" to={admin ? "/admin" : "/dashboard"}><span className="brand-mark">C<span>+</span></span><span>CalNut<small>{admin ? tx("ADMINISTRATION", "ADMINISTRASI") : tx("NUTRITION WORKSPACE", "RUANG KERJA GIZI")}</small></span></Link>
      <p className="sidebar-label">{admin ? tx("MANAGEMENT", "MANAJEMEN") : tx("WORKSPACE", "RUANG KERJA")}</p>
      <nav aria-label={tx("Main navigation", "Navigasi utama")}>{navItems()}</nav>
      <div className="sidebar-resources"><p className="sidebar-label">{tx("RESOURCES", "REFERENSI")}</p><Link className="workspace-nav-link" to="/references"><Icon name="book" />{tx("Sources & methods", "Sumber & metode")}</Link><NavLink className="workspace-nav-link" to="/profile"><Icon name="settings" />{tx("Your profile", "Profil Anda")}</NavLink>{user?.role === "admin" && <Link className="workspace-nav-link" to={admin ? "/dashboard" : "/admin"}><Icon name="shield" />{admin ? tx("Personal workspace", "Ruang pribadi") : tx("Administration", "Administrasi")}</Link>}</div>
      <div className="sidebar-note"><span className="color-dot" />{tx("Evidence-informed planning", "Perencanaan berbasis referensi")}<small>{tx("Transparent methods. Thoughtful practice.", "Metode transparan untuk praktik gizi.")}</small></div>
      <div className="sidebar-person"><span className="avatar">{(user?.name || "C").slice(0, 1).toUpperCase()}</span><div><strong>{user?.name || "CalNut"}</strong><small>{admin ? tx("Administrator", "Administrator") : user?.job || tx("Personal account", "Akun pribadi")}</small></div><button aria-label={t("logout")} className="icon-button" disabled={signingOut} onClick={handleLogout}><Icon name="logout" size={18} /></button></div>
    </aside>
    <div className="workspace-body">
      <header className="workspace-topbar"><div className="topbar-breadcrumb"><Link className="mobile-brand" to={admin ? "/admin" : "/dashboard"}>CalNut<span>+</span></Link><span className="desktop-breadcrumb">{admin ? tx("Administration", "Administrasi") : tx("Workspace", "Ruang kerja")} <span>/</span> <strong>{currentTitle}</strong></span></div><div className="topbar-actions"><label className="sr-only" htmlFor="workspace-language">{tx("Interface language", "Bahasa antarmuka")}</label><select id="workspace-language" value={lang} onChange={(event) => setLang(event.target.value as Language)}>{LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.nativeLabel}</option>)}</select><Link className="topbar-profile" aria-label={tx("Your profile", "Profil Anda")} to="/profile">{(user?.name || "C").slice(0, 1).toUpperCase()}</Link><button className="mobile-menu-button icon-button" aria-label={menuOpen ? tx("Close navigation", "Tutup navigasi") : tx("Open navigation", "Buka navigasi")} aria-expanded={menuOpen} aria-controls="mobile-workspace-menu" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button></div></header>
      {menuOpen && <nav id="mobile-workspace-menu" className="mobile-workspace-menu" aria-label={tx("Mobile navigation", "Navigasi seluler")}>{navItems()}<Link className="workspace-nav-link" to="/profile" onClick={() => setMenuOpen(false)}><Icon name="settings" />{tx("Your profile", "Profil Anda")}</Link><Link className="workspace-nav-link" to="/references"><Icon name="book" />{tx("Sources & methods", "Sumber & metode")}</Link>{user?.role === "admin" && <Link className="workspace-nav-link" to={admin ? "/dashboard" : "/admin"} onClick={() => setMenuOpen(false)}><Icon name="shield" />{admin ? tx("Personal workspace", "Ruang pribadi") : tx("Administration", "Administrasi")}</Link>}<button className="workspace-nav-link" disabled={signingOut} onClick={handleLogout}><Icon name="logout" />{t("logout")}</button></nav>}
      <main id="workspace-content" className="workspace-content" tabIndex={-1}>{error && <p role="alert" className="notice error-notice">{error}</p>}{children}</main>
      <footer className="workspace-footer"><span>© {new Date().getFullYear()} CalNut</span><Link to="/references">{tx("Estimates & data quality · Sources", "Estimasi & mutu data · Sumber")}</Link></footer>
    </div>
    <nav className="mobile-bottom-nav" aria-label={tx("Quick navigation", "Navigasi cepat")}>{links.slice(0, 4).map((link) => <NavLink end key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "is-active" : ""}><Icon name={link.icon} size={19} /><span>{link.label}</span></NavLink>)}</nav>
  </div>;
}
