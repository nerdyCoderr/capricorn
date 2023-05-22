import React from 'react';
import './antTable.scss';
import { Button, Space } from 'antd';
import { Table } from 'antd';
import {
  TfiAngleLeft,
  TfiAngleRight,
  TfiAngleDoubleLeft,
  TfiAngleDoubleRight,
} from 'react-icons/tfi';

const AntTable = ({
  isloading,
  columns,
  dataTable,
  onNext,
  onFirst,
  onPrevious,
  onLast,
  handleColumnClick = undefined,
  // errorResponse = null,
  scroll,
  totalCountTable,
}) => {
  const { data: rawData, links, currentPage, totalPages } = dataTable;

  return (
    <>
      <div className='ant-table-container mt-3'>
        <Table
          pagination={false}
          responsive
          columns={columns}
          dataSource={rawData}
          loading={isloading}
          scroll={scroll}
          onRow={(record) => {
            return {
              onClick: (e) => handleColumnClick(record, e),
            };
          }}
        />
      </div>
      <div className='total-count mt-2'>Total: {totalCountTable ?? 0}</div>
      <Space className='pagination mt-3'>
        <Button
          className='buton-custom'
          type='primary'
          onClick={onFirst}
          disabled={links?.first === null}
        >
          <TfiAngleDoubleLeft size={18} />
        </Button>
        <Button
          className='buton-custom'
          type='primary'
          onClick={onPrevious}
          disabled={links?.previous === null}
        >
          <TfiAngleLeft />
        </Button>
        <p
          style={{
            borderBottom: 'solid 1px gray',
            fontWeight: 'bold',
            alignSelf: 'center',
            margin: '0 0.8rem',
          }}
        >
          {currentPage + '/' + totalPages}
        </p>
        <Button
          className='buton-custom'
          type='primary'
          onClick={onNext}
          disabled={links?.next === null}
        >
          <TfiAngleRight />
        </Button>
        <Button
          className='buton-custom'
          type='primary'
          onClick={onLast}
          disabled={links?.last === null}
        >
          <TfiAngleDoubleRight size={18} />
        </Button>
      </Space>
    </>
  );
};

export default AntTable;
