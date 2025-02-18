import { t } from "~/server/api/trpc";
import { postRouter } from "./post";

export const appRouter = t.router({
  post: postRouter,
});

export type AppRouter = typeof appRouter;
