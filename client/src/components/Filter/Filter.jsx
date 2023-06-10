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

  const isForBetlist = filterType === 'bet_list' && (
    <>
      <div className='filter__container-fields'>
        <p>Bet type</p>
        <Select
          className='w-100'
          value={filter.bet_type}
          onChange={onTypeChange}
          allowClear
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
      <div className='filter__container-fields'>
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
      <div className='filter__container-fields'>
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
  );
  const isForBetlistOrTransactionlist =
    (filterType === 'bet_list') | (filterType === 'trans_list') ? (
      <>
        <div className='filter__container-fields'>
          <p>Batch Type</p>
          <Select
            className='w-100'
            value={filter.batch_id}
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
        </div>
        <div className='filter__container-fields'>
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
    ) : null;

  const isForWinHistory =
    filterType === 'winHistory' ? (
      <>
        <div className='filter__container-fields'>
          <p>Batch Type</p>
          <Select
            className='w-100'
            value={filter.batch_id}
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
        </div>
        <div className='filter__container-fields'>
          <p>Bet type</p>
          <Select
            className='w-100'
            value={filter.bet_type}
            onChange={onTypeChange}
            allowClear
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
        <div className='filter__container-fields'>
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
    ) : null;

  const isForSuperAdmin = filterType === 'superadmin' && (
    <>
      <div className='filter__container-fields'>
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
      <div className='filter__container-fields'>
        <p>Admin/User</p>
        <div className='switch'>
          <Switch
            size='large'
            checked={filter.role === 'admin' ? false : true}
            onChange={(e) => {
              setFilter((prev) => {
                return { ...prev, role: e ? 'user' : 'admin' };
              });
            }}
          />
        </div>
      </div>
    </>
  );
  const isForTableFour = params === '4' && (
    <div className='filter__container-fields'>
      <p> Win Result</p>
      <div className='switch'>
        <Switch
          size='large'
          value={filter.bet_result}
          onChange={(e) => {
            setFilter((prev) => {
              return { ...prev, bet_result: e ? 1 : 0 };
            });
          }}
        />
      </div>
    </div>
  );

  const filterButtonHandler = () => {
    filterHandler();
    setIsFilter(false);
  };

  return (
    <div className='filter-frame'>
      <div>
        <h6 className='filter-h6'>FILTER</h6>
        <Switch
          size='large'
          checked={isFilter}
          onChange={(e) => {
            setIsFilter(e);
          }}
        />
      </div>
      {isFilter && (
        <div style={{ position: 'relative' }}>
          <div className='text-end filter-button'>
            <Button
              disabled={!isFilter}
              onClick={filterButtonHandler}
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

          <div className='filter shadow-lg'>
            <div className='filter__container'>
              {(!filterType === 'superadmin' ||
                filterType === 'trans_list' ||
                filterType === 'bet_list' ||
                filterType === 'winHistory') && (
                <>
                  <div className='filter__container-fields'>
                    <p>From</p>
                    <DatePicker
                      value={dayjs(filter.from, dateFormat)}
                      onChange={onChangeFrom}
                      defaultValue={dayjs(currentDate, dateFormat)}
                      format={dateFormat}
                    />
                  </div>
                  <div className='filter__container-fields'>
                    <p>To</p>
                    <DatePicker
                      value={dayjs(filter.to, dateFormat)}
                      onChange={onChangeTo}
                      defaultValue={dayjs(currentDate, dateFormat)}
                      format={dateFormat}
                    />
                  </div>
                </>
              )}
              {isForBetlist}
              {isForBetlistOrTransactionlist}
              {isForTableFour}
              {isForSuperAdmin}
              {isForWinHistory}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
