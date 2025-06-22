import { cookies } from "next/headers";
import { validateSession } from "~/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticação
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  
  if (!sessionToken) {
    redirect("/auth/login?redirect=/admin");
  }

  try {
    const user = await validateSession(sessionToken);
    
    if (!user ?? user.role !== 'ADMIN') {
      redirect("/");
    }
  } catch {
    redirect("/auth/login?redirect=/admin");
  }

  return <>{children}</>;
}
