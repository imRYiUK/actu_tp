"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchArticlesGroupedByCategory } from "@/services/api";
import { getCategoryUrl } from "@/utils/urlUtils";

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticlesGroupedByCategory()
      .then((data) => {
        setCategories(Object.keys(data).map((name, idx) => ({ id: idx, name })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Catégories</h1>
      <ul className="space-y-4">
        {categories.map((cat) => (
          <li key={cat.name}>
            <Link href={getCategoryUrl(cat.name)} className="text-blue-600 hover:underline text-lg">
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
} 