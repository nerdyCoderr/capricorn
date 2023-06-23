import React, { useEffect, useState } from 'react';

import { Button, Modal } from 'antd';

import usePagination from '../../hooks/usePagination';
import './TableThreeModal.scss';
import AntTable from '../Table/AntTable';
import Filter from '../Filter/Filter';
import moment from 'moment';
import useFilter from '../../hooks/useFilter';
import { getAdminTransList, getBetList } from '../../api/request';

function TableThreeModal({
  isTablethreeOpen,
  setIsTablethreeOpen,
  actioncall,
  trans_no,
  data,
  onCancel,
  dateSearch,
  setIsTable2Open,
  filterType,
}) {
  const [dataTable, setDataTabble] = useState([]);
  const [totalCountTable, setTotalCountTable] = useState(0);
  const params = '3';

  const dateparams = `&from=${dateSearch?.from}&to=${dateSearch?.to}`;
  const otherparams = {
    userID: `&trans_no=${trans_no}`,
    from: dateSearch?.from,
    to: dateSearch?.to,
  };
  const dateFormat = 'YYYY-MM-DD';
  const filterTypeModal = 'modal3';
  const currentDate = moment().format(dateFormat);

  const columns = React.useMemo(
    () => [
      {
        title: 'Bet No',
        dataIndex: 'bet_num',
        fixed: 'left',
      },
      {
        title: 'Bet Amt',
        dataIndex: 'bet_amt',
      },
      {
        title: 'Win Amt',
        dataIndex: 'win_amt',
      },
      {
        title: 'Bet Type',
        dataIndex: 'bet_type',
      },
    ],
    [],
  );

  const adminData = React.useMemo(() => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const refcode = searchParams.get('ref_code');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return { refcode: refcode, from: from, to: to };
  }, []);

  const { isloading, onPrevious, onFirst, onLast, onNext, callbackresponse } =
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
        bet_type: data?.bet_type?.bet_type,
        bet_num: betNum,
        bet_amt: data?.bet_amt,
        win_amt: data?.result ? data?.win_amt : 0,
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

  const handleOk = () => {
    setIsTable2Open(true);
    setIsTablethreeOpen(false);
  };

  return (
    <>
      <Modal
        className='modal-container'
        width={1000}
        title={
          <div>
            <div>Transaction No:</div>
            <div>{data?.trans_no}</div>
          </div>
        }
        open={isTablethreeOpen}
        onCancel={onCancel}
        footer={
          filterType === 'trans_list'
            ? [
                <Button
                  size='middle'
                  key='submit'
                  type='primary'
                  onClick={handleOk}
                >
                  OK
                </Button>,
              ]
            : null
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
          filterType={filterTypeModal}
        />
        {isloading ? (
          <p>loading</p>
        ) : (
          <div className='mt-3'>
            <AntTable
              dataTable={dataTable}
              columns={columns}
              onNext={onNext}
              onPrevious={onPrevious}
              onFirst={onFirst}
              onLast={onLast}
              totalCountTable={totalCountTable}
              scroll={{ x: 450, y: 400 }}
            />
          </div>
        )}
      </Modal>
    </>
  );
}

export default TableThreeModal;
