import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getAllUsers, deleteUser, updateUserProfile } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/lib/types";

export default function AdminUsers() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => getAllUsers().then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (uid: string) => {
    if (uid === currentUser?.uid) { alert("Tidak dapat menghapus akun sendiri."); return; }
    await deleteUser(uid);
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
    setConfirmDelete(null);
  };

  const handleToggleRole = async (u: UserProfile) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    setSaving(true);
    await updateUserProfile(u.uid, { role: newRole });
    setUsers((prev) => prev.map((x) => x.uid === u.uid ? { ...x, role: newRole } : x));
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchUsers")}
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Pengguna", "Email", "Tinggi/Berat", "Pekerjaan", "Role", "Bergabung", "Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--muted-foreground)" }}>Memuat...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--muted-foreground)" }}>Tidak ada pengguna ditemukan.</td></tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.uid} className="hover:bg-muted transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: "var(--foreground)" }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{u.email}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--foreground)" }}>{u.height}cm / {u.weight}kg</td>
                      <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{u.job}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleRole(u)}
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ background: u.role === "admin" ? "#FEF3C7" : "#DCFCE7", color: u.role === "admin" ? "#92400E" : "#166534" }}
                          disabled={saving || u.uid === currentUser?.uid}
                        >
                          {u.role}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(u)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                            style={{ color: "#3B82F6" }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          {u.uid !== currentUser?.uid && (
                            <button
                              onClick={() => setConfirmDelete(u.uid)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
                              style={{ color: "#EF4444" }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border shadow-2xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>Detail Pengguna</h3>
                <button onClick={() => setSelected(null)} style={{ color: "var(--muted-foreground)" }}>✕</button>
              </div>
              <div className="p-5 space-y-3 text-sm">
                {[
                  { label: "Nama", value: selected.name },
                  { label: "Email", value: selected.email },
                  { label: "Tinggi", value: `${selected.height} cm` },
                  { label: "Berat", value: `${selected.weight} kg` },
                  { label: "Usia", value: `${selected.age} tahun` },
                  { label: "Jenis Kelamin", value: selected.gender === "male" ? "Laki-laki" : "Perempuan" },
                  { label: "Pekerjaan", value: selected.job },
                  { label: "Aktivitas", value: selected.activityLevel },
                  { label: "Role", value: selected.role },
                  { label: "Bergabung", value: new Date(selected.createdAt).toLocaleDateString("id-ID") },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span style={{ color: "var(--muted-foreground)" }}>{r.label}</span>
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Confirm delete modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-3xl mb-3">⚠️</p>
              <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--foreground)" }}>Hapus Pengguna?</h3>
              <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border font-medium text-sm" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>{t("cancel")}</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#EF4444", color: "white" }}>Hapus</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
