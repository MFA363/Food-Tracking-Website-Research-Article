import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getAllUsers, getAllLogs } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import { FOOD_DATABASE } from "@/lib/foodDatabase";
import type { UserProfile, FoodLogEntry } from "@/lib/types";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllLogs()])
      .then(([u, l]) => { setUsers(u); setLogs(l); })
      .finally(() => setLoading(false));
  }, []);

  // Recent logs (last 10)
  const recentLogs = [...logs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)).slice(0, 10);

  // Stats
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((l) => l.date === today);
  const activeUsers = new Set(todayLogs.map((l) => l.userId)).size;

  const stats = [
    { label: t("totalUsers"), value: users.length, icon: "👥", color: "var(--primary)" },
    { label: t("totalLogs"), value: logs.length, icon: "📋", color: "var(--accent)" },
    { label: "Pengguna Aktif Hari Ini", value: activeUsers, icon: "✅", color: "#3B82F6" },
    { label: "Database Makanan", value: FOOD_DATABASE.length, icon: "🥗", color: "#8B5CF6" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
                  <p className="font-display font-black text-3xl" style={{ color: stat.color }}>{loading ? "..." : stat.value}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent user registrations */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b font-display font-bold" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              Pengguna Terbaru
            </div>
            {loading ? (
              <div className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mx-auto" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} /></div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {users.slice(0, 5).map((u) => (
                  <div key={u.uid} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{u.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{u.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b font-display font-bold" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              {t("recentActivity")}
            </div>
            {loading ? (
              <div className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mx-auto" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} /></div>
            ) : recentLogs.length === 0 ? (
              <p className="px-5 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>Belum ada aktivitas.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {recentLogs.map((log) => {
                  const u = users.find((u) => u.uid === log.userId);
                  return (
                    <div key={log.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{log.foodName}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{u?.name || "User"} · {log.date} · {log.weightGrams}g</p>
                      </div>
                      <span className="font-mono text-xs font-semibold" style={{ color: "var(--primary)" }}>{Math.round(log.nutrients.energy)} kkal</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
