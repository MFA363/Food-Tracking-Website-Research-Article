import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Icon from "@/components/Icon";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { lang } = useLanguage(); const { pathname } = useLocation();
  const idn = lang === "id";
  const title = pathname.endsWith("/users") ? (idn ? "Kelola pengguna" : "User management") : pathname.endsWith("/foods") ? (idn ? "Katalog pangan" : "Food catalogue") : pathname.endsWith("/logs") ? (idn ? "Catatan asupan" : "Intake records") : (idn ? "Ringkasan administrasi" : "Administration overview");
  return <div className="admin-content"><div className="page-heading"><div><p className="eyebrow">CALNUT / {idn ? "ADMINISTRASI" : "ADMINISTRATION"}</p><h1>{title}</h1><p className="muted">{idn ? "Kelola akses, pantau aktivitas, dan tinjau data pangan." : "Manage access, monitor activity, and review food data."}</p></div><span className="pill"><Icon name="shield" size={16} />{idn ? "Ruang administrator" : "Administrator workspace"}</span></div>{children}</div>;
}
