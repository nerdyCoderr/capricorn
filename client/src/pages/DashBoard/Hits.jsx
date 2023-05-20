import React, { useEffect, useState } from 'react';
import './BetList.scss';
import Table from '../../components/Table/Table';
import { getBetList, getBetListUser } from '../../api/request';

import usePagination from '../../hooks/usePagination';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNavigate } from 'react-router-dom';

import TableThreeModal from '../../components/BetList/TableThreeModal';
import TabletwoModal from '../../components/BetList/TabletwoModal';
import useFilter from '../../hooks/useFilter';
import moment from 'moment';
import Filter from '../../components/Filter/Filter';

const Hits = () => {
  dayjs.extend(customParseFormat);

  const nav = useNavigate();
  const [dataTable, setDataTabble] = useState([]);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [trans_no, setTrans_no] = useState('');

  const [isTable2Open, setIsTable2Open] = useState(false);
  const [isTablethreeOpen, setIsTablethreeOpen] = useState(false);

  // table number data from table
  const [totalCountTable, setTotalCountTable] = useState(0);
  // total amount from data table

  const columns = React.useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'index', // accessor is the "key" in the data
        width: 30,
      },
      {
        Header: 'Bet Type',
        accessor: 'bet_type',
        width: 40,
      },
      {
        Header: 'Bet Number',
        accessor: 'bet_num',
        width: 40,
      },
      {
        Header: 'Bet Amount',
        accessor: 'bet_amt',
        width: 40,
      },

      {
        Header: 'Transaction No.',
        accessor: 'trans_no',
        width: 40,
      },
      {
        Header: 'Fullname',
        accessor: 'fullname',
        width: 40,
      },
      {
        Header: 'Date Created',
        accessor: 'date',
        width: 80,
      },
    ],
    [],
  );

  const params = '4';
  const dateFormat = 'YYYY-MM-DD';
  const filterType = 'bet_list';
  const currentDate = moment().format(dateFormat);

  const dateparams = `&from=${currentDate}&to=${currentDate}`;

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
      console.log(row?.original);
      setData(row?.original);
      setTrans_no(row?.original?.trans_no);
      setIsTablethreeOpen(true);
    }
    if (column.Header === 'Fullname') {
      setData(row?.original);
      setUsername(row?.original?.user_id);
      setIsTable2Open(true);
    }

    // Do something when the column is clicked
  };

  const handleColumnClick2 = (row) => {
    setData(row?.original);
  };

  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
    errorResponse,
  } = usePagination(params, dataTable, getBetListUser, null, dateparams);

  const {
    setFilter,
    filterHandler,
    onBatchChange,
    onChangeTo,
    onChangeFrom,
    resetHandler,
    filter,
    callbackfilterRes,
  } = useFilter(params, currentDate, getBetListUser);

  const onCancel3 = () => {
    setIsTablethreeOpen(false);
  };

  const processResponseData = (response) => {
    const { data, total } = response;

    setTotalCountTable(total);

    const reconstructedList = data?.map((data, index) => {
      let betNum;

      if (data?.bet_type?.bet_type === 'L2') {
        betNum = data?.bet_num.toString().padStart(2, '0');
      }
      if (data?.bet_type?.bet_type === '3D') {
        betNum = data?.bet_num.toString().padStart(3, '0');
      }
      if (data?.bet_type?.bet_type === '4D') {
        betNum = data?.bet_num.toString().padStart(4, '0');
      }
      return {
        index: index + 1,
        bet_type: data?.bet_type?.bet_type,
        bet_num: betNum,
        bet_amt: data?.bet_amt,
        trans_no: data?.transaction?.trans_no,
        fullname: data?.user?.first_name + ' ' + data?.user?.last_name,
        user_id: data?.user?._id,
        trans_id: data?.transaction?._id,
        username: data?.user?.username,
        first_name: data?.user?.first_name,
        last_name: data?.user?.last_name,
        date: moment(data?.createdAt).format(dateFormat),
      };
    });

    return { ...response, data: reconstructedList };
  };

  useEffect(() => {
    setDataTabble(processResponseData(callbackresponse));
  }, [callbackresponse]);

  useEffect(() => {
    if (callbackfilterRes) {
      const processedData = processResponseData(callbackfilterRes);
      setDataTabble(processedData);
    }
  }, [callbackfilterRes]);
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
            handleColumnClick={handleColumnClick2}
            dateSearch={filter}
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
            dateSearch={filter}
          />
        )}
        <h6 onClick={() => nav('/dashboard')}>Back</h6>
        <h1 className='text-center'>Hits</h1>
        <Filter
          filterType={filterType}
          setFilter={setFilter}
          filterHandler={filterHandler}
          onBatchChange={onBatchChange}
          onChangeTo={onChangeTo}
          onChangeFrom={onChangeFrom}
          resetHandler={resetHandler}
          filter={filter}
          params={params}
        />

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
          totalCountTable={totalCountTable}
        />
      </div>
    </div>
  );
};

export default Hits;
