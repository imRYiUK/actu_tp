"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchArticlesGroupedByCategory, Article } from "@/services/api";
import { decodeCategoryName } from "@/utils/urlUtils";

export default function CategoryDetailPage() {
  const params = useParams();
  const { category } = params as { category: string };
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryExists, setCategoryExists] = useState<boolean>(true);

  useEffect(() => {
    if (!category) return;
    
    // Décoder le nom de la catégorie depuis l'URL
    const decodedCategory = decodeCategoryName(category);
    setCategoryName(decodedCategory);
    
    fetchArticlesGroupedByCategory()
      .then((data) => {
        // Vérifier si la catégorie existe
        if (!data[decodedCategory]) {
          setCategoryExists(false);
          setLoading(false);
          return;
        }
        
        // Chercher la catégorie décodée dans les données
        const categoryArticles = data[decodedCategory] || [];
        setArticles(categoryArticles);
        setCategoryExists(true);
        setLoading(false);
      })
      .catch(() => {
        setCategoryExists(false);
        setLoading(false);
      });
  }, [category]);

  if (loading) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;

  if (!categoryExists) {
    return (
      <main className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Catégorie introuvable</h1>
        <div className="text-gray-500 mb-4">
          La catégorie "{categoryName}" n'existe pas ou a été supprimée.
        </div>
        <Link href="/categories" className="text-blue-600 hover:underline">
          ← Retour aux catégories
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Articles dans "{categoryName}"</h1>
      {articles.length === 0 ? (
        <div className="text-gray-500">Aucun article trouvé dans cette catégorie.</div>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.id} className="border rounded-lg p-4 bg-white">
              <Link href={`/articles/${article.id}`} className="text-blue-600 hover:underline text-lg font-semibold">
                {article.title}
              </Link>
              <p className="text-gray-700 mt-1">{article.summary || article.content || "Pas de résumé."}</p>
              <div className="text-xs text-gray-400 mt-1">
                Publié le {new Date(article.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
} 