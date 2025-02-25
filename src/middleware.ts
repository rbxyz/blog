import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // 🔹 Evita que o middleware rode em arquivos estáticos
    ["/admin(.*)", "/api(.*)"]
    ],
};
