"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { fetchArticleById, fetchCategories, updateArticle, Category } from "@/services/api";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

export default function EditArticlePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "EDITOR" && user.role !== "ADMIN"))) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchArticleById(id)
      .then(article => {
        setTitle(article.title);
        setSummary(article.summary || "");
        setContent(article.content || "");
        setCategoryId(article.category?.id || "");
        setLoadingArticle(false);
      })
      .catch(() => {
        setError("Article introuvable");
        setLoadingArticle(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!categoryId) throw new Error("Veuillez sélectionner une catégorie");
      await updateArticle(id, { title, summary, content, category: { id: Number(categoryId) } as Category });
      router.replace("/editor/articles");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification de l'article");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || loadingArticle) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;
  if (user.role !== "EDITOR" && user.role !== "ADMIN") return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <main className="w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/editor/articles')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-500" />
            <h1 className="text-2xl font-extrabold text-blue-700">Modifier l'article</h1>
          </div>
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
            {submitting ? "Modification..." : "Enregistrer les modifications"}
          </Button>
        </form>
      </main>
    </div>
  );
} 