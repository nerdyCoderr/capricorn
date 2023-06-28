/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import './BetList.scss';
// import Table from '../../components/Table/Table';
import { getAdminTransList, getBetList } from '../../api/request';
import { BsEyeFill } from 'react-icons/bs';
import TableThreeModal from '../../components/BetList/TableThreeModal';
import { Button, Space, Table } from 'antd';
import usePagination from '../../hooks/usePagination';
import TabletwoModal from '../../components/BetList/TabletwoModal';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import Filter from '../../components/Filter/Filter';
import useFilter from '../../hooks/useFilter';
import AntTable from '../../components/Table/AntTable';
import BackButton from '../../components/Layout/BackButton';

const BetList = () => {
  dayjs.extend(customParseFormat);

  const adminData = React.useMemo(() => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const refcode = searchParams.get('ref_code');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return { refcode: refcode, from: from, to: to };
  }, []);

  const title = 'Transaction List';
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
  const dateparams = `&from=${adminData.from ?? currentDate}&to=${
    adminData.to ?? currentDate
  }`;
  const otherparams = `&ref_code=${adminData.refcode}`;
  // other params for admin use

  const otherparams2 = {
    from: adminData.from ?? currentDate,
    to: adminData.to ?? currentDate,
    refcode: `&ref_code=${adminData.refcode}`,
  };
  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
    errorResponse,
  } = usePagination(
    params,
    dataTable,
    adminData?.refcode ? getAdminTransList : getBetList,
    otherparams,
    dateparams,
  );

  const {
    setFilter,
    filterHandler,
    onBatchChange,
    onChangeTo,
    onChangeFrom,
    resetHandler,
    filter,
    callbackfilterRes,
  } = useFilter(
    params,
    currentDate,
    adminData?.refcode ? getAdminTransList : getBetList,
    adminData?.refcode ? otherparams2 : null,
  );

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

  const actionHandler = (id) => {
    setIsTable2Open(true);
    setUsername(id);
  };

  const actionHandlertwo = (trans_no) => {
    setIsTable2Open(false);
    setIsTablethreeOpen(true);
    setTrans_no(trans_no);
  };

  const handleColumnClick = (record, _) => {
    setData(record);
  };
  const handleColumnClick2 = (record, _) => {
    setData2(record);
  };
  const onCancel3 = () => {
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
      date: moment(item?.latest_transaction).format(dateFormat),
      full_name: item?.user?.first_name + ' ' + item?.user?.last_name,
      total_bet_amt: item?.total_amount,
      username: item?.user?.username,
      actual_win_amt: item?.actual_win_amount,
      action: (
        <Button onClick={() => actionHandler(item?.user?._id)}>View</Button>
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
            actioncall={adminData?.refcode ? getAdminTransList : getBetList}
            data={data}
            dateSearch={adminData.refcode ? adminData : filter}
            handleColumnClick={handleColumnClick2}
          />
        )}
        {isTablethreeOpen && (
          <TableThreeModal
            dateSearch={adminData.refcode ? adminData : filter}
            actioncall={adminData?.refcode ? getAdminTransList : getBetList}
            isTablethreeOpen={isTablethreeOpen}
            setIsTablethreeOpen={setIsTablethreeOpen}
            setIsTable2Open={setIsTable2Open}
            trans_no={trans_no}
            data={data2}
            onCancel={onCancel3}
            filterType={filterType}
          />
        )}
        <BackButton
          title={title}
          adminData={adminData}
        />

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
        <Space
          style={{
            maxWidth: '1280px',
            margin: 'auto',
            width: '100%',
            paddingLeft: '0',
          }}
          className='d-flex mt-5 text-center profit-container container'
        >
          <div>
            <p>Bet Amount</p>
            <h5>{amountForm?.grandTotalAmount | '- -'}</h5>
          </div>
          <div>
            <p> Win Amount</p>
            <h5>{amountForm?.grandActualWinAmount | '- -'}</h5>
          </div>
          <div>
            <p>Profit</p>
            <h5>
              {(amountForm?.grandTotalAmount -
                amountForm.grandActualWinAmount) |
                '- -'}
            </h5>
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
          handleColumnClick={handleColumnClick}
          errorResponse={errorResponse}
          totalCountTable={totalCountTable}
          scroll={{ x: 500, y: 300 }}
        />
      </div>
    </div>
  );
};

export default BetList;
