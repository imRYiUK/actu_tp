"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile, User } from "@/services/soapApi";
import { Button } from "@/components/ui/button";
import { UserCircle2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditorProfilePage() {
  const { user: contextUser, loading } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState<{ username: string; email: string; password: string; confirmPassword: string }>({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && (!contextUser || (contextUser.role !== "EDITOR" && contextUser.role !== "ADMIN"))) {
      router.replace("/login");
    }
  }, [contextUser, loading, router]);

  useEffect(() => {
    if (contextUser && (contextUser.role === "EDITOR" || contextUser.role === "ADMIN")) {
      loadProfile();
    }
  }, [contextUser]);

  const loadProfile = async () => {
    try {
      const userProfile = await getProfile();
      setProfile(userProfile);
      setForm({
        username: userProfile.username,
        email: userProfile.email,
        password: "",
        confirmPassword: ""
      });
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      if (form.password && form.password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      const updateData: { username: string; email: string; password?: string } = {
        username: form.username,
        email: form.email
      };

      if (form.password) {
        updateData.password = form.password;
      }

      const updatedProfile = await updateProfile(updateData);
      setProfile(updatedProfile);
      setSuccess("Profil mis à jour avec succès");
      
      // Clear password fields
      setForm(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification du profil");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingProfile || !contextUser) {
    return <div className="max-w-2xl mx-auto py-8 px-4">Chargement...</div>;
  }

  if (contextUser.role !== "EDITOR" && contextUser.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-white py-8 px-2 flex items-center justify-center">
      <main className="w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <Link href="/editor/articles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <UserCircle2 className="w-7 h-7 text-blue-500" />
            <h1 className="text-2xl font-extrabold text-blue-700">Mon Profil</h1>
          </div>
        </div>

        {profile && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <UserCircle2 className="w-8 h-8 text-blue-500" />
              <div>
                <h2 className="text-lg font-semibold text-blue-800">{profile.username}</h2>
                <p className="text-sm text-blue-600">{profile.email}</p>
              </div>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full font-semibold ${
                profile.role === "ADMIN" ? "bg-blue-500 text-white" : 
                profile.role === "EDITOR" ? "bg-green-200 text-green-800" : 
                "bg-gray-200 text-gray-600"
              }`}>
                {profile.role}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={form.username}
              onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
              required
              placeholder="Nom d'utilisateur"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Nouveau mot de passe (optionnel)</label>
            <input
              type="password"
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Laisser vide pour ne pas changer"
              minLength={6}
            />
          </div>

          {form.password && (
            <div>
              <label className="block mb-1 font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.confirmPassword}
                onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirmer le mot de passe"
                minLength={6}
              />
            </div>
          )}

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg border border-green-200">{success}</div>}

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 text-base font-semibold" 
            disabled={submitting}
          >
            <Save className="w-5 h-5" />
            {submitting ? "Mise à jour..." : "Mettre à jour le profil"}
          </Button>
        </form>
      </main>
    </div>
  );
} 