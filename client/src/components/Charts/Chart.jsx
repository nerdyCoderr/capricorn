import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import './Chart.scss';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  ReferenceLine,
  Brush,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button, Card, Col, Radio, Row, Space } from 'antd';
import userContext from '../../context/userContext';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/themes/splide-default.min.css';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';

function Chart() {
  const { socket, data } = useContext(userContext);
  const [chartData, setChartData] = useState([]);
  const [maxValue, setMaxValue] = useState();
  const [filter, setFilter] = useState(1);
  const [color, setColor] = useState(['#0088FE']);
  const [colorAdmin, setColorAdmin] = useState(['#0088FE']);
  const [start, setStart] = useState(0);
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

  const generateRandomColor = () => {
    // const minBrightness = 30; // Minimum brightness value (0-100)
    // const maxBrightness = 60; // Maximum brightness value (0-100)
    // const randomBrightness = Math.floor(
    //   Math.random() * (maxBrightness - minBrightness + 1) + minBrightness,
    // );
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const darkColor = `#${randomColor.padStart(6, '0')}`;
    return darkColor;
  };
  const [breakdown, setBreakdown] = useState({ admin: true, user: false });
  const [breakdownSumtotal, setBreakdownSumtotal] = useState({
    sumofTotalAmount: 0,
    sumofTotalActualWinaAmount: 0,
    sumofTotalProfit: 0,
  });

  const [resultOverview, setResultOverview] = useState({
    total: 1,
    grandTotalAmount: 0,
    grandTotalWinAmount: 0,
    grandActualWinAmount: 0,
  });

  useLayoutEffect(() => {
    socket.emit('chartData', { days: filter }, datapointsHandler);
  }, [filter]);
  useLayoutEffect(() => {
    socket.emit('chartData', { days: 1 }, datapointsHandler);
    socket.on('chartData', () => {});
    return () => {
      socket.off('chartData', () => {});
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
  }, [chartData]);

  useEffect(() => {
    let totalAmount = 0;
    let totalActualWinAmount = 0;
    let totalProfit = 0;
    chartData?.combinedPieUserData?.forEach((data) => {
      totalAmount += data?.total_amount || 0;
      totalActualWinAmount += data?.actual_win_amount || 0;
      totalProfit += (data?.total_amount || 0) - (data?.actual_win_amount || 0);
    });
    setBreakdownSumtotal({
      sumofTotalAmount: totalAmount,
      sumofTotalActualWinaAmount: totalActualWinAmount,
      sumofTotalProfit: totalProfit,
    });
  }, [chartData?.combinedPieUserData, chartData?.combinedPieAdminData]);

  const filterdata = (e) => {
    if (ref.current.offsetWidth && e.target.value) {
      const width = ref.current.offsetWidth;
      const datalength = e.target.value === 1 ? 16 : e.target.value;

      const x = width < 768.98 ? width / 768 : 1;
      const y = datalength - parseInt(x * datalength);
      setStart(y);
    }
    setFilter(e.target.value);
  };

  useEffect(() => {}, [start]);

  const [widthScreen, setWidthScreen] = useState();
  const [mobile, setMobile] = useState('');

  const handleResize = () => {
    const mobileWidth = ref.current.offsetWidth <= 425.98 ? '15em' : '100%';
    setMobile(mobileWidth);
    console.log(mobileWidth);
    setWidthScreen(ref.current.offsetWidth);
  };

  useLayoutEffect(() => {
    handleResize();
  }, [widthScreen, window.innerWidth]);

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateLimitBet = (data) => {
      setResultOverview(data.trans);
    };

    socket.emit('admin:transactionOverview', '', updateLimitBet);

    socket.on('admin:transactionOverview', (data) => setResultOverview(data));

    return () => {
      socket.off('admin:transactionOverview', (data) =>
        setResultOverview(data),
      );
    };
  }, []);
  return (
    <>
      <div className='top-container'>
        {(data.role === 'admin' || data.role === 'super-admin') && (
          <div className='livedata-container'>
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
              Realtime Data
            </h3>
            <div style={{ width: mobile, margin: '0 auto' }}>
              <Splide
                style={{ justifyContent: 'center' }}
                options={{
                  // autoplay: true,
                  type: mobile == '15em' ? 'loop' : 'slide',
                  drag: 'free',
                  focus: mobile == '15em' ? 'center' : undefined,
                  width: { mobile },
                  perPage: mobile === '15em' ? 1 : 3,
                  pagination: true,
                  autoWidth: true,
                  gap: 5,
                  center: true,
                  // rewind: true,
                  // loop: true,
                  arrows: mobile === '15em' ? true : false,
                  loop: true,
                  autoScroll: {
                    // autoStart: true,
                    // autoplay: true,
                    pauseOnHover: true,
                    pauseOnFocus: true,
                    rewind: true,
                    loop: true,
                    speed: 0.7,
                  },
                }}
                extensions={{ AutoScroll }}
              >
                <SplideSlide>
                  <Card
                    style={{ minWidth: '15em' }}
                    title={<h3>Bet Amount</h3>}
                    className='p-2 livedata'
                  >
                    <h2> {resultOverview.grandTotalAmount}</h2>
                  </Card>
                </SplideSlide>
                <SplideSlide>
                  <Card
                    style={{ minWidth: '15em' }}
                    title={<h3>Win Amount</h3>}
                    className='p-2 livedata'
                  >
                    <h2> {resultOverview.grandActualWinAmount}</h2>
                  </Card>
                </SplideSlide>
                <SplideSlide>
                  <Card
                    style={{ minWidth: '15em' }}
                    title={<h3>Profit</h3>}
                    className='p-2 livedata'
                  >
                    <h2>
                      {resultOverview.grandTotalAmount -
                        resultOverview.grandActualWinAmount}
                    </h2>
                  </Card>
                </SplideSlide>
              </Splide>
            </div>
          </div>
        )}

        <Row
          justify='center'
          style={{
            backgroundColor: 'whitesmoke',
            color: 'whitesmoke',
            marginTop: '30px',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: '20px',
            padding: '4px',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #7F7F7F',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Col xs={24}>
            <div>
              <Radio.Group
                onChange={filterdata}
                value={filter}
              >
                <Radio value={1}>Today</Radio>
                <Radio value={7}>7 Days</Radio>
                <Radio value={14}>14 Days</Radio>
                <Radio value={30}>30 Days</Radio>
              </Radio.Group>
            </div>
          </Col>
        </Row>

        <section
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
                key={1}
                values={start}
                height={30}
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
        </section>
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
          <div className='text-center'>
            <p
              style={{
                fontSize: '18px',
                fontWeight: '500',
                margin: '1rem 0 0 0',
              }}
            >
              Total
            </p>
            <Row
              className='d-flex justify-content-center mt-2'
              gutter={[40, 40]}
            >
              <Col>
                <p style={{ fontWeight: '500', fontSize: '16px' }}>Bet Amt</p>
                <p style={{ fontSize: '18px' }}>
                  {breakdownSumtotal?.sumofTotalAmount}
                </p>
              </Col>
              <Col>
                <p style={{ fontWeight: '500', fontSize: '16px' }}> Win Amt</p>
                <p style={{ fontSize: '18px' }}>
                  {breakdownSumtotal?.sumofTotalActualWinaAmount}
                </p>
              </Col>
              <Col>
                <p style={{ fontWeight: '500', fontSize: '16px' }}> Profit</p>
                <p style={{ fontSize: '18px' }}>
                  {breakdownSumtotal?.sumofTotalProfit}
                </p>
              </Col>
            </Row>
            <Space className='d-flex justify-content-center'>
              <Button
                onClick={() => {
                  setBreakdown({
                    admin: true,
                    user: false,
                  });
                }}
                style={{
                  width: '70px',
                }}
              >
                Admin
              </Button>
              <Button
                onClick={() => {
                  setBreakdown({
                    admin: false,
                    user: true,
                  });
                }}
                style={{
                  width: '70px',
                }}
              >
                User
              </Button>
            </Space>
            {breakdown.admin && (
              <div className='breakdown-scroll '>
                {chartData?.combinedPieAdminData?.map((data, index) => {
                  return (
                    <div
                      className='breakdown mt-3'
                      key={index}
                    >
                      <p style={{ fontWeight: '500', fontSize: '16px' }}>
                        Username: {data?.admin}
                      </p>
                      <Row
                        className='d-flex justify-content-center'
                        gutter={[40, 40]}
                      >
                        <Col>
                          <p style={{ fontWeight: '500', fontSize: '16px' }}>
                            Bet Amt
                          </p>
                          <p style={{ fontSize: '18px' }}>
                            {data?.total_amount}
                          </p>
                        </Col>
                        <Col>
                          <p style={{ fontWeight: '500', fontSize: '16px' }}>
                            {' '}
                            Win Amt
                          </p>
                          <p style={{ fontSize: '18px' }}>
                            {data?.actual_win_amount}
                          </p>
                        </Col>
                        <Col>
                          <p style={{ fontWeight: '500', fontSize: '16px' }}>
                            Profit
                          </p>
                          <p style={{ fontSize: '18px' }}>
                            {data?.total_amount - data?.actual_win_amount}
                          </p>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            )}
            {breakdown.user && (
              <div className='breakdown-scroll '>
                {chartData?.combinedPieUserData.map((data, index) => {
                  return (
                    <div
                      className='breakdown mt-3'
                      key={index}
                    >
                      <p style={{ fontWeight: '500', fontSize: '16px' }}>
                        <span className='font-weight-bold'>Username:</span>{' '}
                        {data?.name}
                      </p>
                      <div>
                        <Row
                          className='d-flex justify-content-center'
                          gutter={[40, 40]}
                        >
                          <Col>
                            <p style={{ fontWeight: '500', fontSize: '16px' }}>
                              Bet Amt
                            </p>
                            <p style={{ fontSize: '18px' }}>
                              {data?.total_amount}
                            </p>
                          </Col>
                          <Col>
                            <p style={{ fontWeight: '500', fontSize: '16px' }}>
                              {' '}
                              Win Amt
                            </p>
                            <p style={{ fontSize: '18px' }}>
                              {data?.actual_win_amount}
                            </p>
                          </Col>
                          <Col>
                            <p style={{ fontWeight: '500', fontSize: '16px' }}>
                              Profit
                            </p>
                            <p style={{ fontSize: '18px' }}>
                              {data?.total_amount - data?.actual_win_amount}
                            </p>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
            height={mobile ? 300 : 250}
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
    </>
  );
}
export default Chart;
