import { createTRPCRouter } from "~/server/api/trpc"
import { postRouter } from "./post"
import { commentRouter } from "./comment"
import { newsletterRouter } from "./newsletter"

export const appRouter = createTRPCRouter({
  post: postRouter,
  comment: commentRouter,
  newsletter: newsletterRouter,
})

export type AppRouter = typeof appRouter

