import { useState } from 'react';
import * as Highcharts from 'highcharts/highstock';

import HighchartsReact from 'highcharts-react-official';
import { api } from '~/utils/api';
import { NextPage } from 'next';
import CustomCandleChart from '~/components/CustomCandleChart';
import CandlestickChart, { CandleData } from '~/components/CustomCandleChart';

// Highcharts.setOptions({
//     lang: {
//         rangeSelectorZoom: '',
//     },
// });

function createChartOptions(series: Highcharts.SeriesOptionsType[]): Highcharts.Options {
    return {
        rangeSelector: {
            selected: 1,
        },
        title: {
            text: 'Stock Price',
        },
        series,
    };
}

const ChartView = (props: {
        ticker: string,
        start: string,
        end: string,
        interval: string,
    }) => {


        try {
            console.log('Fetching data for backend...');
            console.log('Ticker:', props.ticker);
            console.log('Start:', props.start);
            console.log('End:', props.end);
            console.log('Interval:', props.interval);

            const { data } = api.data.getStockData.useQuery({
                    ticker: props.ticker,
                    start: props.start,
                    end: props.end,
                    interval: props.interval,
            });
            if (!data) return <div>Something went wrong...</div>;

            const ohlcData = data.map((price: any) => [
                price.date * 1000,
                price.open,
                price.high,
                price.low,
                price.close
              ]);

              console.log('ohlcData:', ohlcData);

              const candleDataArray: CandleData[] = ohlcData.map((item) => ({
                date: item[0],
                open: item[1],
                high: item[2],
                low: item[3],
                close: item[4],
                volume: item[5],
              }));
              
              console.log('candleDataArray:', candleDataArray);

              const series: Highcharts.SeriesOptionsType[] = [
                {
                  type: 'candlestick',
                  name: props.ticker,
                  data: ohlcData,
                  tooltip: {
                    valueDecimals: 2,
                  },
                },
              ];

            console.log('ohlcData:', ohlcData);
            console.log('series:', series);
            const input_data = candleDataArray.slice(candleDataArray.length - 10);

            return (
                <div className="flex flex-col">
                    {
                        candleDataArray && <CandlestickChart data={input_data} /> 
                    }
                    <div>
                        <p>For input:</p> 
                        <p>Ticker: {props.ticker}</p>
                        <p>Start: {props.start}</p>
                        <p>End: {props.end}</p>
                        <p>Interval: {props.interval}</p>
                    </div>

                    <div> 
                        <p>Got otuput data</p>
                        <p>ohlcData:</p>
                        {input_data.map((item) => (
                            <div>
                            <p>Date: {item.date}</p>
                            <p>Open: {item.open}</p>
                            <p>High: {item.high}</p>
                            <p>Low: {item.low}</p>
                            <p>Close: {item.close}</p>
                            <p>Volume: {item.volume}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        } catch (error: any) {
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
    const [isReady, setIsReady] = useState(false);
    const [chartProps, setChartProps] = useState<{
        ticker: string,
        start: string,
        end: string,
        interval: string,
        isReady: boolean,
    }>({
        ticker: ticker,
        start: start,
        end: end,
        interval: interval,
        isReady: isReady,
    });

    const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(null);

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
                <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                >
                    <option value="1d">1 Day</option>
                    <option value="1wk">1 Week</option>
                    <option value="1mo">1 Month</option>
                </select>
                <button onClick={() => {
                    console.log('Fetching data...');

                    setIsReady(true);
                    console.log('Chart props:', chartProps);
                }
                } className='bg-gray-400'>Fetch Data</button>
            </div>
                {/* {
                chartOptions && (
                    <HighchartsReact
                        highcharts={Highcharts}
                        constructorType={'stockChart'}
                        options={chartOptions}
                    />
                )} */}

                {ticker && start && end && (
                        <ChartView ticker={ticker} start={start} end={end} interval={interval} />
                    )}
        </div>
    );
}

export default Chart;