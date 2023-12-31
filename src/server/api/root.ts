import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { tweetAPI } from "./routers/tweet";
import { userAPI } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	example: exampleRouter,
	tweet: tweetAPI,
	user: userAPI,
});

// export type definition of API
export type AppRouter = typeof appRouter;
