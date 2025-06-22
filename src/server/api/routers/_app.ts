import { createTRPCRouter } from "~/server/api/trpc"
import { postRouter } from "./post"
import { commentRouter } from "./comment"

export const appRouter = createTRPCRouter({
  post: postRouter,
  comment: commentRouter,
})

export type AppRouter = typeof appRouter

