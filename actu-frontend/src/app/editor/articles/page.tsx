"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { fetchArticles, Article, PageData, deleteArticle } from "@/services/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, PlusCircle, FolderKanban, Trash2, Edit2 } from "lucide-react";

export default function EditorArticlesPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!loading && (!user || (user.role !== "EDITOR" && user.role !== "ADMIN"))) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.role === "EDITOR" || user.role === "ADMIN")) {
      fetchArticles(page, pageSize)
        .then((data: PageData<Article>) => {
          setArticles(data.content || []);
          setTotalPages(data.totalPages || 1);
        });
    }
  }, [user, page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet article ?")) return;
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression de l'article");
    }
  };

  if (loading || !user) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;
  if (user.role !== "EDITOR" && user.role !== "ADMIN") return null;

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-white py-8 px-2">
      <main className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" /> Gestion des articles
          </h1>
          <Button asChild className="flex items-center gap-2 text-base font-semibold">
            <Link href="/editor/new">
              <PlusCircle className="w-5 h-5" /> Nouvel article
            </Link>
          </Button>
        </div>
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <FileText className="w-16 h-16 mb-4 text-blue-200" />
            <div className="text-lg font-medium">Aucun article pour le moment</div>
            <div className="text-sm mt-2">Clique sur "Nouvel article" pour en créer un.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="rounded-2xl border border-blue-100 bg-white shadow-md hover:shadow-lg p-6 flex flex-col gap-3 transition">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <Link href={`/editor/articles/${article.id}`} className="font-bold text-lg text-blue-800 line-clamp-1 hover:underline hover:text-blue-600 transition">
                    {article.title}
                  </Link>
                </div>
                <div className="text-gray-500 text-sm line-clamp-2 mb-1">{article.summary || "Pas de résumé."}</div>
                <div className="flex items-center gap-2 mb-2">
                  {article.category && (
                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      <FolderKanban className="w-3 h-3" /> {article.category.name}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{new Date(article.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" asChild className="flex items-center gap-1">
                    <Link href={`/editor/edit/${article.id}`}><Edit2 className="w-4 h-4" /> Modifier</Link>
                  </Button>
                  <Button variant="secondary" asChild className="flex items-center gap-1">
                    <Link href={`/editor/articles/${article.id}`}><FileText className="w-4 h-4" /> Voir</Link>
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(article.id)} className="flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Précédent
          </Button>
          <span className="self-center text-sm text-gray-500">
            Page {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
            disabled={page + 1 >= totalPages}
          >
            Suivant
          </Button>
        </div>
      </main>
    </div>
  );
} 