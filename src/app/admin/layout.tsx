import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await auth(); // 🔹 Agora `auth()` é aguardado corretamente
  const userId = authData?.userId;
  const email = authData?.sessionClaims?.email as string | undefined;

  if (!userId) {
    redirect("/sign-in");
  }

  const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

  if (email !== ALLOWED_EMAIL) {
    redirect("/");
  }

  return <>{children}</>;
}
