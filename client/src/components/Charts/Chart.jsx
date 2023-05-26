/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { PureComponent } from 'react';
import './Chart.scss';
import moment from 'moment';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import userContext from '../../context/userContext';
import { Radio } from 'antd';

function Chart() {
  const { socket } = useContext(userContext);
  const [chartData, setChartData] = useState();
  const [maxValue, setMaxValue] = useState();
  const [filter, setFilter] = useState(1);
  useEffect(() => {
    const datapointsHandler = (data) => {
      console.log(data);
      if (!data) {
        return [];
      }
      const newdata = data?.chart_data?.data_points;
      const transformData = Object.keys(newdata).map((key) => {
        const profit =
          newdata[key].grandTotalAmount - newdata[key].grandActualWinAmount;
        let data_point = {
          name: key,
          grandTotalAmount: newdata[key].grandTotalAmount,
          grandActualWinAmount: newdata[key].grandActualWinAmount,
          profit: profit <= 0 ? 0 : profit,
          //   pieData: newdata[key].
        };
        return data_point;
      });
      console.log(transformData);
      setChartData(transformData.reverse());
    };

    socket.emit('chartData', { days: filter }, datapointsHandler);

    socket.on('chartData', (data) => console.log(data));

    return () => {
      socket.off('chartData', (data) => console.log(data));
    };
  }, [filter]);

  useEffect(() => {
    setMaxValue(
      Math.max(
        ...(chartData ?? [].map((item) => item?.grandActualWinAmount)),
        ...(chartData ?? [].map((item) => item.grandTotalAmount)),
        ...(chartData ?? [].map((item) => item.profit)),
      ),
    );
  }, [chartData]);
  return (
    <>
      <div>
        <h6>Filter By:</h6>
        <Radio.Group
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <Radio value={7}>Filter By 7 Days</Radio>
          <Radio value={1}>Filter By Today</Radio>
          <Radio value={30}>Filter By Month</Radio>
        </Radio.Group>
      </div>
      <div style={{ overflow: 'scroll', width: '100%' }}>
        <BarChart
          onClick={(e) => console.log(e)}
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis domain={[0, maxValue]} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey='grandTotalAmount'
            fill='#8884d8'
            name='Bet Amount'
          />
          <Bar
            dataKey='grandActualWinAmount'
            fill='#82ca9d'
            name='Win Amount'
          />
          <Bar
            dataKey='profit'
            fill='#e0198d'
            name='Profit'
          />
        </BarChart>
      </div>
    </>
  );
}

export default Chart;
