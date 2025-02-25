import { initTRPC } from "@trpc/server"
import type { inferAsyncReturnType } from "@trpc/server"
import SuperJSON from "superjson"
import { prisma } from "~/server/db"

export const createTRPCContext = async ({ _headers }: { _headers: Headers }) => {
  console.log("DATABASE_URL:", process.env.DATABASE_URL)
  return { prisma }
}

type Context = inferAsyncReturnType<typeof createTRPCContext>

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

