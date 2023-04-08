import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByUserId: publicProcedure.input(z.object({
    userId: z.string().min(1).max(50),
  })).query(async ({ input }) => {
    const [user] = await clerkClient.users.getUserList({
      userId: [input.userId],
      limit: 1,
    });

    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User not found",
      });
    }

    return filterUserForClient(user);
  }),
});
