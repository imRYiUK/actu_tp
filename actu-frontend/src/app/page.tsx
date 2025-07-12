"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchArticles, Article, PageData } from "@/services/api";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchArticles(page, pageSize)
      .then((data: PageData<Article>) => {
        setArticles(data.content || []);
        setTotalPages(data.totalPages || 1);
      });
  }, [page]);

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Derniers articles</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <div key={article.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <a
              href={`/articles/${article.id}`}
              className="text-xl font-semibold text-blue-600 hover:underline"
            >
              {article.title}
            </a>
            <p className="text-gray-700 mt-2">
              {article.summary || article.description || "Pas de résumé."}
            </p>
            <div className="text-xs text-gray-400 mt-1">
              Publié le {new Date(article.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-8">
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
  );
}
