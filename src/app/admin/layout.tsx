import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await auth();
  const userId = authData?.userId;

  console.log("🔍 Autenticação no Layout:", authData);

  if (!userId) {
    console.log("❌ Usuário não autenticado! Redirecionando para login...");
    redirect("/sign-in");
  }

  const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

  try {
    // 🔹 Chama `clerkClient` para obter o usuário
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user?.primaryEmailAddress?.emailAddress;

    console.log("✅ Email do Usuário:", email);
    console.log("✅ Email Permitido:", ALLOWED_EMAIL);

    if (email !== ALLOWED_EMAIL) {
      console.log("❌ Email não autorizado! Redirecionando...");
      redirect("/");
    }
  } catch (error) {
    console.error("❌ Erro ao buscar usuário no Clerk:", error);
    redirect("/sign-in");
  }

  return <>{children}</>;
}
