import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '~/server/api/routers/_app';  // O roteador raiz

export const handler = createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});

export { handler as GET, handler as POST };
