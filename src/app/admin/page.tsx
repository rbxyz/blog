"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; // 🔹 Importação corrigida

export default function AdminPosts() {
  console.log("🚀 Renderizando AdminPosts...");

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // Aguarda a autenticação carregar completamente

    const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;
    console.log("🔍 Email Permitido:", allowedEmail);
    console.log(
      "✅ Email do Usuário:",
      user?.primaryEmailAddress?.emailAddress,
    );

    // 🔹 Verifica se o usuário não está autenticado ou não tem o email correto
    if (!isSignedIn) {
      console.log("❌ Usuário não autenticado. Redirecionando para login...");
      router.push("/sign-in");
    } else if (user?.primaryEmailAddress?.emailAddress !== allowedEmail) {
      console.log("❌ Email não autorizado. Redirecionando...");
      router.push("/");
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded)
    return <p className="text-center text-gray-500">Carregando...</p>;

  return (
    <div>
      <h1>🚀 Bem-vindo à página de administração!</h1>
    </div>
  );
}
