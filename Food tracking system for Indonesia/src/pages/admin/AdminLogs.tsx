import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getAllLogs, getAllUsers, deleteFoodLog } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FoodLogEntry, UserProfile } from "@/lib/types";

export default function AdminLogs() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllLogs(), getAllUsers()])
      .then(([l, u]) => { setLogs(l); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const getUserName = (uid: string) => users.find((u) => u.uid === uid)?.name || uid.slice(0, 8);

  const filtered = logs.filter((l) => {
    const matchSearch = !search || l.foodName.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || l.date === dateFilter;
    const matchUser = !userFilter || l.userId === userFilter;
    return matchSearch && matchDate && matchUser;
  }).sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));

  const handleDelete = async (id: string) => {
    await deleteFoodLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setConfirmDelete(null);
  };

  // Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((l) => l.date === todayStr);
  const totalEnergy = logs.reduce((sum, l) => sum + l.nutrients.energy, 0);

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Log", value: logs.length, color: "var(--primary)" },
            { label: "Log Hari Ini", value: todayLogs.length, color: "var(--accent)" },
            { label: "Total Energi Tercatat", value: `${Math.round(totalEnergy / 1000)}K kkal`, color: "#3B82F6" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
              <p className="font-display font-black text-xl mt-1" style={{ color: s.color }}>{loading ? "..." : s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama makanan..." className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
          </div>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-3 rounded-xl border text-sm" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="px-3 py-3 rounded-xl border text-sm" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}>
            <option value="">Semua Pengguna</option>
            {users.map((u) => <option key={u.uid} value={u.uid}>{u.name}</option>)}
          </select>
          {(search || dateFilter || userFilter) && (
            <button onClick={() => { setSearch(""); setDateFilter(""); setUserFilter(""); }} className="px-3 py-3 rounded-xl border text-sm font-medium" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>Reset</button>
          )}
        </div>

        {/* Logs table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Pengguna", "Makanan", "Tanggal", "Waktu Makan", "Berat", "Energi", "Protein", "Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: "var(--muted-foreground)" }}>Memuat...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center" style={{ color: "var(--muted-foreground)" }}>Tidak ada log ditemukan.</td></tr>
                ) : (
                  filtered.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-muted transition-all">
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                          {getUserName(log.userId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium max-w-[150px] truncate" style={{ color: "var(--foreground)" }}>{log.foodName}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{log.date}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          background: { breakfast: "#FEF3C7", lunch: "#DCFCE7", dinner: "#DBEAFE", snack: "#F3E8FF" }[log.mealType],
                          color: { breakfast: "#92400E", lunch: "#166534", dinner: "#1E40AF", snack: "#6B21A8" }[log.mealType],
                        }}>
                          {t(log.mealType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--foreground)" }}>{log.weightGrams}g</td>
                      <td className="px-4 py-3 font-mono font-bold text-xs" style={{ color: "var(--primary)" }}>{Math.round(log.nutrients.energy)} kkal</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--foreground)" }}>{Math.round(log.nutrients.protein * 10) / 10}g</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setConfirmDelete(log.id)} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: "#EF4444" }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 50 && (
            <div className="px-4 py-3 border-t text-xs text-center" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              Menampilkan 50 dari {filtered.length} log. Gunakan filter untuk mempersempit hasil.
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--foreground)" }}>Hapus Log Ini?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border font-medium text-sm" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>{t("cancel")}</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#EF4444", color: "white" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
