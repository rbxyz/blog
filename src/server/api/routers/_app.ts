import { createTRPCRouter } from "~/server/api/trpc"
import { postRouter } from "./post"
import { commentRouter } from "./comment"
import { newsletterRouter } from "./newsletter"
import { tagRouter } from "./tag"

export const appRouter = createTRPCRouter({
  post: postRouter,
  comment: commentRouter,
  newsletter: newsletterRouter,
  tag: tagRouter,
})

export type AppRouter = typeof appRouter

