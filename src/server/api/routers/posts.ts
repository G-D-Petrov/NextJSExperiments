import { clerkClient } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";    
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const addUserDataToPosts = async (posts: Post[]) => {
    const users = (await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
    })).map(filterUserForClient);

    console.log(users);

    return posts.map((post) => ({
            post,
            author: users.find((user) => user.id === post.authorId)!,
        }));
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */ 
  prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query( async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
        take: 100,
        orderBy: [{ createdAt: "desc" }],
    });

    console.log(posts);
    
    return addUserDataToPosts(posts);
    }),
    getPostByUserId: publicProcedure.input(z.object({
        userId: z.string().min(1).max(50),
    })).query(async ({ ctx, input }) => ctx.prisma.post.findMany({
        where: {
            authorId: input.userId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
    }).then(addUserDataToPosts)
    ),
    create: privateProcedure.input(z.object({
        content: z.string().min(1).max(50),
    })).mutation(async ({ ctx, input }) => {
        const authorId = ctx.userId;

        const { success } = await ratelimit.limit(authorId);

        if (!success) {
            throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: "You have reached the limit of 3 posts per minute",
            });
        }

        const post = await ctx.prisma.post.create({
            data: {
                authorId,
                content: input.content,
            },
        });

        return post;
    }),
});
