import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await auth();
  const userId = authData?.userId;

  if (!userId) {
    redirect("/");
  }

  const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

  try {
    // 🔹 Chama `clerkClient` para obter o usuário
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user?.primaryEmailAddress?.emailAddress;

    if (email !== ALLOWED_EMAIL) {
      redirect("/");
    }
  } catch (error) {
    redirect("/");
  }

  return <>{children}</>;
}
