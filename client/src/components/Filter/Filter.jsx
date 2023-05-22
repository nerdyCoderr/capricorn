import React, { useState } from 'react';
import { Button, DatePicker, Input, Select, Switch } from 'antd';
import useBetTypes from '../../hooks/useBetTypes';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import './filter.scss';
const Filter = ({
  setFilter,
  filterHandler,
  onBatchChange,
  onChangeTo,
  onChangeFrom,
  resetHandler,
  filter,
  filterType,
  params,
}) => {
  dayjs.extend(customParseFormat);
  const dateFormat = 'YYYY-MM-DD';

  const currentDate = moment().format(dateFormat);

  const { betTypeOptions, onTypeChange } = useBetTypes(setFilter);

  const [isFilter, setIsFilter] = useState(false);
  return (
    <>
      <div>
        <h6
          onClick={() => {
            setIsFilter(!isFilter);
          }}
          className='text-white'
          style={{ letterSpacing: '0.8px' }}
        >
          FILTER
        </h6>
        <Switch
          size='large'
          value={filter.bet_result}
          onChange={(e) => {
            setIsFilter(e);
          }}
        />
      </div>
      {isFilter && (
        <>
          <div className='filter-container shadow-lg'>
            <div className='filter-fields'>
              <p>From</p>
              <DatePicker
                value={dayjs(filter.from, dateFormat)}
                onChange={onChangeFrom}
                defaultValue={dayjs(currentDate, dateFormat)}
                format={dateFormat}
              />
            </div>
            <div className='filter-fields'>
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
                <div className='filter-fields'>
                  <p>Bet type</p>
                  <Select
                    value={filter.bet_type}
                    onChange={onTypeChange}
                    allowClear
                    style={{ minWidth: '130px' }}
                  >
                    {betTypeOptions ? (
                      betTypeOptions.map((item) => (
                        <Select.Option key={item._id} value={item.bet_type}>
                          {item.bet_type}
                        </Select.Option>
                      ))
                    ) : (
                      <></>
                    )}
                  </Select>
                </div>
                <div className='filter-fields'>
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
                <div className='filter-fields'>
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
              </>
            )}
            {(filterType === 'bet_list') | (filterType === 'trans_list') && (
              <>
                {' '}
                <div className='filter-fields'>
                  <p>Batch Type</p>
                  <Select
                    value={filter.batch_id}
                    onChange={onBatchChange}
                    allowClear
                    style={{ width: '130px' }}
                  >
                    <Select.Option key={1} value={1}>
                      6:00 am - 2:10 pm
                    </Select.Option>
                    <Select.Option key={2} value={2}>
                      2:10 pm - 4:45 pm
                    </Select.Option>
                    <Select.Option key={3} value={3}>
                      5:10 pm - 8:45 pm
                    </Select.Option>
                  </Select>
                </div>
                <div className='filter-fields'>
                  <p>Username</p>
                  <Input
                    value={filter?.username}
                    onChange={(e) => {
                      setFilter((prev) => {
                        return { ...prev, username: e.target.value };
                      });
                    }}
                  />
                </div>
              </>
            )}
            {params === '4' && (
              <div className='filter-fields'>
                <p>Check Win Result</p>
                <div className='switch'>
                  <Switch
                    size='large'
                    value={filter.bet_result}
                    onChange={(e) => {
                      console.log(e);
                      setFilter((prev) => {
                        return { ...prev, bet_result: e ? 1 : 0 };
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className='text-end filter-fields'>
            <Button
              disabled={!isFilter}
              onClick={filterHandler}
              className='mx-1 mt-1'
            >
              Filter
            </Button>
            <Button
              disabled={!isFilter}
              className='mx-1 mt-1'
              onClick={resetHandler}
            >
              Reset
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default Filter;
