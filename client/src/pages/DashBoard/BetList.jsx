import React, { useEffect, useState } from 'react';
import './BetList.scss';
import Table from '../../components/Table/Table';
import { getBetList } from '../../api/request';
import { BsEyeFill } from 'react-icons/bs';
import TableThreeModal from '../../components/BetList/TableThreeModal';
import { Space } from 'antd';
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
  const filterType = 'trans_list';
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
  } = useFilter(params, currentDate, getBetList);

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
        Header: 'Bet Amt',
        accessor: 'total_bet_amt',
      },
      {
        Header: 'Win Amt',
        accessor: 'actual_win_amt',
      },
      {
        Header: 'Date',
        accessor: 'date',
        width: 40,
      },
      {
        Header: '#',
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
      date: moment(item?.latest_transaction).format(dateFormat),
      full_name: item?.user?.first_name + ' ' + item?.user?.last_name,
      total_bet_amt: item?.total_amount,
      username: item?.user?.username,
      actual_win_amt: item?.actual_win_amount,
      action: (
        <div className='text-center bg-primary text-white rounded px-2 py-1'>
          <BsEyeFill
            onClick={() => actionHandler(item?.user?._id)}
            color='white'
          />
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
        <h1 className='text-center title'>Transaction List</h1>

        <Filter
          setFilter={setFilter}
          filterHandler={filterHandler}
          onBatchChange={onBatchChange}
          onChangeTo={onChangeTo}
          onChangeFrom={onChangeFrom}
          resetHandler={resetHandler}
          filter={filter}
          filterType={filterType}
        />
        <Space className='d-flex mt-5 text-center profit-container'>
          <div>
            <p>Profit</p>
            <h5>
              {(amountForm?.grandTotalAmount -
                amountForm.grandActualWinAmount) |
                0}
            </h5>
          </div>{' '}
          <div>
            <p>Bet Amount</p>
            <h5>{amountForm?.grandTotalAmount}</h5>
          </div>
          <div>
            <p> Win Amount</p>
            <h5>{amountForm?.grandActualWinAmount}</h5>
          </div>
        </Space>
        <div style={{ height: '200px', overflowY: 'scroll' }}>
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
    </div>
  );
};

export default BetList;
