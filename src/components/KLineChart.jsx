// src/components/KLineChart.jsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import './KLineChart.css';

const KLineChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    if (data.length === 0) {
      chart.clear();
      return;
    }

    const ohlc = data.map(item => [
      new Date(item.time * 1000).toLocaleString(),
      item.openPrice,
      item.closePrice,
      item.lowestPrice,
      item.highestPrice,
    ]);

    const option = {
      backgroundColor: '#ffffff',
      title: {
        text: 'K-Line Chart',
        left: 'center',
        textStyle: {
          color: '#333333',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      xAxis: {
        type: 'category',
        data: ohlc.map(item => item[0]),
        axisLine: {
          lineStyle: {
            color: '#333333',
          },
        },
        axisLabel: {
          color: '#333333',
        },
      },
      yAxis: {
        scale: true,
        axisLine: {
          lineStyle: {
            color: '#333333',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#e8e8e8',
          },
        },
        axisLabel: {
          color: '#333333',
        },
      },
      series: [
        {
          name: 'K-Line',
          type: 'candlestick',
          data: ohlc.map(item => item.slice(1)),
          itemStyle: {
            color: '#f44336',      
            color0: '#4caf50',      
            borderColor: '#f44336',
            borderColor0: '#4caf50',
          },
        },
      ],
    };

    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="kline-chart" />;
};

export default KLineChart;