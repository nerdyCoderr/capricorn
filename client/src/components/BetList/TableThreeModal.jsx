import React, { useEffect, useState } from 'react';
import Table from '../Table/Table';
import { Button, Modal } from 'antd';

import usePagination from '../../hooks/usePagination';
import './TableThreeModal.scss';
function TableThreeModal({
  isTablethreeOpen,
  setIsTablethreeOpen,
  setIsTable2Open,
  actioncall,
  trans_no,
  data,
}) {
  const [dataTable, setDataTabble] = useState([]);
  const params = '3';

  const otherparams = `&transaction_id=${trans_no}`;
  const columns = React.useMemo(
    () => [
      {
        Header: 'Bet Number',
        accessor: 'bet_num', // accessor is the "key" in the data
      },
      {
        Header: 'Bet Amount',
        accessor: 'bet_amt', // accessor is the "key" in the data
      },
      {
        Header: 'Win Amount',
        accessor: 'win_amt', // accessor is the "key" in the data
      },
      {
        Header: 'Bet Type',
        accessor: 'bet_type', // accessor is the "key" in the data
      },
    ],
    [],
  );
  console.log(data);
  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
  } = usePagination(params, dataTable, actioncall, otherparams, '');

  useEffect(() => {
    const { data } = callbackresponse;
    console.log(data);
    const reconstructedList = data?.map((data) => {
      return {
        bet_type: data?.bet_type?.bet_type,
        bet_num: data?.bet_num,
        bet_amt: data?.bet_amt,
        win_amt: data?.win_amt,
      };
    });
    const newdata = { ...callbackresponse, data: reconstructedList };
    console.log(newdata);
    setDataTabble(newdata);
  }, [callbackresponse]);

  const handleOk = () => {
    setIsTablethreeOpen(false);
  };

  return (
    <Modal
      className='modal-container'
      width={1000}
      title={`Transaction No: ${data?.trans_no}`}
      open={isTablethreeOpen}
      onCancel={() => {
        setIsTable2Open(true);
        setIsTablethreeOpen(false);
      }}
      footer={[
        <Button size='middle' key='submit' type='primary' onClick={handleOk}>
          OK
        </Button>,
      ]}
    >
      {isloading ? (
        <p>loading</p>
      ) : (
        <Table
          dataTable={dataTable}
          columns={columns}
          onNext={onNext}
          onPrevious={onPrevious}
          onFirst={onFirst}
          onLast={onLast}
        />
      )}
    </Modal>
  );
}

export default TableThreeModal;
