import "./globals.css";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserProvider, useUser } from "@/context/UserContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Actu | Site d'actualité",
  description: "Site d'actualité moderne avec gestion des rôles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={cn("bg-gray-50 min-h-screen font-sans")}> 
        <UserProvider>
          <Navbar />
          <div>{children}</div>
        </UserProvider>
      </body>
    </html>
  );
}
