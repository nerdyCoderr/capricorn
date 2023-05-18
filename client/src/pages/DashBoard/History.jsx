import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table/Table';
import './History.scss';
import { getBetListUser } from '../../api/request';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import usePagination from '../../hooks/usePagination';
import { Button, DatePicker } from 'antd';
import TableThreeModal from '../../components/BetList/TableThreeModal';
const History = () => {
  dayjs.extend(customParseFormat);
  const nav = useNavigate();
  const [dataTable, setDataTabble] = useState([]);
  const [transNO, setTransNo] = useState();
  const [isTablethreeOpen, setIsTablethreeOpen] = useState(false);
  const [data, setData] = useState([]);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Transaction No.',
        accessor: 'trans_no', // accessor is the "key" in the data
      },
      {
        Header: 'Total Bet No.',
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
  const now = new Date();
  const dateString = now.toISOString().slice(0, 10);

  const params = '2';
  const dateparams = `&date_created=${dateString}`;

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
  } = usePagination(params, dataTable, getBetListUser, '', dateparams);

  const actionHandler = (trans_no) => {
    setIsTablethreeOpen(true);
    setTransNo(trans_no);
  };

  const handleColumnClick = (row) => {
    setData(row.original);
  };

  const onCancel3 = () => {
    setIsTablethreeOpen(false);
  };

  useEffect(() => {
    const { data } = callbackresponse;

    console.log(data);
    const reconstructedList = data?.map((data) => {
      return {
        total_bet_amt: data?.total_bet_amt,
        trans_no: data?.trans_no,
        action: (
          <div className='text-center'>
            {' '}
            <Button onClick={() => actionHandler(data?.transaction_id)}>
              View{' '}
            </Button>
          </div>
        ),
      };
    });
    const newdata = { ...callbackresponse, data: reconstructedList };
    setDataTabble(newdata);
  }, [callbackresponse]);

  return (
    <div className='historycontainer '>
      <h6 onClick={() => nav('/dashboard')}>Back</h6>
      <h1 className='text-center'>Transaction History</h1>
      <div>
        <h5 style={{ letterSpacing: '0.8px' }}>Filter:</h5>
        <DatePicker
          onChange={onChangeDate}
          defaultValue={dayjs(dateString, dateFormat)}
          format={dateFormat}
        />
      </div>
      {isTablethreeOpen && (
        <TableThreeModal
          dateSearch={dateSearch}
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
      />
    </div>
  );
};

export default History;
