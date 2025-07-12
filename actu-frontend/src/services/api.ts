const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Article {
  id: number;
  title: string;
  summary?: string;
  content?: string;
  createdAt: string;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface PageData<T> {
  content: T[];
  totalPages: number;
  number: number;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchArticles(page = 0, size = 10): Promise<PageData<Article>> {
  const res = await fetch(`${API_BASE}/articles?page=${page}&size=${size}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des articles");
  return res.json();
}

export async function fetchArticleById(id: string | number): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${id}`);
  if (!res.ok) throw new Error("Article introuvable");
  return res.json();
}

export async function fetchArticlesGroupedByCategory(): Promise<Record<string, Article[]>> {
  const res = await fetch(`${API_BASE}/articles/grouped-by-category`);
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
  return res.json();
}

export async function createArticle(article: { title: string; summary?: string; content: string; category: { id: number } }): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(article),
  });
  if (!res.ok) throw new Error("Erreur lors de la création de l'article");
  return res.json();
}

export async function updateArticle(id: string | number, article: Partial<Article>): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(article),
  });
  if (!res.ok) throw new Error("Erreur lors de la modification de l'article");
  return res.json();
}

export async function deleteArticle(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression de l'article");
}

export async function createCategory(category: { name: string; description?: string }): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error("Erreur lors de la création de la catégorie");
  return res.json();
}

export async function updateCategory(id: number, category: { name: string; description?: string }): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error("Erreur lors de la modification de la catégorie");
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression de la catégorie");
} 