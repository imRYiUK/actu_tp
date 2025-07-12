import { soapLogin, soapRegister, soapLogout, soapGetCurrentUser } from "@/services/soapApi";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface AuthResponse {
  token: string;
  user: {
    username: string;
    role: "VISITOR" | "EDITOR" | "ADMIN";
  };
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const result = await soapLogin(username, password);
  // Ensure role is typed correctly
  const auth: AuthResponse = {
    token: result.token,
    user: {
      username: result.user.username,
      role: result.user.role as "VISITOR" | "EDITOR" | "ADMIN"
    }
  };
  saveAuth(auth);
  return auth;
}

export async function logout() {
  await soapLogout();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem("token", auth.token);
  localStorage.setItem("user", JSON.stringify(auth.user));
}

export async function getCurrentUser() {
  // Try to get from SOAP endpoint (if token exists)
  const token = getToken();
  if (token) {
    try {
      const user = await soapGetCurrentUser();
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        return user;
      }
    } catch {}
  }
  // Fallback to localStorage
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  if (!user || user === "undefined" || user === "null") return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function register(username: string, password: string, email: string) {
  const result = await soapRegister(username, email, password);
  if (!result.success) throw new Error(result.message || "Erreur d'inscription");
  return result;
} 