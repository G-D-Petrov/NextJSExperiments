/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Post } from "@prisma/client";
import { PrismaClient } from '@prisma/client';
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";    

const prisma = new PrismaClient();

const fetchStockData = async (ticker: string, startTime: string, endTime: string) => {
    console.log("Fetching stock data");
    console.log(ticker, startTime, endTime);
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${apiKey}&outputsize=full`;
    console.log(url);
    try {
      const response = await fetch(url);
      const responseData = await response.json();
      const data = responseData['Time Series (Daily)'];

      const filteredData = Object.entries(data)
        .filter(([date]) => date >= startTime && date <= endTime)
        .map(([date, values]) => ({ date, ...values }));
      console.log(filteredData);
      return filteredData;
    } catch (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error fetching stock data' });
    }
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

export const dataRouter = createTRPCRouter({
    getStockData: publicProcedure.input(z.object({
        ticker: z.string().nonempty(),
        start: z.string().nonempty(),
        end: z.string().nonempty(),
    })).query(async ({ input }) => {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const existingData = await prisma.stockData.findMany({
          where: {
            ticker: input.ticker,
            date: {
              gte: new Date(input.start),
              lte: new Date(input.end),
            },
          },
          orderBy: {
            date: 'desc',
          },
        });

        if (existingData && existingData.length > 0) {
            console.log(`Found data for ${input.ticker} in Prisma DB`);
            console.log(existingData);
            return existingData.map((item) => ({
                date: item.date.toISOString(),
                open: item.open.toString(),
                high: item.high.toString(),
                low: item.low.toString(),
                close: item.close.toString(),
            }));
          }

        console.log("Data Router: ");
        console.log(input.ticker);
        console.log(input.start);
        console.log(input.end);

        const data = await fetchStockData(input.ticker, input.start, input.end);

        await prisma.$transaction(
            Object.keys(data).map((stockData) => {
                return prisma.stockData.create({
                data: {
                    ticker: input.ticker,
                    date: new Date(stockData['date']),
                    open: parseFloat(stockData['1. open']),
                    high: parseFloat(stockData['2. high']),
                    low: parseFloat(stockData['3. low']),
                    close: parseFloat(stockData['4. close']),
                },
                });
            })
        );

        return data;
    }),
});
