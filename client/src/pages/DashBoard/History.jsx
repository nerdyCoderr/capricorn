import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table/Table';
import './History.scss';
import { getBetListUser } from '../../api/request';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import usePagination from '../../hooks/usePagination';
import { Button } from 'antd';
import moment from 'moment';
import TableThreeModal from '../../components/BetList/TableThreeModal';
import useFilter from '../../hooks/useFilter';
import Filter from '../../components/Filter/Filter';
const History = () => {
  dayjs.extend(customParseFormat);
  const nav = useNavigate();
  const [dataTable, setDataTabble] = useState([]);
  const [transNO, setTransNo] = useState();
  const [isTablethreeOpen, setIsTablethreeOpen] = useState(false);
  const [data, setData] = useState([]);
  const [totalCountTable, setTotalCountTable] = useState(0);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Transaction No.',
        accessor: 'trans_no', // accessor is the "key" in the data
      },
      {
        Header: 'Total Bet Amount',
        accessor: 'total_bet_amt', // accessor is the "key" in the data
      },
      {
        Header: 'Action',
        accessor: 'action',
      },
    ],
    [],
  );

  const dateFormat = 'YYYY-MM-DD';

  const currentDate = moment().format(dateFormat);

  const params = '2';
  const dateparams = `&from=${currentDate}&to=${currentDate}`;

  const {
    setFilter,
    filterHandler,
    onBatchChange,
    onChangeTo,
    onChangeFrom,
    resetHandler,
    filter,
    callbackfilterRes,
  } = useFilter(params, currentDate);

  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,

    callbackresponse,
    errorResponse,
  } = usePagination(params, dataTable, getBetListUser, '', dateparams);

  const actionHandler = (trans_no) => {
    setIsTablethreeOpen(true);
    setTransNo(trans_no);
  };
  const filterType = 'transaction_history';
  const handleColumnClick = (row) => {
    setData(row.original);
  };

  const onCancel3 = () => {
    setIsTablethreeOpen(false);
  };

  const processResponseData = (response) => {
    const { data, total } = response;
    setTotalCountTable(total);

    const reconstructedList = data?.map((data) => {
      return {
        total_bet_amt: data?.total_amount,
        trans_no: data?.trans_no,
        action: (
          <div className='text-center'>
            {' '}
            <Button onClick={() => actionHandler(data?.trans_no)}>View </Button>
          </div>
        ),
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
      setDataTabble(processResponseData(processedData));
    }
  }, [callbackfilterRes]);

  useEffect(() => {}, [callbackfilterRes]);
  return (
    <div className='historycontainer '>
      <h6 onClick={() => nav('/dashboard')}>Back</h6>
      <h1 className='text-center'>Transaction History</h1>
      <Filter
        filterType={filterType}
        setFilter={setFilter}
        filterHandler={filterHandler}
        onBatchChange={onBatchChange}
        onChangeTo={onChangeTo}
        onChangeFrom={onChangeFrom}
        resetHandler={resetHandler}
        filter={filter}
      />
      {isTablethreeOpen && (
        <TableThreeModal
          dateSearch={filter}
          isTablethreeOpen={isTablethreeOpen}
          actioncall={getBetListUser}
          setIsTablethreeOpen={setIsTablethreeOpen}
          trans_no={transNO}
          data={data}
          onCancel={onCancel3}
        />
      )}
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
  );
};

export default History;
