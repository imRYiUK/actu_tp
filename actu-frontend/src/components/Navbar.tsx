"use client";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { LogIn, LogOut, UserPlus, UserCircle2, Newspaper } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useUser();
  return (
    <nav className="bg-white/90 backdrop-blur border-b shadow-md mb-8 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700 hover:text-blue-900 transition">
            <Newspaper className="w-7 h-7 text-blue-500" />
            Actu
          </Link>
          <Link href="/categories" className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded transition font-medium">Catégories</Link>
        </div>
        <div className="flex items-center gap-3">
          {user && user.role ? (
            <>
              <span className="flex items-center gap-1 text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                <UserCircle2 className="w-4 h-4 text-blue-400" />
                {user.username} <span className="ml-1 text-xs text-white bg-blue-500 rounded px-2 py-0.5">{user.role}</span>
              </span>
              {(user.role === "EDITOR" || user.role === "ADMIN") && (
                <>
                  <Link href="/editor/articles" className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded transition font-medium">Articles</Link>
                  <Link href="/editor/categories" className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded transition font-medium">Catégories</Link>
                  <Link href="/editor/profile" className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded transition font-medium">Profil</Link>
                </>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded transition font-medium">Admin</Link>
              )}
              <button
                className="flex items-center gap-1 text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition ml-2 shadow"
                onClick={logout}
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-1 text-sm text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition shadow">
                <LogIn className="w-4 h-4" /> Connexion
              </Link>
              <Link href="/register" className="flex items-center gap-1 text-sm text-blue-500 border border-blue-500 hover:bg-blue-50 px-3 py-1 rounded transition font-medium">
                <UserPlus className="w-4 h-4" /> Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 