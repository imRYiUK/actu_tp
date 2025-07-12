"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchArticleById } from "@/services/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, FolderKanban, ArrowLeft, Edit2 } from "lucide-react";

export default function ReviewArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchArticleById(id)
      .then(setArticle)
      .catch(() => setError("Article introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;
  if (error || !article) return <div className="max-w-2xl mx-auto py-8 px-4 text-red-500">{error || "Article introuvable"}</div>;

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-white py-8 px-2 flex items-center justify-center">
      <main className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/editor/articles"><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/editor/edit/${article.id}`}><Edit2 className="w-4 h-4 mr-1" /> Modifier</Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-blue-800 line-clamp-2">{article.title}</h1>
        </div>
        <div className="flex items-center gap-2 mb-4">
          {article.category && (
            <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              <FolderKanban className="w-3 h-3" /> {article.category.name}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">{new Date(article.createdAt).toLocaleString()}</span>
        </div>
        {article.summary && (
          <div className="mb-4 text-gray-600 italic border-l-4 border-blue-200 pl-4">{article.summary}</div>
        )}
        <div className="prose prose-blue max-w-none text-gray-800">
          {article.content}
        </div>
      </main>
    </div>
  );
} 