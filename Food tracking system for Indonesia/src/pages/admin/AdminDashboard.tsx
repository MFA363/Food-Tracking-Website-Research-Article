import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getAllUsers, getAllLogs, getCustomFoods } from "@/lib/firebase";
import { loadTkpiFoods } from "@/lib/tkpiDatabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { localDate } from "@/lib/workspace";
import Icon, { type IconName } from "@/components/Icon";
import type { UserProfile, FoodLogEntry, Food } from "@/lib/types";

export default function AdminDashboard() {
  const { lang } = useLanguage(); const tx = (en: string, id: string) => lang === "id" ? id : en;
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [logs, setLogs] = useState<FoodLogEntry[] | null>(null);
  const [customFoods, setCustomFoods] = useState<Food[] | null>(null);
  const [importedFoods, setImportedFoods] = useState<Food[] | null>(null);
  const [loading, setLoading] = useState(true); const [failed, setFailed] = useState<string[]>([]); const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setFailed([]);
    Promise.allSettled([getAllUsers(), getAllLogs(), getCustomFoods(), loadTkpiFoods()]).then(([u, l, c, i]) => {
      if (!active) return;
      setUsers(u.status === "fulfilled" ? u.value : null); setLogs(l.status === "fulfilled" ? l.value : null);
      setCustomFoods(c.status === "fulfilled" ? c.value : null); setImportedFoods(i.status === "fulfilled" ? i.value : null);
      setFailed([u.status === "rejected" ? "users" : "", l.status === "rejected" ? "intake records" : "", c.status === "rejected" ? "custom foods" : "", i.status === "rejected" ? "imported foods" : ""].filter(Boolean)); setLoading(false);
    });
    return () => { active = false; };
  }, [revision]);
  const today = localDate(); const todayLogs = logs?.filter((entry) => entry.date === today);
  const metrics: { label: string; value: number | undefined; foot: string; icon: IconName }[] = [
    { label: tx("Registered profiles", "Profil terdaftar"), value: users?.length, foot: tx("All roles combined", "Semua peran"), icon: "users" },
    { label: tx("Food entries", "Catatan pangan"), value: logs?.length, foot: tx("All recorded dates", "Semua tanggal tercatat"), icon: "diary" },
    { label: tx("Active loggers today", "Pencatat aktif hari ini"), value: todayLogs ? new Set(todayLogs.map((entry) => entry.userId)).size : undefined, foot: today, icon: "activity" },
    { label: tx("Custom foods", "Pangan tambahan"), value: customFoods?.length, foot: tx("Administrator-managed catalogue", "Katalog kelolaan administrator"), icon: "food" },
  ];
  const week = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = localDate(date); return { date: key, label: date.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { weekday: "short" }), count: logs?.filter((entry) => entry.date === key).length || 0 }; });
  const maximum = Math.max(...week.map((day) => day.count), 1);
  const recentUsers = users ? [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5) : [];
  const recentLogs = logs ? [...logs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)).slice(0, 5) : [];
  return <AdminLayout>
    {failed.length > 0 && <div className="notice error-notice" role="alert"><span>{tx("Could not load", "Tidak dapat memuat")}: {failed.join(", ")}. {tx("Unavailable metrics are not shown as zero.", "Metrik tidak tersedia tidak ditampilkan sebagai nol.")}</span><button className="btn-secondary" disabled={loading} onClick={() => setRevision((value) => value + 1)}><Icon name="refresh" size={16} />{tx("Retry", "Coba lagi")}</button></div>}
    <div className="stat-grid">{metrics.map((metric, index) => <div className={`stat-card ${index === 0 ? "highlight" : ""}`} key={metric.label}><div className="stat-top"><span>{metric.label}</span><span className="stat-icon"><Icon name={metric.icon} size={17} /></span></div><strong>{loading ? "…" : metric.value === undefined ? "—" : metric.value.toLocaleString()}</strong><span className="stat-foot">{metric.foot}</span></div>)}</div>
    <div className="admin-split"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">{tx("PLATFORM ACTIVITY", "AKTIVITAS PLATFORM")}</p><h2>{tx("Food entries · last 7 days", "Catatan pangan · 7 hari terakhir")}</h2></div><button className="icon-button" disabled={loading} aria-label={tx("Refresh overview", "Segarkan ringkasan")} onClick={() => setRevision((value) => value + 1)}><Icon name="refresh" size={17} /></button></div>{loading || !logs ? <p role="status" className="muted">{loading ? tx("Loading activity…", "Memuat aktivitas…") : tx("Activity data is unavailable.", "Data aktivitas tidak tersedia.")}</p> : <div className="weekly-bars" aria-label={tx("Daily entry counts", "Jumlah catatan harian")}>{week.map((day) => <div className="week-column" key={day.date} aria-label={`${day.date}: ${day.count}`}><span>{day.count}</span><div><span className="bar" style={{ height: `${day.count / maximum * 100}%` }} /></div><span>{day.label}</span></div>)}</div>}<Link className="btn-text" style={{ display: "inline-block", marginTop: 20 }} to="/admin/logs">{tx("Review intake records", "Tinjau catatan asupan")} →</Link></section>
    <section className="panel"><p className="eyebrow">{tx("FOOD DATA OVERSIGHT", "PENGAWASAN DATA PANGAN")}</p><h2>{tx("Screened import catalogue", "Katalog impor tersaring")}</h2><div className="data-count"><strong>{loading ? "…" : importedFoods?.length.toLocaleString() ?? "—"}</strong><span>{tx("unique selectable foods", "pangan unik yang dapat dipilih")}</span></div><p className="muted">{tx("Basic plausibility checks and duplicate screening are applied. Passing these checks is not source verification.", "Pemeriksaan kewajaran dasar dan duplikasi diterapkan. Lolos pemeriksaan bukan berarti data telah terverifikasi terhadap sumber.")}</p><div className="planner-actions"><Link className="btn-secondary" to="/admin/foods">{tx("Manage catalogue", "Kelola katalog")}</Link><Link className="btn-text" to="/references">{tx("Review data limitations", "Tinjau batasan data")}</Link></div></section></div>
    <div className="admin-split"><section className="panel"><div className="panel-heading"><h2>{tx("Recent registrations", "Pendaftaran terbaru")}</h2><Link className="btn-text" to="/admin/users">{tx("All users", "Semua pengguna")} →</Link></div>{loading ? <p className="muted">{tx("Loading…", "Memuat…")}</p> : !users ? <p className="muted">{tx("User data is unavailable.", "Data pengguna tidak tersedia.")}</p> : recentUsers.length === 0 ? <p className="muted">{tx("No user profiles found.", "Belum ada profil pengguna.")}</p> : recentUsers.map((user) => <div className="admin-row" key={user.uid}><span className="avatar">{(user.name || "U").slice(0, 1)}</span><div><strong>{user.name}</strong><small>{user.email}</small></div><span className="pill">{user.role}</span></div>)}</section>
    <section className="panel"><div className="panel-heading"><h2>{tx("Latest intake records", "Catatan asupan terbaru")}</h2><Icon name="activity" size={18} /></div>{loading ? <p className="muted">{tx("Loading…", "Memuat…")}</p> : !logs ? <p className="muted">{tx("Records are unavailable.", "Catatan tidak tersedia.")}</p> : recentLogs.length === 0 ? <p className="muted">{tx("No intake records yet.", "Belum ada catatan asupan.")}</p> : recentLogs.map((entry) => <div className="admin-row" key={entry.id}><span className="avatar"><Icon name="food" size={16} /></span><div><strong>{entry.foodName}</strong><small>{entry.date} · {entry.weightGrams} g</small></div><span>{Math.round(entry.nutrients.energy)} kcal</span></div>)}</section></div>
  </AdminLayout>;
}
