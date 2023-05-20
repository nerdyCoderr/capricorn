/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { Form, Button, Input, Select } from 'antd';
import { MdArrowBackIos } from 'react-icons/md';
import Moment from 'moment';
import './NewBet.scss';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table/Table';
import { createBet, getBetType, openNotification } from '../../api/request';
import GlassLayout from '../../components/Layout/GlassLayout';
import io from 'socket.io-client';
import userContext from '../../context/userContext';

const NewBets = () => {
  const token = localStorage.getItem('socketToken');

  const { socket } = useContext(userContext);
  const date = new Date();
  const nav = useNavigate();
  const formatDate = Moment(date).format('MMMM Do YYYY');
  const timeFormat = Moment(date).format('LTS');

  const [dataTable, setDataTabble] = useState([]);
  const [betTypeOptions, setBetTypeOptions] = useState([]);
  // const [winAmount, setWinAmount] = useState();
  const [remainingBetAmount, setRemainingBetAmount] = useState();
  const [isBetLimit, setIsBetLimit] = useState(false);
  //------------
  // const [betAmount, setBetAmount] = useState(0);
  // const [betNumber, setBetNumber] = useState();
  const [formData, setFormData] = useState({
    bet_number: '',
    bet_type: '',
    bet_amount: '',
    win_amt: '',
    amt_const: '',
  });
  //-------------
  const [betnumberRestrictionInput, setBetnumberRestrictionInput] = useState();
  const [limitbet, setLimitBet] = useState([]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Type',
        accessor: 'bet_type',
      },
      {
        Header: 'Number',
        accessor: 'bet_num', // accessor is the "key" in the data
      },
      {
        Header: 'Amount',
        accessor: 'bet_amt',
      },
      {
        Header: 'Win Amount',
        accessor: 'win_amt', // accessor is the "key" in the data
      },

      {
        Header: 'Action',
        accessor: 'action',
      },
    ],
    [],
  );
  const submitHandler = () => {
    const { bet_number, bet_type } = formData;
    let new_bet_number = parseInt(bet_number);

    let prefix = '';
    if (new_bet_number < 10) {
      switch (bet_type) {
        case 'L2':
          prefix = '0';
          break;
        case 'L3':
          prefix = '00';
          break;
        case '4D':
          prefix = '000';
          break;
        default:
          break;
      }
    } else if (new_bet_number < 100) {
      switch (bet_type) {
        case 'L3':
          prefix = '0';
          break;
        case '4D':
          prefix = '00';
          break;
        default:
          break;
      }
    } else if (new_bet_number < 1000 && bet_type === '4D') {
      prefix = '0';
    }

    new_bet_number = prefix + bet_number;

    const newdata = {
      id: Math.floor(Math.random() * 1000000),
      bet_amt: +formData.bet_amount,
      bet_num: new_bet_number,
      bet_type: formData.bet_type,
      win_amt: formData.win_amt * formData.bet_amount,
    };

    if (dataTable) {
      let test = dataTable;
      for (let x = 0; x <= test.length - 1; x++) {
        if (
          test[x].bet_num === newdata.bet_num &&
          test[x].bet_type === newdata.bet_type
        ) {
          test[x].bet_amt =
            parseInt(test[x].bet_amt) + parseInt(newdata.bet_amt);
          test[x].win_amt =
            parseInt(test[x].bet_amt) * parseInt(formData.win_amt);
          setDataTabble([...test]);
          return 0;
        }
      }
    }

    setDataTabble([...dataTable, newdata]);
  };

  const handleChange = (key) => (e) => {
    setFormData({ ...formData, [key]: e.target.value });
    return;
  };

  const deleteHandler = (id) => {
    setDataTabble((prev) => prev.filter((item) => item.id !== id));
  };

  const newDatable = React.useMemo(() => {
    const reconstructedList = dataTable.map((item) => {
      return {
        bet_amt: item.bet_amt,
        bet_num: item.bet_num,
        win_amt: item.win_amt,
        bet_type: item.bet_type,
        action: <button onClick={() => deleteHandler(item.id)}>delete</button>,
      };
    });
    return { data: reconstructedList };
  }, [dataTable]);

  const onTypeChange = (value) => {
    betTypeOptions.find((item) => {
      if (item.bet_type === value) {
        const countNumber = item.upper.toString().length;
        setBetnumberRestrictionInput(countNumber);

        return setFormData((prev) => {
          return {
            ...prev,
            bet_type: value,
            win_amt: item.win_multiplier,
            amt_const: item.amt_const,
          };
        });
      }
      return;
    });
  };

  const validateMinimumAmount = (_, value, callback) => {
    if (value && value < 10) {
      callback('The minimum amount is 10.');
    } else {
      callback();
    }
  };

  const placeBetHandler = () => {
    console.log(dataTable);
    createBet(dataTable, betPlacedCallback);
  };

  const callback = async (res) => {
    const { data } = await res;
    setBetTypeOptions(data.betTypes);
  };

  const betPlacedCallback = async (res) => {
    const { status } = res;
    if (status === 201 || status === 200) {
      console.log(res);
      setDataTabble([]);
    }
    if (status === 400) {
      if (dataTable) {
        const newdata = dataTable.filter((bet) => {
          for (let value in limitbet) {
            let betArr = value.split(':');
            if (
              bet.bet_amt > limitbet[value].remaining_const &&
              bet.bet_type === betArr[0] &&
              bet.bet_num === betArr[1]
            ) {
              const title = `Bet Type: ${betArr[0]}`;
              const message = `Bet Number: ${betArr[1]} exceeded the remaining limit  `;
              openNotification(title, message);
              return false;
            }
          }
          return true;
        });

        setDataTabble([...newdata]);
      }
    }
  };

  const checklimit = () => {
    // L2:35 betType:betNumber
    const { bet_type, bet_number, bet_amount } = formData;

    const betTypeAndNumber = `${bet_type}:${bet_number}`;
    const remainingBetAmount = limitbet[betTypeAndNumber]?.remaining_const;
    const betAmount = bet_amount || 1;

    setIsBetLimit(remainingBetAmount <= betAmount);

    setRemainingBetAmount(
      remainingBetAmount <= betAmount ? remainingBetAmount.toString() : '',
    );
  };

  useEffect(() => {
    checklimit();
  }, [formData]);

  useEffect(() => {
    console.log('check');
    getBetType(callback);
    socket.connect();
    socket.emit('watchlist', '', () => {});

    const updateLimitBet = (data) => {
      console.log(data);
      setLimitBet(data);
    };

    socket.on('watchlist', updateLimitBet);

    return () => {
      socket.off('watchlist', updateLimitBet);
    };
  }, []);

  useEffect(() => {
    if (!dataTable) {
      return;
    }
    console.log(dataTable);

    const updatedDataTable = dataTable.filter((data) => {
      const limitKey = `${data.bet_type}:${data.bet_num}`;
      const limit = limitbet[limitKey];

      if (!limit || data.bet_amt <= limit.remaining_const) {
        return true;
      }

      const title = `Bet Type: ${data.bet_type}`;
      const message = `Bet Number: ${data.bet_num} exceeded the remaining limit`;
      openNotification(title, message);

      return false;
    });

    setDataTabble(updatedDataTable);
  }, [limitbet]);

  return (
    <GlassLayout>
      <div
        style={{ textAlign: 'left', marginLeft: '1rem' }}
        onClick={() => nav('/dashboard')}
      >
        <MdArrowBackIos size={25} />
      </div>
      <div className='newBet'>
        <h1 className='text-center'>New Bet</h1>
        <div className='mt-5'>
          <h6>{formatDate}</h6>
          <h6>{timeFormat}</h6>
        </div>
        <div className='container'>
          <Form
            className='betForm'
            onFinish={submitHandler}
            autoComplete='off'
            layout='vertical'
          >
            <Form.Item
              className='form-group-custom'
              label='Bet Number'
              name='bet_num'
              rules={[
                {
                  required: true,
                  message: 'Please input your bet Number!',
                },
                {
                  max: betnumberRestrictionInput,
                  message: `Please enter bet number less or equal to ${betnumberRestrictionInput}`,
                },
              ]}
            >
              <Input
                value={formData.bet_number}
                onChange={handleChange('bet_number')}
              />
            </Form.Item>

            <Form.Item
              name='bet_type'
              label='Bet Type'
              rules={[
                { required: true, message: 'Please select your bet type!' },
              ]}
            >
              <Select onChange={onTypeChange} allowClear>
                {betTypeOptions ? (
                  betTypeOptions.map((item) => (
                    <Select.Option key={item._id} value={item.bet_type}>
                      {item.type}
                    </Select.Option>
                  ))
                ) : (
                  <></>
                )}
                <Select.Option value='cut_off'>
                  Current Day Cut-off
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={`Bet Amount (remaining: ${
                remainingBetAmount
                  ? remainingBetAmount
                  : formData?.amt_const ?? 0
              })`}
              name='bet_amt'
              rules={[
                {
                  required: true,
                  message: 'Please input your bet Amount!',
                },
                {
                  validator: validateMinimumAmount,
                },
              ]}
            >
              <Input
                value={formData.bet_amount}
                disabled={
                  formData.bet_type && formData.bet_number ? false : true
                }
                type='number'
                onChange={handleChange('bet_amount')}
              />
            </Form.Item>

            <Button
              className='w-100'
              type='primary'
              htmlType='submit'
              disabled={isBetLimit}
            >
              SUBMIT
            </Button>
          </Form>

          <div style={{ height: '200px', overflowY: 'scroll' }}>
            <Table dataTable={newDatable} columns={columns} />
          </div>
        </div>
        <div className='mt-5 w-100 container'>
          <Button
            disabled={!dataTable.length > 0 ? true : false}
            className='w-100'
            onClick={placeBetHandler}
          >
            PLACE BET
          </Button>
        </div>
      </div>
    </GlassLayout>
  );
};

export default NewBets;
