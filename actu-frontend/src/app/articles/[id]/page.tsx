"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchArticleById, Article } from "@/services/api";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchArticleById(id)
      .then((data: Article) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;
  if (!article) return <div className="max-w-2xl mx-auto py-8 px-4">Article introuvable.</div>;

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">&larr; Retour</Button>
        <h1 className="text-3xl font-bold mb-4 text-blue-800">{article.title}</h1>
        <div className="flex items-center gap-2 mb-2">
          {article.category && (
            <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {article.category.name}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">Publié le {new Date(article.createdAt).toLocaleString()}</span>
        </div>
        {article.summary && (
          <div className="mb-4 text-gray-600 italic border-l-4 border-blue-200 pl-4">{article.summary}</div>
        )}
        <div className="prose prose-neutral max-w-none text-gray-800">
          {article.content || <span className="italic text-gray-500">Pas de contenu.</span>}
        </div>
      </div>
    </main>
  );
} 