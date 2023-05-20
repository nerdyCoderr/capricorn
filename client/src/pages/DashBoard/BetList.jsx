import React, { useEffect, useState } from 'react';
import './BetList.scss';
import Table from '../../components/Table/Table';
import { getBetList } from '../../api/request';

import TableThreeModal from '../../components/BetList/TableThreeModal';
import { Button, Input, Space } from 'antd';
import usePagination from '../../hooks/usePagination';
import TabletwoModal from '../../components/BetList/TabletwoModal';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Filter from '../../components/Filter/Filter';
import useFilter from '../../hooks/useFilter';

const BetList = () => {
  dayjs.extend(customParseFormat);

  const nav = useNavigate();
  const [dataTable, setDataTabble] = useState([]);
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [username, setUsername] = useState('');
  const [trans_no, setTrans_no] = useState('');
  const [isTable2Open, setIsTable2Open] = useState(false);
  const [isTablethreeOpen, setIsTablethreeOpen] = useState(false);
  // table number data from table
  const [totalCountTable, setTotalCountTable] = useState(0);
  // total amount from data table
  const [amountForm, setAmountForm] = useState({
    grandTotalAmount: '',
    grandTotalWinAmount: '',
    grandActualWinAmount: '',
  });
  const dateFormat = 'YYYY-MM-DD';
  const currentDate = moment().format(dateFormat);

  const params = '1';

  const dateparams = `&from=${currentDate}&to=${currentDate}`;

  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
    errorResponse,
  } = usePagination(params, dataTable, getBetList, null, dateparams);

  const {
    setFilter,
    filterHandler,
    onBatchChange,
    onChangeTo,
    onChangeFrom,
    resetHandler,
    filter,
    callbackfilterRes,
  } = useFilter(params, currentDate,getBetList);

  const columns = React.useMemo(
    () => [
      {
        Header: 'No.',
        accessor: 'no',
        width: 30,
      },
      {
        Header: 'Username',
        accessor: 'username',
      },
      {
        Header: 'Last Name',
        accessor: 'last_name',
      },
      {
        Header: 'First Name',
        accessor: 'first_name',
      },

      {
        Header: 'Total Bet Amount',
        accessor: 'total_bet_amt',
      },
      {
        Header: 'Date',
        accessor: 'date',
        width: 40,
      },
      {
        Header: 'Action',
        accessor: 'action',
        width: 40,
      },
    ],
    [],
  );

  const actionHandler = (id) => {
    setIsTable2Open(true);
    setUsername(id);
  };

  const actionHandlertwo = (trans_no) => {
    setIsTable2Open(false);
    setIsTablethreeOpen(true);
    setTrans_no(trans_no);
  };

  const handleColumnClick = (row) => {
    setData(row.original);
  };
  const handleColumnClick2 = (row) => {
    setData2(row.original);
  };
  const onCancel3 = () => {
    setIsTable2Open(true);
    setIsTablethreeOpen(false);
  };
  const processResponseData = (response) => {
    const {
      data,
      grandTotalAmount,
      grandActualWinAmount,
      grandTotalWinAmount,
      total,
    } = response;

    setTotalCountTable(total);
    setAmountForm({
      grandTotalAmount,
      grandTotalWinAmount,
      grandActualWinAmount,
    });

    const reconstructedList = data?.map((item, index) => ({
      no: index + 1,
      date: moment(item?.user?.createdAt).format(dateFormat),
      first_name: item?.user?.first_name,
      last_name: item?.user?.last_name,
      total_bet_amt: item?.total_amount,
      username: item?.user?.username,
      action: (
        <div className='text-center'>
          <Button onClick={() => actionHandler(item?.user?._id)}>View</Button>
        </div>
      ),
    }));

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
            isTable2Open={isTable2Open}
            setIsTable2Open={setIsTable2Open}
            username={username}
            actionHandlertwo={actionHandlertwo}
            actioncall={getBetList}
            data={data}
            dateSearch={filter}
            handleColumnClick={handleColumnClick2}
          />
        )}
        {isTablethreeOpen && (
          <TableThreeModal
            dateSearch={filter}
            actioncall={getBetList}
            isTablethreeOpen={isTablethreeOpen}
            setIsTablethreeOpen={setIsTablethreeOpen}
            setIsTable2Open={setIsTable2Open}
            trans_no={trans_no}
            data={data2}
            onCancel={onCancel3}
          />
        )}
        <h6 onClick={() => nav('/dashboard')}>Back</h6>
        <h1 className='text-center'>Transaction List</h1>

        <Filter
          setFilter={setFilter}
          filterHandler={filterHandler}
          onBatchChange={onBatchChange}
          onChangeTo={onChangeTo}
          onChangeFrom={onChangeFrom}
          resetHandler={resetHandler}
          filter={filter}
        />
        <Space className='d-flex mt-5'>
          <div>
            <p>Grand Total Amount</p>
            <Input value={amountForm?.grandTotalAmount} disabled />
          </div>
          <div>
            <p>Grand Total Win Amount</p>
            <Input value={amountForm?.grandTotalWinAmount} disabled />
          </div>
          <div>
            <p>Grand Actual Win Amount</p>
            <Input value={amountForm?.grandActualWinAmount} disabled />
          </div>
        </Space>
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

export default BetList;
