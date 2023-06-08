import React, { useEffect, useState } from 'react';
import './WinNumberHistory.scss';
import BackButton from '../../components/Layout/BackButton';
import AntTable from '../../components/Table/AntTable';
import usePagination from '../../hooks/usePagination';
import useFilter from '../../hooks/useFilter';
import moment from 'moment';
import { getWinNumberHistory } from '../../api/request';
import Filter from '../../components/Filter/Filter';
import { Space } from 'antd';

function WinNumberHistory() {
  const title = 'Win Number History';

  const dateFormat = 'YYYY-MM-DD';
  const currentDate = moment().format(dateFormat);
  const params = '';
  const filterType = 'winHistory';
  const [totalCountTable, setTotalCountTable] = useState(0);
  const dateparams = `&from=${currentDate}&to=${currentDate}`;

  const [dataTable, setDataTabble] = useState([]);
  const [amountForm, setAmountForm] = useState({
    grandTotalAmount: '',
    grandTotalWinAmount: '',
    grandActualWinAmount: '',
  });
  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
    errorResponse,
  } = usePagination(params, dataTable, getWinNumberHistory, null, dateparams);

  const {
    setFilter,
    filterHandler,
    onBatchChange,
    onChangeTo,
    onChangeFrom,
    resetHandler,
    filter,
    callbackfilterRes,
  } = useFilter(params, currentDate, getWinNumberHistory);
  const columns = React.useMemo(
    () => [
      {
        title: 'Bet Number',
        dataIndex: 'bet_number',
        key: 'bet_number',
        fixed: 'left',
      },
      {
        title: 'Bet Type',
        dataIndex: 'bet_type',
        key: 'bet_type',
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },
    ],
    [],
  );

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

    const reconstructedList = data?.map((item) => ({
      date: moment(item?.createdAt).format(dateFormat),
      bet_number: item?.bet_num,
      bet_type: item?.bet_type?.bet_type,
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
    <div className='win-number-history'>
      <BackButton title={title} />
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
      <Space className='d-flex mt-5 text-center profit-container container'>
        <div>
          <p>Profit</p>
          <h5>
            {(amountForm?.grandTotalAmount - amountForm.grandActualWinAmount) |
              '- -'}
          </h5>
        </div>
        <div>
          <p>Bet Amount</p>
          <h5>{amountForm?.grandTotalAmount | '- -'}</h5>
        </div>
        <div>
          <p> Win Amount</p>
          <h5>{amountForm?.grandActualWinAmount | '- -'}</h5>
        </div>
      </Space>

      <AntTable
        dataTable={dataTable}
        columns={columns}
        onNext={onNext}
        onPrevious={onPrevious}
        onFirst={onFirst}
        onLast={onLast}
        isloading={isloading}
        errorResponse={errorResponse}
        totalCountTable={totalCountTable}
        scroll={{ x: 500, y: 300 }}
      />
    </div>
  );
}

export default WinNumberHistory;
