import { initTRPC, TRPCError } from "@trpc/server"
import type { inferAsyncReturnType } from "@trpc/server"
import SuperJSON from "superjson"
import { prisma } from "~/server/db"
import { validateSession } from "~/lib/auth"

export const createTRPCContext = async ({ req }: { req: { headers: Headers | { get: (name: string) => string | null } } }) => {
  // Extrair token de autenticação do cookie
  let cookieHeader: string | null = null;

  if (req.headers instanceof Headers) {
    cookieHeader = req.headers.get('cookie');
  } else if (req.headers && typeof req.headers.get === 'function') {
    cookieHeader = req.headers.get('cookie');
  }

  const sessionToken = cookieHeader?.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1];

  let session = null;
  if (sessionToken) {
    session = await validateSession(sessionToken);
  }

  return {
    db: prisma,
    session
  }
}

type Context = inferAsyncReturnType<typeof createTRPCContext>

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

// Middleware de autenticação
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

