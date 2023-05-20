import React from 'react';
import { Button, DatePicker, Input, Select, Switch } from 'antd';
import useBetTypes from '../../hooks/useBetTypes';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
function Filter({
  setFilter,
  filterHandler,
  onBatchChange,
  onChangeTo,
  onChangeFrom,
  resetHandler,
  filter,
  filterType,
  params,
}) {
  dayjs.extend(customParseFormat);
  const dateFormat = 'YYYY-MM-DD';

  const currentDate = moment().format(dateFormat);

  const { betTypeOptions, onTypeChange } = useBetTypes(setFilter);

  return (
    <>
      <h5 style={{ letterSpacing: '0.8px' }}>Filter:</h5>
      <div
        className='d-flex'
        style={{ gap: '20px', flexWrap: 'wrap' }}
      >
        <div className=''>
          <p>From</p>
          <DatePicker
            value={dayjs(filter.from, dateFormat)}
            onChange={onChangeFrom}
            defaultValue={dayjs(currentDate, dateFormat)}
            format={dateFormat}
          />
        </div>
        <div className=''>
          <p>To</p>
          <DatePicker
            value={dayjs(filter.to, dateFormat)}
            onChange={onChangeTo}
            defaultValue={dayjs(currentDate, dateFormat)}
            format={dateFormat}
          />
        </div>
        {filterType === 'bet_list' && (
          <>
            <div className=''>
              <p>Bet type</p>
              <Select
                value={filter.bet_type}
                onChange={onTypeChange}
                allowClear
                style={{ width: '150px' }}
              >
                {betTypeOptions ? (
                  betTypeOptions.map((item) => (
                    <Select.Option
                      key={item._id}
                      value={item.bet_type}
                    >
                      {item.bet_type}
                    </Select.Option>
                  ))
                ) : (
                  <></>
                )}
              </Select>
            </div>
            <div>
              <p>Bet Number</p>
              <Input
                value={filter?.bet_num}
                onChange={(e) => {
                  setFilter((prev) => {
                    return { ...prev, bet_num: e.target.value };
                  });
                }}
              />
            </div>
            <div>
              <p>Transaction No.</p>
              <Input
                value={filter?.trans_no}
                onChange={(e) => {
                  setFilter((prev) => {
                    return { ...prev, trans_no: e.target.value };
                  });
                }}
              />
            </div>
            <div>
              <p>Batch Type</p>
              <Select
                value={filter.batch_id}
                onChange={onBatchChange}
                allowClear
                style={{ width: '150px' }}
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
            </div>
          </>
        )}
        {params === '4' && (
          <div>
            <p>Check Win Result</p>
            <Switch
              value={filter.bet_result}
              onChange={(e) => {
                console.log(e);
                setFilter((prev) => {
                  return { ...prev, bet_result: e ? 1 : 0 };
                });
              }}
            />
          </div>
        )}

        <div className='text-center'>
          <p>Action</p>
          <Button
            onClick={filterHandler}
            className='mx-1'
          >
            Filter
          </Button>
          <Button
            className='mx-1'
            onClick={resetHandler}
          >
            Reset
          </Button>
        </div>
      </div>
    </>
  );
}

export default Filter;
