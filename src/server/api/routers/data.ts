import { clerkClient } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";    
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import yahooFinance from 'yahoo-finance';

const fetchStockData = async (symbol: string, startTime: string, endTime: string, interval: string) => {
    console.log("Fetching stock data");
    console.log(symbol, startTime, endTime, interval);
    // const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY_EXTENDED&symbol=${symbol}&interval=${interval}&slice=year1month1&apikey=59ZIVJ6UZ8GYJ1YO`;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=59ZIVJ6UZ8GYJ1YO`;
    console.log(url);
    const response = await fetch(url);
    console.log(response);
    const data = await response.json();
    const dailyData = data['Time Series (Daily)'];
    const formattedData = [];
  
    for (const date in dailyData) {
      const timestamp = new Date(date).getTime();
  
    //   if (timestamp >= new Date(startTime).getTime() && timestamp <= new Date(endTime).getTime()) {
        formattedData.push({
          date: timestamp,
          open: parseFloat(dailyData[date]['1. open']),
          high: parseFloat(dailyData[date]['2. high']),
          low: parseFloat(dailyData[date]['3. low']),
          close: parseFloat(dailyData[date]['4. close']),
          volume: parseInt(dailyData[date]['6. volume'], 10),
        });
    //   }
    }

    console.log(formattedData);

    return formattedData;
  };

export async function getStockData(ticker: string, start: string, end: string, interval: string) {
  const historicalOptions = {
    symbol: ticker,
    from: start,
    to: end,
    period: interval.toUpperCase() === '1D' ? 'd' : interval,
  };

  const historicalData = await yahooFinance.historical(historicalOptions);
  const prices = historicalData.map((row: any) => ({
    date: new Date(row.date).getTime() / 1000,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    adjClose: row.adjClose,
    volume: row.volume,
  }));

  return {prices};
}
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
        interval: z.string().nonempty(),
    })).query(async ({ input }) => {


        console.log("Data Router: ");
        console.log(input.ticker);
        console.log(input.start);
        console.log(input.end);
        console.log(input.interval);

        const data = await fetchStockData(input.ticker, input.start, input.end, input.interval);

        return data;
    }),
});
