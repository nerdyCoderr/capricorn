import React, { useEffect, useState } from 'react';

import './CreateWinNumber.scss';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import moment from 'moment';
import { Button, DatePicker, Form, Input, Select, Table } from 'antd';

import { createWinningNumber, getBetType } from '../../api/request';
import BackButton from '../../components/Layout/BackButton';

function CreateWinNum() {
  dayjs.extend(customParseFormat);

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
        title: 'Bet Number',
        dataIndex: 'bet_number', // dataIndex is the "key" in the data
      },
      {
        title: 'Bet Type',
        dataIndex: 'bet_type_id', // dataIndex is the "key" in the data
      },
      {
        title: 'Batch Type',
        dataIndex: 'batch_type',
      },
      {
        title: 'Date',
        dataIndex: 'date', // dataIndex is the "key" in the data
      },
      {
        title: 'Action',
        dataIndex: 'action',
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
    console.log(dataTable);
    const reconstructedList = dataTable.map((item) => {
      return {
        date: item.createdAt,
        bet_number: item.bet_num,
        batch_type: item.batch_id,
        bet_type: item.bet_type,
        bet_type_id: item.bet_id,
        action: <Button onClick={() => deleteHandler(item.id)}>Delete</Button>,
      };
    });
    return { data: reconstructedList };
  }, [dataTable]);

  useEffect(() => {
    getBetType(callback);
  }, []);
  return (
    <>
      {' '}
      <div className='create-win-num'>
        <BackButton title='Input Winning Bets' />
        <Form
          onFinish={submitHandler}
          className='createwinNumForm'
          autoComplete='off'
          layout='vertical'
        >
          <Form.Item
            label='Date'
            name='date'
          >
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
            <Select
              onChange={onTypeChange}
              allowClear
            >
              {betTypeOptions ? (
                betTypeOptions.map((item) => (
                  <Select.Option
                    key={item._id}
                    value={item._id}
                  >
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
            <Select
              onChange={onBatchChange}
              allowClear
            >
              <Select.Option
                key={1}
                value={1}
              >
                6:00 am - 2:10 pm
              </Select.Option>
              <Select.Option
                key={2}
                value={2}
              >
                2:10 pm - 4:45 pm
              </Select.Option>
              <Select.Option
                key={3}
                value={3}
              >
                5:10 pm - 8:45 pm
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
          <Button
            style={{ height: '50px', fontSize: '18px' }}
            className='w-100'
            type='primary'
            htmlType='submit'
          >
            SUBMIT
          </Button>
        </Form>
        <div className='ant-table-container container mt-3'>
          <Table
            dataSource={newDatable?.data}
            columns={columns}
            scroll={{ x: 450, y: 200 }}
            pagination={false}
          />
        </div>

        {/* <div style={{ height: '200px', margin: '0.5rem', overflowY: 'scroll' }}>
          <Tabless
            dataTable={newDatable}
            columns={columns}
          />
        </div> */}
        <div className='text-center mt-3'>
          <Button
            style={{ height: '50px', fontSize: '18px' }}
            type='primary'
            onClick={createWinBet}
            disabled={dataTable.length <= 0 ? true : false}
          >
            Create Winning Bet
          </Button>
        </div>
      </div>
    </>
  );
}

export default CreateWinNum;
