import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs";

export const userAPI = createTRPCRouter({
	getUser: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const { id } = input;
			const user = await clerkClient.users.getUser(id);
			return user;
		}),
});
