import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // 🔹 Evita que o middleware rode em arquivos estáticos
    "/admin(.*)", // 🔹 Middleware roda para todas as páginas dentro de /admin
    "/api(.*)", // 🔹 Middleware roda para todas as rotas API
  ],
};
