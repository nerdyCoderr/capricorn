import React, { useEffect, useState } from 'react';
import './AdminTransList.scss';
import BackButton from '../../components/Layout/BackButton';
import AntTable from '../../components/Table/AntTable';
import usePagination from '../../hooks/usePagination';
import useFilter from '../../hooks/useFilter';
import moment from 'moment';
import { getAdminTransList } from '../../api/request';
import Filter from '../../components/Filter/Filter';
import { Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const AdminTransList = () => {
  const title = 'Admin Trans. List';
  const nav = useNavigate();
  const dateFormat = 'YYYY-MM-DD';

  const adminData = React.useMemo(() => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const refcode = searchParams.get('ref_code');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return { refcode: refcode, from: from, to: to };
  }, []);
  console.log(adminData);
  const currentDate = moment().format(dateFormat);

  const params = '0';
  const filterType = 'trans_list';
  const [totalCountTable, setTotalCountTable] = useState(0);
  const dateparams = `&from=${adminData.from ?? currentDate}&to=${
    adminData.to ?? currentDate
  }`;

  const [dataTable, setDataTabble] = useState([]);
  const [amountForm, setAmountForm] = useState({
    grandTotalAmount: '',
    grandTotalWinAmount: '',
    grandActualWinAmount: '',
  });

  const columns = React.useMemo(
    () => [
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        fixed: 'left',
        width: 100,
      },
      {
        title: 'Fullname',
        dataIndex: 'full_name',
        key: 'total_bet_amt',
      },
      {
        title: 'Bet Amt',
        dataIndex: 'total_bet_amt',
        key: 'total_bet_amt',
      },
      {
        title: 'Win Amt',
        dataIndex: 'actual_win_amt',
        key: 'actual_win_amt',
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        width: 100,
      },
    ],
    [],
  );

  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
    errorResponse,
  } = usePagination(params, dataTable, getAdminTransList, null, dateparams);

  const {
    setFilter,
    filterHandler,
    onBatchChange,
    onChangeTo,
    onChangeFrom,
    resetHandler,
    filter,
    callbackfilterRes,
  } = useFilter(params, currentDate, getAdminTransList);

  // const handleKey = (Key) => (event) => {
  //   setTableData({ ...tableData, [Key]: event.target.value });
  //   return;
  // };
  const actionHandler = (id) => {
    nav(
      `/transaction-list?ref_code=${id}&from=${
        adminData.from ?? filter.from
      }&to=${adminData.to ?? filter.to}`,
    );
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

    const reconstructedList = data?.map((item) => ({
      date: moment(item?.admin?.latest_transaction).format(dateFormat),
      full_name: item?.admin?.first_name + ' ' + item?.admin?.last_name,
      total_bet_amt: item?.total_amount,
      username: item?.admin?.username,
      actual_win_amt: item?.actual_win_amount,
      action: (
        <Button onClick={() => actionHandler(item?.admin?.ref_code)}>
          View
        </Button>
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
    <div className='adminTranslist'>
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
};

export default AdminTransList;
