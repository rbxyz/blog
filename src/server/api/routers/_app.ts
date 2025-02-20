import { t } from "~/server/api/trpc";
import { postRouter } from "./post";
import { categoryRouter } from "./categories";

export const appRouter = t.router({
  post: postRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
