import { clerkClient } from "@clerk/nextjs";
import type { Tweet, TweetContent, TweetLike } from "@prisma/client";
import { z } from "zod";
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from "~/server/api/trpc";

export type TweetData = Tweet & {
	content: TweetContent | null;
	_count: {
		likes: number;
		children: number;
	};
};

export const tweetAPI = createTRPCRouter({
	getTweetsInfinite: publicProcedure
		.input(
			z.object({
				limit: z.number().min(0).max(100),
				cursor: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, cursor } = input;
			const items: TweetData[] = await ctx.prisma.tweet.findMany({
				take: limit + 1,
				where: { time: { lt: new Date(cursor || 0) } },
				include: {
					content: true,
					_count: { select: { likes: true, children: true } },
				},
				orderBy: { time: "desc" },
			});
			return items;
		}),

	toggleLike: protectedProcedure
		.input(z.object({ user: z.string(), tweet: z.string() }))
		.mutation(({ ctx, input }) =>
			ctx.prisma.$transaction(async (tx) => {
				const old = await tx.tweetLike.count({
					where: { user: input.user, tweetId: input.tweet },
				});

				if (old) {
					await tx.tweetLike.deleteMany({
						where: { user: input.user, tweetId: input.tweet },
					});
					return false;
				}

				await tx.tweetLike.create({
					data: { user: input.user, tweetId: input.tweet },
				});
				return true;
			})
		),

	likeState: protectedProcedure
		.input(z.object({ user: z.string(), tweet: z.string() }))
		.query(({ ctx, input }) =>
			ctx.prisma.tweetLike.count({
				where: { user: input.user, tweetId: input.tweet },
			})
		),

	newPost: protectedProcedure
		.input(z.object({ content: z.string().nonempty(), user: z.string() }))
		.mutation(({ ctx, input }) => {
			return ctx.prisma.$transaction(async (tx) => {
				const tweet = await tx.tweet.create({
					data: {
						user: input.user,
					},
				});

				const tweetId = tweet.id;

				const content = await tx.tweetContent.create({
					data: {
						content: input.content,
						tweetId: tweetId,
					},
				});
				return [tweet, content];
			});
		}),
});
