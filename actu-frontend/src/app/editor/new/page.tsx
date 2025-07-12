"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { createArticle, fetchCategories, Category } from "@/services/api";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

export default function NewArticlePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "EDITOR" && user.role !== "ADMIN"))) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!categoryId) throw new Error("Veuillez sélectionner une catégorie");
      await createArticle({ title, summary, content, category: { id: Number(categoryId) } });
      router.replace("/editor/articles");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'article");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;
  if (user.role !== "EDITOR" && user.role !== "ADMIN") return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <main className="w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <FilePlus2 className="w-12 h-12 text-blue-500 mb-2" />
          <h1 className="text-3xl font-extrabold text-blue-700 mb-1">Nouvel article</h1>
          <p className="text-gray-500 text-sm">Crée un nouvel article pour la plateforme</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Titre</label>
            <input
              type="text"
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Titre de l'article"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Résumé</label>
            <textarea
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={2}
              placeholder="Résumé court de l'article (optionnel)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Description</label>
            <textarea
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              required
              placeholder="Contenu détaillé de l'article"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Catégorie</label>
            <select
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full flex items-center justify-center gap-2 text-base font-semibold" disabled={submitting}>
            {submitting ? "Création..." : "Créer l'article"}
          </Button>
        </form>
      </main>
    </div>
  );
} 