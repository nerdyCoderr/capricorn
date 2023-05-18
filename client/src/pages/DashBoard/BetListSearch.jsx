import React, { useEffect, useState } from 'react';
import './BetList.scss';
import Table from '../../components/Table/Table';
import { getBetList, getBetType } from '../../api/request';

// import TableThreeModal from '../../components/BetList/TableThreeModal';
import { Button, DatePicker, Input, Select } from 'antd';
import usePagination from '../../hooks/usePagination';
// import TabletwoModal from '../../components/BetList/TabletwoModal';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import TableThreeModal from '../../components/BetList/TableThreeModal';
import TabletwoModal from '../../components/BetList/TabletwoModal';

const BetListSearch = () => {
  dayjs.extend(customParseFormat);

  const nav = useNavigate();
  const [dataTable, setDataTabble] = useState([]);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [trans_no, setTrans_no] = useState('');
  const [filter, setFilter] = useState({
    type: '',
    number: '',
    trans_no: '',
    batch_type: '',
  });
  const [isTable2Open, setIsTable2Open] = useState(false);
  const [isTablethreeOpen, setIsTablethreeOpen] = useState(false);
  const [betTypeOptions, setBetTypeOptions] = useState([]);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Bet Type',
        accessor: 'bet_type', // accessor is the "key" in the data
      },
      {
        Header: 'Bet Number',
        accessor: 'bet_num', // accessor is the "key" in the data
      },
      {
        Header: 'Bet Amount',
        accessor: 'bet_amt',
      },

      {
        Header: 'Transaction No.',
        accessor: 'trans_no',
      },
      {
        Header: 'Fullname',
        accessor: 'fullname',
      },
    ],
    [],
  );

  // const actionHandler = (id) => {
  //   console.log(id);
  //   setIsTable2Open(true);
  //   setUsername(id);
  // };

  const actionHandlertwo = (trans_no) => {
    console.log(trans_no);
    setIsTable2Open(false);
    setIsTablethreeOpen(true);
    setTrans_no(trans_no);
  };

  const handleColumnClick = (row, column) => {
    console.log(column);
    console.log(row);

    if (column.Header === 'Transaction No.') {
      setData(row?.original);
      setTrans_no(row?.original?.trans_id);
      setIsTablethreeOpen(true);
    }
    if (column.Header === 'Fullname') {
      setData(row?.original);
      setUsername(row?.original?.user_id);
      setIsTable2Open(true);
    }

    // Do something when the column is clicked
  };

  const dateFormat = 'YYYY-MM-DD';
  const currentDate = moment().format(dateFormat);

  const params = '4';
  console.log(currentDate);
  const dateparams = `&createdAt=${currentDate}`;

  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    onChangeDate,
    callbackresponse,
    dateSearch,
    errorResponse,
  } = usePagination(params, dataTable, getBetList, null, dateparams);
  console.log(callbackresponse);

  const onTypeChange = (value) => {
    setFilter((prev) => {
      return { ...prev, type: value };
    });
    console.log(value);
  };

  const onBatchChange = (value) => {
    setFilter((prev) => {
      return { ...prev, batch_type: value };
    });
    console.log(value);
  };

  const callbackBetType = async (res) => {
    console.log(res);
    const { data } = await res;
    setBetTypeOptions(data.betTypes);
  };

  const callbackfilter = async (res) => {
    console.log(res);
    const { data } = await res;

    const reconstructedList = data?.data?.map((data) => {
      return {
        bet_type: data?.bet_type?.bet_type,
        bet_num: data?.bet_num,
        bet_amt: data?.bet_amt,
        trans_no: data?.transaction?.trans_no,
        fullname: data?.user?.first_name + ' ' + data?.user?.last_name,
        user_id: data?.user?._id,
        trans_id: data?.transaction?._id,
      };
    });
    const newdata = { ...data, data: reconstructedList };
    setDataTabble(newdata);
  };
  const filterHandler = () => {
    const data = `${params}?page=1&bet_type_id=${filter.type}&trans_no=${filter.trans_no}&bet_num=${filter.number}&batch_type=${filter.batch_type}&createdAt=${dateSearch}`;
    getBetList(data, callbackfilter);
  };
  const onCancel3 = () => {
    setIsTablethreeOpen(false);
  };
  useEffect(() => {
    const { data } = callbackresponse;

    const reconstructedList = data?.map((data) => {
      return {
        bet_type: data?.bet_type?.bet_type,
        bet_num: data?.bet_num,
        bet_amt: data?.bet_amt,
        trans_no: data?.transaction?.trans_no,
        fullname: data?.user?.first_name + ' ' + data?.user?.last_name,
        user_id: data?.user?._id,
        trans_id: data?.transaction?._id,
        username: data?.user?.username,
        first_name: data?.user?.first_name,
        last_name: data?.user?.last_name,
      };
    });
    const newdata = { ...callbackresponse, data: reconstructedList };
    setDataTabble(newdata);
  }, [callbackresponse]);
  useEffect(() => {
    getBetType(callbackBetType);
  }, []);
  return (
    <div className='betlistcontainer'>
      <div>
        {isTable2Open && (
          <TabletwoModal
            data={data}
            isTable2Open={isTable2Open}
            setIsTable2Open={setIsTable2Open}
            username={username}
            actionHandlertwo={actionHandlertwo}
            actioncall={getBetList}
            dateSearch={dateSearch}
          />
        )}
        {isTablethreeOpen && (
          <TableThreeModal
            actioncall={getBetList}
            isTablethreeOpen={isTablethreeOpen}
            setIsTablethreeOpen={setIsTablethreeOpen}
            trans_no={trans_no}
            data={data}
            onCancel={onCancel3}
            dateSearch={dateSearch}
          />
        )}
        <h6 onClick={() => nav('/dashboard')}>Back</h6>
        <h1 className='text-center'>Bet List</h1>
        <h5 style={{ letterSpacing: '0.8px' }}>Filter:</h5>
        <div className='d-flex' style={{ gap: '20px' }}>
          <div className=''>
            <p>Date</p>
            <DatePicker
              onChange={onChangeDate}
              defaultValue={dayjs(currentDate, dateFormat)}
              format={dateFormat}
            />
          </div>
          <div className=''>
            <p>Bet type</p>
            <Select
              onChange={onTypeChange}
              allowClear
              style={{ width: '150px' }}
            >
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
          </div>
          <div>
            <p>Bet Number</p>
            <Input
              onChange={(e) => {
                setFilter((prev) => {
                  return { ...prev, number: e.target.value };
                });
              }}
            />
          </div>
          <div>
            <p>Transaction No.</p>
            <Input
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
              onChange={onBatchChange}
              allowClear
              style={{ width: '150px' }}
            >
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
          </div>
          <div className='text-center'>
            <p>Action</p>
            <Button onClick={filterHandler} className='mx-1'>
              Filter
            </Button>
            <Button className='mx-1'>Reset</Button>
          </div>
        </div>
        <Table
          dataTable={dataTable}
          columns={columns}
          onNext={onNext}
          onPrevious={onPrevious}
          onFirst={onFirst}
          onLast={onLast}
          isloading={isloading}
          handleColumnClick={handleColumnClick}
          errorResponse={errorResponse}
        />
      </div>
    </div>
  );
};

export default BetListSearch;
