import yahooFinance from 'yahoo-finance';

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

  return { prices };
}