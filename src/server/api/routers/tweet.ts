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
	avatar?: string;
};

export const tweetAPI = createTRPCRouter({
	getTweets: publicProcedure
		.input(z.object({ user: z.string().default("").optional() }))
		.query(async ({ ctx, input }) => {
			const tweets: TweetData[] = await ctx.prisma.tweet.findMany({
				include: {
					content: true,
					_count: {
						select: {
							likes: true,
							children: true,
						},
					},
				},
				take: 100,
				orderBy: {
					time: "desc",
				},
			});
			for (const item of tweets) {
				const user = await clerkClient.users.getUser(item.user);
				item.user = user.username || "";
				item.avatar = user.imageUrl;
			}
			return tweets;
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
		.input(z.object({ content: z.string(), user: z.string() }))
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
