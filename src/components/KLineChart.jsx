// src/components/KLineChart.jsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const KLineChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    if (data.length === 0) {
      chart.clear();
      return;
    }

    // Prepare data for KLine chart
    const ohlc = data.map(item => [
      new Date(item.time * 1000).toLocaleString(), // formatted time
      item.openPrice,
      item.highestPrice,
      item.lowestPrice,
      item.closePrice,
    ]);

    const option = {
      backgroundColor: '#1e1e2c', // Matching container background
      title: {
        text: 'K-Line Chart',
        left: 'center',
        textStyle: {
          color: '#ffffff',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
      },
      xAxis: {
        type: 'category',
        data: ohlc.map(item => item[0]),
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          color: '#ffffff',
          formatter: function (value) {
            return value.split(' ')[1]; // Show only time
          },
        },
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['#1e1e2c', '#141e2c'],
          },
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#444444',
          },
        },
        axisLabel: {
          color: '#ffffff',
        },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 50,
          end: 100,
          backgroundColor: '#2c3e50',
          dataBackground: {
            lineStyle: {
              color: '#bbb',
            },
          },
          fillerColor: '#f0a70a',
          handleColor: '#ffffff',
        },
      ],
      series: [
        {
          name: 'K-Line',
          type: 'candlestick',
          data: ohlc,
          itemStyle: {
            color: '#ec0000', // Down color
            color0: '#00da3c', // Up color
            borderColor: '#8A0000', // Down border
            borderColor0: '#008F28', // Up border
          },
          tooltip: {
            formatter: function (param) {
              const item = param[0];
              return `
                ${item.name}<br/>
                Open: ${item.data[1]}<br/>
                High: ${item.data[2]}<br/>
                Low: ${item.data[3]}<br/>
                Close: ${item.data[4]}
              `;
            },
          },
        },
      ],
    };

    chart.setOption(option);

    // Cleanup on unmount
    return () => {
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default KLineChart;