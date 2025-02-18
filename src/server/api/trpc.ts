// src/server/api/trpc.ts
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { prisma } from "~/server/db"; // Importa o Prisma

const t = initTRPC.context().create({
  transformer: SuperJSON,
});

export { t };
export const publicProcedure = t.procedure;
export const router = t.router;
export const middleware = t.middleware;

export const createTRPCContext = async ({ headers }: { headers: Headers }) => {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  return { prisma };  // Incluímos o prisma no contexto
};
