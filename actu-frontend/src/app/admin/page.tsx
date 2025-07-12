"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { fetchUsers, createUser, updateUser, deleteUser, fetchTokens, generateToken, deleteToken, User, Token, reactivateToken, revokeToken } from "@/services/soapApi";
import { Button } from "@/components/ui/button";
import { UserCircle2, KeyRound, PlusCircle, Edit2, Trash2, ShieldCheck, UserCog, UserPlus } from "lucide-react";
import { Dialog, DialogTitle, DialogClose } from "@/components/ui/Dialog";

export default function AdminDashboard() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [form, setForm] = useState<{ id?: number; username: string; email: string; password: string; role: string }>({ username: "", email: "", password: "", role: "VISITOR" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'tokens'>('users');

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadUsers = () => fetchUsers().then(setUsers);
  const loadTokens = () => fetchTokens().then(setTokens);

  useEffect(() => {
    loadUsers();
    loadTokens();
  }, []);

  const openAddDialog = () => {
    setEditingId(null);
    setForm({ username: "", email: "", password: "", role: "VISITOR" });
    setDialogOpen(true);
  };
  const openEditDialog = (u: User) => {
    setEditingId(u.id);
    setForm({ id: u.id, username: u.username, email: u.email, password: "", role: u.role });
    setDialogOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!form.username || !form.email || (!editingId && !form.password)) throw new Error("Tous les champs sont requis");
      if (editingId) {
        await updateUser(editingId, { ...form });
      } else {
        await createUser(form);
      }
      setForm({ username: "", email: "", password: "", role: "VISITOR" });
      setEditingId(null);
      setDialogOpen(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement de l'utilisateur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleTokenGenerate = async (userId: number) => {
    try {
      await generateToken(userId);
      loadTokens();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la génération du jeton");
    }
  };

  const handleTokenDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce jeton ?")) return;
    try {
      await deleteToken(id);
      loadTokens();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression du jeton");
    }
  };

  if (loading || !user) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;
  if (user.role !== "ADMIN") return null;

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-white py-8 px-2 flex items-center justify-center">
      <main className="w-full max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3 mb-10">
          <ShieldCheck className="w-8 h-8 text-blue-500" /> Administration
        </h1>
        {/* Tabs */}
        <div className="flex mb-10 border-b border-blue-100">
          <button
            className={`px-6 py-2 text-lg font-semibold focus:outline-none transition border-b-2 ${activeTab === 'users' ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-400 hover:text-blue-500'}`}
            onClick={() => setActiveTab('users')}
            type="button"
          >
            Utilisateurs
          </button>
          <button
            className={`px-6 py-2 text-lg font-semibold focus:outline-none transition border-b-2 ${activeTab === 'tokens' ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-400 hover:text-blue-500'}`}
            onClick={() => setActiveTab('tokens')}
            type="button"
          >
            Jetons d'authentification
          </button>
        </div>
        {/* Users Tab */}
        {activeTab === 'users' && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
                <UserCog className="w-6 h-6 text-blue-400" /> Utilisateurs
              </h2>
              <Button onClick={openAddDialog} className="flex items-center gap-2 text-base font-semibold">
                <UserPlus className="w-5 h-5" /> Ajouter
              </Button>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTitle className="text-xl font-bold mb-4">{editingId ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
              <form onSubmit={handleUserSubmit} className="space-y-5">
                <div className="flex flex-col gap-4">
                  <input type="text" placeholder="Nom d'utilisateur" className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                  <input type="email" placeholder="Email" className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  <input type="password" placeholder="Mot de passe" className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editingId} />
                  <select className="border border-blue-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
                    <option value="VISITOR">VISITOR</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full flex items-center justify-center gap-2 text-base font-semibold" disabled={submitting}>
                    <PlusCircle className="w-5 h-5" /> {submitting ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 text-base font-semibold" onClick={() => { setEditingId(null); setForm({ username: "", email: "", password: "", role: "VISITOR" }); }}>
                      Annuler
                    </Button>
                  </DialogClose>
                </div>
              </form>
            </Dialog>
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <UserCircle2 className="w-16 h-16 mb-4 text-blue-200" />
                <div className="text-lg font-medium">Aucun utilisateur pour le moment</div>
                <div className="text-sm mt-2">Ajoute un utilisateur pour commencer.</div>
              </div>
            ) : (
              <ul className="space-y-4">
                {users.map(u => (
                  <li key={u.id} className="rounded-xl border border-blue-100 bg-blue-50/50 shadow-sm hover:shadow-md p-5 flex justify-between items-center transition">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <UserCircle2 className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-lg text-blue-800">{u.username}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "ADMIN" ? "bg-blue-500 text-white" : u.role === "EDITOR" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}>{u.role}</span>
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openEditDialog(u)} className="flex items-center gap-1">
                        <Edit2 className="w-4 h-4" /> Modifier
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(u.id)} className="flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </Button>
                      <Button variant="secondary" onClick={() => handleTokenGenerate(u.id)} className="flex items-center gap-1">
                        <KeyRound className="w-4 h-4" /> Générer jeton
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700 mb-4">
              <KeyRound className="w-6 h-6 text-blue-400" /> Jetons d'authentification
            </h2>
            {tokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <KeyRound className="w-16 h-16 mb-4 text-blue-200" />
                <div className="text-lg font-medium">Aucun jeton pour le moment</div>
                <div className="text-sm mt-2">Génère un jeton pour un utilisateur.</div>
              </div>
            ) : (
              <ul className="space-y-4">
                {tokens.map(t => {
                  const isExpired = new Date(t.expiresAt) < new Date();
                  const isRevoked = t.revoked;
                  const isValid = !isRevoked && !isExpired;
                  const user = users.find(u => u.id === t.userId);
                  return (
                    <li key={t.id} className={`rounded-xl border bg-white shadow-sm hover:shadow-md p-5 flex justify-between items-center transition ${isValid ? 'border-blue-100' : 'border-red-200 opacity-70'}`}>
                      <div>
                        <div className="font-mono text-sm text-blue-700 break-all">{t.value}</div>
                        <div className="text-xs text-gray-400">
                          Utilisateur: {user?.username || `ID: ${t.userId}`} | Expire: {new Date(t.expiresAt).toLocaleString()}<br/>
                          <span className={`font-semibold ${isValid ? 'text-green-600' : 'text-red-500'}`}>{isValid ? 'Valide' : isRevoked ? 'Révoqué' : 'Expiré'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isValid && isRevoked && (
                          <Button variant="secondary" onClick={async () => { await reactivateToken(t.id); loadTokens(); }} className="flex items-center gap-1">
                            Réactiver
                          </Button>
                        )}
                        <Button variant="destructive" onClick={() => handleTokenDelete(t.id)} className="flex items-center gap-1">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </Button>
                        {!isRevoked && (
                          <Button variant="outline" onClick={async () => { await revokeToken(t.id); loadTokens(); }} className="flex items-center gap-1">
                            Révoquer
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
} 