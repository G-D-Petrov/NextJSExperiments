import { useState, useEffect, useRef } from 'react';

import { api } from '~/utils/api';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { LoadingPage } from '~/components/loading';
import { Chat } from '~/components/Chat';

const ChartView = (props: {
        ticker: string,
        start: string,
        end: string,
    }) => {
        const [stockData, setStockData] = useState([]);
        const [ticker, setTicker] = useState(props.ticker);
        const [startDate, setStartDate] = useState(props.start);
        const [endDate, setEndDate] = useState(props.end);
        const chartRef = useRef<HTMLDivElement>(null);
        const chartInstance = useRef<any>(null);
        const seriesInstance = useRef<any>(null);

        const { data, error, isLoading, refetch } = api.data.getStockData.useQuery({
                ticker: props.ticker,
                start: props.start,
                end: props.end,
        });


        const handleSubmit = () => {
            refetch();
        };


        // Initialize the chart
        useEffect(() => {
            if (!chartRef.current || chartInstance.current) return;

            const chart = createChart(chartRef.current, {
            width: chartRef.current.clientWidth,
            height: 300,
            layout: {
                backgroundColor: '#000',
                textColor: 'rgba(255, 255, 255, 0.9)',
            },
            grid: {
                vertLines: {
                color: 'rgba(255, 255, 255, 0.1)',
                },
                horzLines: {
                color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            });

            const series = chart.addCandlestickSeries({
            upColor: 'rgba(0, 255, 0, 0.5)',
            downColor: 'rgba(255, 0, 0, 0.5)',
            borderVisible: false,
            wickVisible: true,
            borderColor: '#000',
            wickColor: 'rgba(255, 255, 255, 0.3)',
            borderUpColor: 'rgba(0, 255, 0, 0.5)',
            borderDownColor: 'rgba(255, 0, 0, 0.5)',
            wickUpColor: 'rgba(0, 255, 0, 0.5)',
            wickDownColor: 'rgba(255, 0, 0, 0.5)',
            });

            chartInstance.current = chart;
            seriesInstance.current = series;
        }, [chartRef]);

        // Update the chart with fetched data
        useEffect(() => {
            console.log('data', data);
            if (!data || !seriesInstance.current) return;

            const chartData = data.map((item) => ({
                time: new Date(item.date).getTime(), // Convert the date string to a timestamp
                open: Number(item['1. open']),
            high: Number(item['2. high']),
            low: Number(item['3. low']),
            close: Number(item['4. close']),
            }));
            // Sort chartData by time in ascending order
            chartData.sort((a, b) => a.time - b.time);
            console.log('chartData', chartData);
            seriesInstance.current.setData(chartData);
        }, [data]);

        try {
            return (
                <div className="flex flex-col text-black">
                    {isLoading && <LoadingPage />}
                    
                    {!isLoading && <div>
                    <div ref={chartRef} style={{ width: '100%', height: 300, border:"2px solid red" }}></div>

                    </div>}
                </div>
            );

        } catch (error) {
            console.error('Error fetching data:', error.message);
        }

        
  
        return (
        <div className="flex flex-col">
            Waiting for data...
        </div>
        );
  };

const Chart: NextPage = () => { 

    const [ticker, setTicker] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [interval, setInterval] = useState('1d');
    const messages: ChatMessage[] = [
        {
          content: "Can be verified on any platform using docker",
          isSentByCurrentUser: false,
        },
        {
          content:
            "Your error message says permission denied, npm global installs must be given root privileges.",
          isSentByCurrentUser: true,
        },
        {
          content: "Command was run with root privileges. I'm sure about that.",
          isSentByCurrentUser: false,
        },
        {
          content: "I've updated the description so it's more obvious now.",
          isSentByCurrentUser: false,
        },
        {
          content: "FYI https://askubuntu.com/a/700266/510172",
          isSentByCurrentUser: false,
        },
        {
          content: "Check the line above (it ends with a # so, I'm running it as root )\n# npm install -g @vue/devtools",
          isSentByCurrentUser: false,
        },
      ];    
    
    return (
        <div>
            <h1>Stock Data Visualization</h1>
            <div className='text-black'>
                <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="Ticker"
                />
                <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="Start date"
                />
                <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    placeholder="End date"
                />
            </div>
            <Chat messages={messages} />

                {ticker && start && end && (
                        <ChartView ticker={ticker} start={start} end={end} />
                    )}
        </div>
    );
}

export default Chart;