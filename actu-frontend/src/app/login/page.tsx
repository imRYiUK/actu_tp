"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { LogIn, Newspaper } from "lucide-react";

export default function LoginPage() {
  const { login, loading, user } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    router.replace("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <main className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <Newspaper className="w-12 h-12 text-blue-500 mb-2" />
          <h1 className="text-3xl font-extrabold text-blue-700 mb-1">Connexion</h1>
          <p className="text-gray-500 text-sm">Connecte-toi à ton espace Actu</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Entrer votre nom d'utilisateur"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Entrer votre mot de passe"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full flex items-center justify-center gap-2 text-base font-semibold" disabled={loading}>
            <LogIn className="w-5 h-5" />
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </main>
    </div>
  );
} 