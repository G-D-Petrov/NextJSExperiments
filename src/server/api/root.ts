import { createTRPCRouter } from "~/server/api/trpc";
import { profileRouter } from "~/server/api/routers/profile";
import { postsRouter } from "./routers/posts";
import { dataRouter } from "./routers/data";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  profile: profileRouter,
  posts: postsRouter,
  data: dataRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
