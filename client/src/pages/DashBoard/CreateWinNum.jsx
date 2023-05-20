import React, { useEffect, useState } from 'react';
import GlassLayout from '../../components/Layout/GlassLayout';
import { MdArrowBackIos } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import './CreateWinNumber.scss';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import moment from 'moment';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import Table from '../../components/Table/Table';
import { createWinningNumber, getBetType } from '../../api/request';

function CreateWinNum() {
  dayjs.extend(customParseFormat);
  const nav = useNavigate();
  const dateFormat = 'YYYY-MM-DD';

  const currentDate = moment().format(dateFormat);

  const [dataTable, setDataTabble] = useState([]);
  const [betTypeOptions, setBetTypeOptions] = useState([]);
  const [formData, setFormData] = useState({
    date: currentDate,
    bet_type: '',
    batch_type: '',
    bet_number: '',
  });

  const columns = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date', // accessor is the "key" in the data
      },
      {
        Header: 'Batch Type',
        accessor: 'batch_type',
      },
      {
        Header: 'Bet Type',
        accessor: 'bet_type_id', // accessor is the "key" in the data
      },
      {
        Header: 'Bet Number',
        accessor: 'bet_number', // accessor is the "key" in the data
      },

      {
        Header: 'Action',
        accessor: 'action',
      },
    ],
    [],
  );

  const deleteHandler = (id) => {
    setDataTabble((prev) => prev.filter((item) => item.id !== id));
  };
  const callback = async (res) => {
    const { data } = await res;
    setBetTypeOptions(data.betTypes);
  };

  const onTypeChange = (value) => {
    console.log(value);
    betTypeOptions.find((item) => {
      if (item._id === value) {
        return setFormData((prev) => {
          return {
            ...prev,
            bet_type: value,
            bet_id: item.bet_type,
            win_amt: item.win_multiplier,
            amt_const: item.amt_const,
          };
        });
      }
      return;
    });
  };

  const onBatchChange = (value) => {
    setFormData((prev) => {
      return { ...prev, batch_type: value };
    });
  };

  const onChangeDate = (_, dateString) => {
    setFormData((prev) => {
      return { ...prev, date: dateString };
    });
  };

  const submitHandler = () => {
    console.log(formData);
    const newdata = {
      id: Math.floor(Math.random() * 1000000),
      createdAt: formData.date,
      batch_id: formData.batch_type,
      bet_num: formData.bet_number,
      bet_type: formData.bet_type,
      bet_id: formData.bet_id,
    };
    console.log(newdata);
    setDataTabble([...dataTable, newdata]);
  };
  const callbackWinNumber = async (res) => {
    const { status } = await res;
    console.log(res);
    if (status === 200 || status === 201) {
      setDataTabble([]);
    }
  };
  const createWinBet = () => {
    createWinningNumber(dataTable, callbackWinNumber);
  };
  const newDatable = React.useMemo(() => {
    const reconstructedList = dataTable.map((item) => {
      return {
        date: item.createdAt,
        bet_number: item.bet_num,
        batch_type: item.batch_id,
        bet_type: item.bet_type,
        bet_type_id: item.bet_id,
        action: <button onClick={() => deleteHandler(item.id)}>delete</button>,
      };
    });
    return { data: reconstructedList };
  }, [dataTable]);

  useEffect(() => {
    getBetType(callback);
  }, []);
  return (
    <GlassLayout>
      <div
        style={{ textAlign: 'left', marginLeft: '1rem' }}
        onClick={() => nav('/dashboard')}
      >
        <MdArrowBackIos size={25} />
      </div>
      <div className='create-win-num'>
        {' '}
        <h1 className='text-center'>Input Winning bets</h1>
        <Form
          onFinish={submitHandler}
          className='createwinNumForm'
          autoComplete='off'
          layout='vertical'
        >
          <Form.Item label='Date' name='date'>
            <DatePicker
              valuae={dayjs(formData.date, dateFormat)}
              className='w-100'
              defaultValue={dayjs(currentDate, dateFormat)}
              format={dateFormat}
              onChange={onChangeDate}
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
                  <Select.Option key={item._id} value={item._id}>
                    {item.bet_type}
                  </Select.Option>
                ))
              ) : (
                <></>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label='Batch Type'
            name='batch_type'
            rules={[
              { required: true, message: 'Please select your batch type!' },
            ]}
          >
            <Select onChange={onBatchChange} allowClear>
              <Select.Option key={1} value={1}>
                6:00 am - 2:00 pm
              </Select.Option>
              <Select.Option key={2} value={2}>
                2:00 pm - 6:00 pm
              </Select.Option>
              <Select.Option key={3} value={3}>
                6:00 pm - 9:00 pm
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            className='form-group-custom'
            label='Bet Number'
            name='bet_num'
            rules={[
              {
                required: true,
                message: 'Please input your bet Number!',
              },
            ]}
            onChange={(e) => {
              setFormData((prev) => {
                return { ...prev, bet_number: e.target.value };
              });
            }}
          >
            <Input />
          </Form.Item>
          <Button className='w-100' type='primary' htmlType='submit'>
            SUBMIT
          </Button>
        </Form>
        <div style={{ height: '200px', margin: '0.5rem', overflowY: 'scroll' }}>
          <Table dataTable={newDatable} columns={columns} />
        </div>
        <Button type='primary' onClick={createWinBet}>
          Create Winning Bet
        </Button>
      </div>
    </GlassLayout>
  );
}

export default CreateWinNum;
