"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { fetchCategories, Category, createCategory, updateCategory, deleteCategory } from "@/services/api";
import { Button } from "@/components/ui/button";
import { FolderKanban, PlusCircle, Edit2, Trash2, FolderOpen } from "lucide-react";
import { Dialog, DialogTitle, DialogClose } from "@/components/ui/Dialog";

export default function CategoryManagementPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "EDITOR" && user.role !== "ADMIN"))) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadCategories = () => {
    fetchCategories().then(setCategories);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!name) throw new Error("Le nom est requis");
      if (editingId) {
        await updateCategory(editingId, { name, description });
      } else {
        await createCategory({ name, description });
      }
      setName("");
      setDescription("");
      setEditingId(null);
      loadCategories();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement de la catégorie");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddDialog = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression de la catégorie");
    }
  };

  if (loading || !user) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;
  if (user.role !== "EDITOR" && user.role !== "ADMIN") return null;

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-white py-8 px-2 flex items-center justify-center">
      <main className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-blue-500" /> Gestion des catégories
          </h1>
          <Button onClick={openAddDialog} className="flex items-center gap-2 text-base font-semibold">
            <PlusCircle className="w-5 h-5" /> Ajouter
          </Button>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTitle className="text-xl font-bold mb-4">{editingId ? "Modifier la catégorie" : "Ajouter une catégorie"}</DialogTitle>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            onKeyDown={e => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault(); }}
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Nom de la catégorie"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Description (optionnelle)"
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="flex gap-4">
              <Button type="submit" className="w-full flex items-center justify-center gap-2 text-base font-semibold" disabled={submitting}>
                <PlusCircle className="w-5 h-5" /> {submitting ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2 text-base font-semibold" onClick={() => { setEditingId(null); setName(""); setDescription(""); }}>
                  Annuler
                </Button>
              </DialogClose>
            </div>
          </form>
        </Dialog>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FolderOpen className="w-16 h-16 mb-4 text-blue-200" />
            <div className="text-lg font-medium">Aucune catégorie pour le moment</div>
            <div className="text-sm mt-2">Ajoute une catégorie pour commencer.</div>
          </div>
        ) : (
          <ul className="space-y-4">
            {categories.map(cat => (
              <li key={cat.id} className="rounded-xl border border-blue-100 bg-blue-50/50 shadow-sm hover:shadow-md p-5 flex justify-between items-center transition">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FolderKanban className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-lg text-blue-800">{cat.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{cat.description || <span className="italic text-gray-300">Pas de description.</span>}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openEditDialog(cat)} className="flex items-center gap-1">
                    <Edit2 className="w-4 h-4" /> Modifier
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(cat.id)} className="flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
} 