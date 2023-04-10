import React, { useRef, useEffect } from 'react';

interface CandleData {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  data: CandleData[];
}

function drawCandle(ctx: CanvasRenderingContext2D, candle: CandleData, x: number, y: number, width: number, height: number) {
const gain = candle.close >= candle.open;

// Set the color based on whether the candle represents a gain or a loss
ctx.fillStyle = gain ? 'green' : 'red';

// Draw the candle body
ctx.fillRect(x, y, width, height);

// Draw the wick (shadow) using the same color as the candle body
ctx.beginPath();
ctx.moveTo(x + width / 2, y + height);
ctx.lineTo(x + width / 2, y - (candle.high - Math.max(candle.open, candle.close)));
ctx.moveTo(x + width / 2, y);
ctx.lineTo(x + width / 2, y + (Math.min(candle.open, candle.close) - candle.low));
ctx.stroke();
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Set the chart dimensions and padding
    const chartWidth = ctx.canvas.width;
    const chartHeight = ctx.canvas.height;
    const paddingLeft = 50;
    const paddingRight = 50;

    // Calculate the candle width and spacing
    const candleWidth = (chartWidth - paddingLeft - paddingRight) / data.length;
    const candleSpacing = candleWidth * 0.2;
    console.log('data:', data);

    // Loop through the data and draw the candles
    data.forEach((candle, index) => {
        const x = paddingLeft + index * candleWidth;
        const y = chartHeight - candle.high;
        const candleHeight = candle.high - candle.low;
        const bodyHeight = Math.abs(candle.open - candle.close);

        // Draw the wick
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, y);
        ctx.lineTo(x + candleWidth / 2, y + candleHeight);
        ctx.stroke();

        // Set the fill color based on whether the candle is bullish or bearish
        ctx.fillStyle = candle.close >= candle.open ? 'green' : 'red';
        // Draw the candle body
        ctx.fillRect(
            x + candleSpacing / 2,
            y + (candle.high - Math.max(candle.open, candle.close)),
            candleWidth - candleSpacing,
            bodyHeight,
        );

        // drawCandle(ctx, candle, x + candleSpacing / 2, y + (candle.high - Math.max(candle.open, candle.close)), candleWidth - candleSpacing, bodyHeight);

        console.log(`Candle[${index}]: x=${x}, y=${y}, width=${candleWidth}, height=${candleHeight}`);

    });


  }, [data]);

  return <canvas className='block' ref={canvasRef} width={800} height={400} />;
};

export default CandlestickChart;
