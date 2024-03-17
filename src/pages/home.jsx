import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import saile from "../Data/ESH24-CME.scid_BarData.json"
function Home() {
    const chartitems = useRef();
    const [finalDate, setFinalDate] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minLow, setMinLow] = useState(null);
    const [maxHigh, setMaxHigh] = useState(null);
    const [chartInstance, setChartInstance] = useState(null);
    const [candleCharts , setCandleChart] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
             
              const st = JSON.parse(JSON.stringify(saile));
                
                formatData(st);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const formatData = (responsData) => {
            const sortedData = responsData.map((item) => ({
                ...item,
                time: new Date(item.date).getTime() + new Date(item.time).getTime(),
                close: item.last
            }));

            setFinalDate(sortedData);
            setLoading(false);
        };

        fetchData();

        return () => {
        };
    }, []);

    useEffect(() => {
      if (!loading) {
          const chartOptions = {
              layout: { textColor: 'black', background: { type: 'solid', color: 'white' } },
              width: chartitems.current.clientWidth,
              height: 500
          };
  
          const chart = createChart(chartitems.current, chartOptions);
          setChartInstance(chart);
          const candlestickSeries = chart.addCandlestickSeries({ upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
          setCandleChart(candlestickSeries)
  
          candlestickSeries.setData(finalDate);
  
          const initialVisibleRange = chart.timeScale().getVisibleRange();

          const initialVisibleData = finalDate.filter(item => item.time >= initialVisibleRange.from && item.time <= initialVisibleRange.to);
          const initialLows = initialVisibleData.map(item => item.low);
          const initialHighs = initialVisibleData.map(item => item.high);
          setMinLow(Math.min(...initialLows));
          setMaxHigh(Math.max(...initialHighs));
          
          
  
          chart.timeScale().fitContent();
  
          const updateMinMaxValues = () => {
              const currentVisibleRange = chart.timeScale().getVisibleRange();
              const currentVisibleData = finalDate.filter(item => item.time >= currentVisibleRange.from && item.time <= currentVisibleRange.to);
              const currentLows = currentVisibleData.map(item => item.low);
              const currentHighs = currentVisibleData.map(item => item.high);
              setMinLow(Math.min(...currentLows));
              setMaxHigh(Math.max(...currentHighs));
          };
  
          const intervalId = setInterval(updateMinMaxValues, 10);
  
          return () => {
              clearInterval(intervalId);
              chart.remove();
          };
      }
  }, [finalDate, loading]);

  useEffect(() => {
    if (loading === false &&  chartInstance && minLow !== null && maxHigh !== null ) {
        const lowLineSeries = chartInstance.addLineSeries({ color: 'blue', lineWidth: 2 });
        const highLineSeries = chartInstance.addLineSeries({ color: 'red', lineWidth: 2 });
        
        lowLineSeries.setData([{ time: finalDate[0].time, value: minLow }, { time: finalDate[finalDate.length - 1].time, value: minLow }]);
        highLineSeries.setData([{ time: finalDate[0].time, value: maxHigh }, { time: finalDate[finalDate.length - 1].time, value: maxHigh }]);
        
        let minLowIndex = 0;
        let maxHighIndex = 0;
        let minLowValue = finalDate[0].low;
        let maxHighValue = finalDate[0].high;
        
        for (let i = 1; i < finalDate.length; i++) {
            if (finalDate[i].low < minLowValue) {
                minLowIndex = i;
                minLowValue = finalDate[i].low;
            }
        
            if (finalDate[i].high > maxHighValue) {
                maxHighIndex = i;
                maxHighValue = finalDate[i].high;
            }
        }
        
      if(minLowIndex !==-1 && maxHighIndex !==-1 ){
    

        candleCharts?.setMarkers([{
           price: minLow,
           time: finalDate[Math.min(minLowIndex)].time ,
           shape: 'arrowDown',
           color: 'red',
           text: 'Lowest low',
           position:'belowBar',
           textMargin: 5,
           fontSize: 12,
       },
       {
         price: maxHigh,
         time: finalDate[Math.max(maxHighIndex)].time,
         shape: 'arrowUp',
         color: 'green',
         text: 'Highest high',
         textMargin: 5,
         fontSize: 12,
         position:'belowBar'
     }]);
      
     
    }
        return () => {
            chartInstance.removeSeries(lowLineSeries);
            chartInstance.removeSeries(highLineSeries);
            
        };
    }
}, [finalDate, minLow, maxHigh, chartInstance , candleCharts]);


  
  

  

    return (
        <>
            <div id='container' ref={chartitems}></div>
        </>
    );
}

export default Home;
