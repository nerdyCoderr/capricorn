import { Button, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import AntTable from '../Table/AntTable';
import moment from 'moment';
import useFilter from '../../hooks/useFilter';
import { getAdminTransList, getBetList } from '../../api/request';
import Filter from '../Filter/Filter';

const TabletwoModal = ({
  isTable2Open,
  setIsTable2Open,
  actionHandlertwo,
  username,
  actioncall,
  data,
  handleColumnClick,
  dateSearch,
}) => {
  const adminData = React.useMemo(() => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const refcode = searchParams.get('ref_code');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return { refcode: refcode, from: from, to: to };
  }, []);
  const [dataTable, setDataTabble] = useState([]);
  const [totalCountTable, setTotalCountTable] = useState(0);
  const columns = React.useMemo(
    () => [
      {
        title: 'Trans No.',
        dataIndex: 'trans_no',
      },
      {
        title: 'Batch ID',
        dataIndex: 'batch_ID',
      },

      {
        title: 'Bet Amount',
        dataIndex: 'total_bet_amt', // dataIndex is the "key" in the data
      },
      {
        title: 'Win Amt',
        dataIndex: 'win_amt', // dataIndex is the "key" in the data
      },
      {
        title: 'Action',
        dataIndex: 'action',
      },
    ],
    [],
  );

  const params = '2';
  console.log(dateSearch);
  const otherparams = {
    userID: `&user_id=${username}`,
    from: dateSearch?.from,
    to: dateSearch?.to,
  };
  const dateFormat = 'YYYY-MM-DD';
  const filterType = 'modal2';
  const currentDate = moment().format(dateFormat);

  const dateparams = `&from=${dateSearch?.from}&to=${dateSearch?.to}`;
  const { onPrevious, onFirst, onLast, onNext, callbackresponse } =
    usePagination(
      params,
      dataTable,
      actioncall,
      otherparams?.userID,
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
    otherparams,
  );

  const processResponseData = (response) => {
    const { data, total } = response;

    setTotalCountTable(total);
    const reconstructedList = data?.map((data) => {
      return {
        total_bet_amt: data?.total_amount,
        batch_ID: data?.batch_id,
        trans_no: data?.trans_no,
        win_amt: data?.actual_win_amount,
        action: (
          <div className='text-center'>
            {' '}
            <Button onClick={() => actionHandlertwo(data?.trans_no)}>
              View{' '}
            </Button>
          </div>
        ),
      };
    });

    return { ...response, data: reconstructedList };
  };
  useEffect(() => {
    if (callbackfilterRes) {
      const processedData = processResponseData(callbackfilterRes);
      setDataTabble(processedData);
    }
  }, [callbackfilterRes]);

  useEffect(() => {
    setDataTabble(processResponseData(callbackresponse));
  }, [callbackresponse]);

  const handleOk = () => {
    setIsTable2Open(false);
  };
  const handleCancel = () => {
    setIsTable2Open(false);
  };
  return (
    <>
      <Modal
        className='modal-container'
        width={1000}
        open={isTable2Open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        title={
          <div>
            <div>USERNAME:</div>
            <div className='firstletter'>{data?.username}</div>
            <div>FULLNAME:</div>
            <div className='firstletter'>{data?.full_name}</div>
          </div>
        }
      >
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
        <AntTable
          dataTable={dataTable}
          columns={columns}
          onNext={onNext}
          onPrevious={onPrevious}
          onFirst={onFirst}
          onLast={onLast}
          handleColumnClick={handleColumnClick}
          totalCountTable={totalCountTable}
          scroll={{ x: 300, y: 300 }}
        />
      </Modal>
    </>
  );
};

export default TabletwoModal;
