import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
  ComposedChart,
  Bar,
  Area,
  ReferenceLine,
  Brush,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Radio } from 'antd';

import userContext from '../../context/userContext';

function Chart() {
  const { socket } = useContext(userContext);
  const [chartData, setChartData] = useState([]);
  const [maxValue, setMaxValue] = useState();
  const [filter, setFilter] = useState(1);
  const [color, setColor] = useState(['#0088FE']);
  const [colorAdmin, setColorAdmin] = useState(['#0088FE']);
  const [start, setStart] = useState(0);
  const [forceRender, setForceRender] = useState(false);
  const ref = useRef();

  const datapointsHandler = (data) => {
    if (!data) {
      return [];
    }

    const rawdata = data?.chart_data?.data_points;
    let barchartData = Object.keys(rawdata).map((key) => {
      const profit =
        rawdata[key].grandTotalAmount - rawdata[key].grandActualWinAmount;
      let barchart = {
        name: key,
        grandTotalAmount: rawdata[key].grandTotalAmount,
        grandActualWinAmount: rawdata[key].grandActualWinAmount,
        profit: profit,
      };
      return barchart;
    });

    const combinedAdminData = {};
    const combinedUserData = {};

    Object.keys(rawdata).forEach((key) => {
      let data = rawdata[key].data; // data per data_point
      data.forEach((data) => {
        // pieAdminData
        const admin = data.admin.username;
        if (combinedAdminData[admin]) {
          // If the admin already exists in the combinedAdminData, add the values
          combinedAdminData[admin].total_amount += data.total_amount;
          combinedAdminData[admin].total_win_amount += data.total_win_amount;
          combinedAdminData[admin].actual_win_amount += data.actual_win_amount;
        } else {
          // If the admin doesn't exist, create a new entry
          combinedAdminData[admin] = {
            admin,
            total_amount: data.total_amount,
            total_win_amount: data.total_win_amount,
            actual_win_amount: data.actual_win_amount,
          };
        }

        // pieUserData
        data.trans_by_user.forEach((trans_data) => {
          const name = trans_data.user.username;
          if (combinedUserData[name]) {
            // If the name already exists in the combinedUserData, add the values
            combinedUserData[name].total_amount += trans_data.total_amount;
            combinedUserData[name].total_win_amount +=
              trans_data.total_win_amount;
            combinedUserData[name].actual_win_amount +=
              trans_data.actual_win_amount;
          } else {
            // If the name doesn't exist, create a new entry
            combinedUserData[name] = {
              admin,
              name,
              total_amount: trans_data.total_amount,
              total_win_amount: trans_data.total_win_amount,
              actual_win_amount: trans_data.actual_win_amount,
            };
          }
        });
      });
    });

    let combinedPieAdminData = Object.values(combinedAdminData);
    let combinedPieUserData = Object.values(combinedUserData);

    function datasorter(data) {
      data.sort((a, b) => {
        if (a.admin < b.admin) {
          return -1;
        }
        if (a.admin > b.admin) {
          return 1;
        }
        return 0;
      });

      return data;
    }

    barchartData = barchartData.reverse();
    combinedPieAdminData = datasorter(combinedPieAdminData);
    combinedPieUserData = datasorter(combinedPieUserData);

    setChartData({ barchartData, combinedPieAdminData, combinedPieUserData });
  };

  useLayoutEffect(() => {
    socket.emit('chartData', { days: filter }, datapointsHandler);
  }, [filter]);

  useLayoutEffect(() => {
    socket.emit('chartData', { days: 1 }, datapointsHandler);
    socket.on('chartData', (data) => console.log(data));
    return () => {
      socket.off('chartData', (data) => console.log(data));
    };
  }, []);

  useEffect(() => {
    setMaxValue(
      Math.max(
        ...(chartData?.barchartData?.map(
          (item) => item?.grandActualWinAmount,
        ) || []),
        ...(chartData?.barchartData?.map((item) => item.grandTotalAmount) ||
          []),
        ...(chartData?.barchartData?.map((item) => item.profit) || []),
      ),
    );
    setColor(chartData?.combinedPieUserData?.map(generateRandomColor));
    setColorAdmin(chartData?.combinedPieAdminData?.map(generateRandomColor));

    if (ref.current.offsetWidth && chartData?.barchartData?.length) {
      const width = ref.current.offsetWidth;
      const datalength = chartData?.barchartData?.length;

      const x = width < 768 ? width / 768 : 1;
      const y = datalength - parseInt(x * datalength);
      setStart(y);
      const start1 = start;
      console.log('🚀 ~ file: Chart.jsx:161 ~ useEffect ~ start:', start1);
    }
  }, [chartData]);

  useEffect(() => {
    setForceRender((prev) => !prev);
  }, [start]);

  const generateRandomColor = () => {
    const minBrightness = 30; // Minimum brightness value (0-100)
    const maxBrightness = 60; // Maximum brightness value (0-100)

    const randomBrightness = Math.floor(
      Math.random() * (maxBrightness - minBrightness + 1) + minBrightness,
    );

    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const darkColor = `#${randomColor.padStart(6, '0')}`;

    return darkColor;
  };

  return (
    <>
      <div className='top-container'>
        <div className='breakdown-container'>
          <h3
            style={{
              backgroundColor: '#7F7F7F',
              color: 'whitesmoke',
              width: '90%',
              marginTop: '10px',
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '10px',
              padding: '4px',
            }}
          >
            Breakdown
          </h3>
        </div>
        <div className='pie-container'>
          <h3
            style={{
              backgroundColor: '#7F7F7F',
              color: 'whitesmoke',
              width: '90%',
              marginTop: '10px',
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '10px',
              padding: '4px',
            }}
          >
            Bet Amount Distribution
          </h3>
          <ResponsiveContainer
            width='100%'
            height={250}
          >
            <PieChart
            // width={730}
            // height={250}
            >
              <Tooltip />
              <Legend />
              <Pie
                data={chartData.combinedPieAdminData}
                dataKey='total_amount'
                nameKey='admin'
                cx='50%'
                cy='50%'
                outerRadius={60}
                // fill='#FF7F0E'
                // label
              >
                {chartData?.combinedPieAdminData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorAdmin[index]}
                  />
                ))}
              </Pie>
              <Pie
                data={chartData.combinedPieUserData}
                dataKey='total_amount'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={75}
                outerRadius={100}
                // fill='#8884d8'
                // label
              >
                {chartData?.combinedPieUserData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={color[index]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div
        className='bar-container'
        ref={ref}
      >
        <h3
          style={{
            backgroundColor: '#7F7F7F',
            color: 'whitesmoke',
            width: '90%',
            marginTop: '10px',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: '10px',
            padding: '4px',
          }}
        >
          Historical Data
        </h3>
        <ResponsiveContainer
          width='100%'
          height={300}
        >
          <ComposedChart
            data={chartData.barchartData}
            margin={{
              top: 5,
              right: 50,
              // left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray='1 1' />
            <XAxis dataKey='name' />
            <YAxis domain={[0, maxValue]} />
            <Tooltip />
            <Legend />
            <ReferenceLine
              y={0}
              stroke='#000'
            />
            <Brush
              key={start}
              height={20}
              stroke='#8884d8'
              data={chartData.combinedAdminData}
              startIndex={start}
            />
            <Line
              type='monotone'
              dataKey='grandTotalAmount'
              stroke='#FF7F0E'
              name='Bet Amount'
            />
            <Area
              type='monotone'
              dataKey='grandActualWinAmount'
              stroke='#A6CEE3'
              fill='#A6CEE3'
              name='Win Amount'
            />
            <Bar
              type='monotone'
              dataKey='profit'
              fill='#7F7F7F'
              name='Profit'
              radius={[45, 45, 20, 20]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div>
        <Radio.Group
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <Radio value={1}>Today</Radio>
          <Radio value={7}>7 Days</Radio>
          <Radio value={14}>14 Days</Radio>
          <Radio value={30}>30 Days</Radio>
        </Radio.Group>
      </div>
    </>
  );
}

export default Chart;
