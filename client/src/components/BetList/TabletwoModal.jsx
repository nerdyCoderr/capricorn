import { Button, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import Table from '../Table/Table';
import usePagination from '../../hooks/usePagination';

const TabletwoModal = ({
  isTable2Open,
  setIsTable2Open,
  actionHandlertwo,
  username,
  actioncall,
  data,
  handleColumnClick,
}) => {
  const [dataTable, setDataTabble] = useState([]);
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

  const params = '2';
  const otherparams = `&_id=${username}`;
  const {
    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
  } = usePagination(params, dataTable, actioncall, otherparams);

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
            <Button onClick={() => actionHandlertwo(data?.transaction_id)}>
              View{' '}
            </Button>
          </div>
        ),
      };
    });
    const newdata = { ...callbackresponse, data: reconstructedList };
    setDataTabble(newdata);
  }, [callbackresponse]);

  const handleOk = () => {
    setIsTable2Open(false);
  };
  const handleCancel = () => {
    setIsTable2Open(false);
  };
  return (
    <Modal
      className='modal-container'
      width={1000}
      open={isTable2Open}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className='container'>
        <h5 className='text-left'>
          USERNAME: <span className='firstletter'>{data?.username}</span>
        </h5>
        <h5>
          FULLNAME:{' '}
          <span className='firstletter'>
            {data?.first_name} {data?.last_name}
          </span>
        </h5>
      </div>
      <Table
        dataTable={dataTable}
        columns={columns}
        onNext={onNext}
        onPrevious={onPrevious}
        onFirst={onFirst}
        onLast={onLast}
        handleColumnClick={handleColumnClick}
      />
    </Modal>
  );
};

export default TabletwoModal;
