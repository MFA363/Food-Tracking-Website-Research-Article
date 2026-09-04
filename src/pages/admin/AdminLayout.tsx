import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ADMIN_LINKS = [
  { to: "/admin", label: "adminDashboard", icon: "📊", exact: true },
  { to: "/admin/users", label: "adminUsers", icon: "👥", exact: false },
  { to: "/admin/foods", label: "adminFoods", icon: "🥗", exact: false },
  { to: "/admin/logs", label: "adminLogs", icon: "📋", exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #065f46 100%)", borderColor: "transparent" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <div>
          <p className="text-white font-display font-black text-lg">{t("adminTitle")}</p>
          <p className="text-white/60 text-xs">Panel Manajemen NutriSiji</p>
        </div>
      </div>

      {/* Admin nav tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "var(--muted)" }}>
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              isActive(link.to, link.exact)
                ? { background: "var(--card)", color: "var(--primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }
                : { color: "var(--muted-foreground)" }
            }
          >
            <span>{link.icon}</span>
            <span>{t(link.label as any)}</span>
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
