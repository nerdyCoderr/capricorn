import { Button, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import usePagination from '../../hooks/usePagination';
import AntTable from '../Table/AntTable';

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
  const [dataTable, setDataTabble] = useState([]);
  const [totalCountTable, setTotalCountTable] = useState(0);
  const columns = React.useMemo(
    () => [
      {
        title: 'Trans No.',
        dataIndex: 'trans_no',
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
  const otherparams = `&user_id=${username}`;

  const dateparams = `&from=${dateSearch?.from}&to=${dateSearch?.to}`;
  const { onPrevious, onFirst, onLast, onNext, callbackresponse } =
    usePagination(params, dataTable, actioncall, otherparams, dateparams);

  useEffect(() => {
    const { data, total } = callbackresponse;
    setTotalCountTable(total);
    const reconstructedList = data?.map((data) => {
      return {
        total_bet_amt: data?.total_amount,
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
  );
};

export default TabletwoModal;
