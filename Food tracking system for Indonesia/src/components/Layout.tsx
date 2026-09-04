import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/translations";
import { FIREBASE_CONFIGURED } from "@/lib/firebase";
import type { Language } from "@/lib/types";

const NAV_ICON = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  diary: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  nutrition: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  history: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  admin: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, lang, setLang, isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { to: "/dashboard", label: t("dashboard"), icon: NAV_ICON.dashboard },
    { to: "/diary", label: t("diary"), icon: NAV_ICON.diary },
    { to: "/nutrition", label: t("nutrition"), icon: NAV_ICON.nutrition },
    { to: "/history", label: t("history"), icon: NAV_ICON.history },
    { to: "/profile", label: t("profile"), icon: NAV_ICON.profile },
    ...(user?.role === "admin" ? [{ to: "/admin", label: t("admin"), icon: NAV_ICON.admin }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Demo mode banner */}
      {!FIREBASE_CONFIGURED && (
        <div className="text-center py-1.5 text-xs font-medium" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
          {t("demoMode")} · {t("demoModeNote")}
        </div>
      )}

      {/* Top navbar */}
      <nav className="sticky top-0 z-40 border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                N
              </div>
              <span className="font-display font-bold text-lg tracking-tight hidden sm:block" style={{ color: "var(--foreground)" }}>
                {t("appName")}
              </span>
            </Link>

            {/* Desktop nav */}
            <div className={`hidden md:flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  style={
                    isActive(link.to)
                      ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                      : { color: "var(--muted-foreground)" }
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-all"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span className="hidden sm:block uppercase text-xs font-bold">{lang}</span>
                </button>
                {langOpen && (
                  <div
                    className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-1 w-52 rounded-xl shadow-lg border overflow-hidden z-50`}
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code as Language); setLangOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted transition-all ${lang === l.code ? "font-semibold" : ""}`}
                        style={{ color: lang === l.code ? "var(--primary)" : "var(--foreground)" }}
                      >
                        <span>{l.nativeLabel}</span>
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User menu */}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--muted)" }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{user.name.split(" ")[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-all"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {t("logout")}
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-all"
                style={{ color: "var(--foreground)" }}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: "var(--border)" }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.to) ? "" : "hover:bg-muted"}`}
                style={
                  isActive(link.to)
                    ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                    : { color: "var(--foreground)" }
                }
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-6" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            © 2025 NutriSiji · Dibuat untuk Pekalongan, Jawa Tengah, Indonesia
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Data gizi berdasarkan TKPI 2017 · Nilai bersifat estimasi
          </p>
        </div>
      </footer>

      {/* Click-outside to close lang menu */}
      {langOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
      )}
    </div>
  );
}
