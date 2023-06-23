/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import './BetList.scss';

import { getBetList } from '../../api/request';

import usePagination from '../../hooks/usePagination';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNavigate } from 'react-router-dom';

import TableThreeModal from '../../components/BetList/TableThreeModal';
import TabletwoModal from '../../components/BetList/TabletwoModal';
import useFilter from '../../hooks/useFilter';
import moment from 'moment';
import Filter from '../../components/Filter/Filter';
import Table from '../../components/Table/Table';
import AntTable from '../../components/Table/AntTable';
import BackButton from '../../components/Layout/BackButton';

const BetListSearch = () => {
  dayjs.extend(customParseFormat);
  const title = 'Bet List';
  const nav = useNavigate();
  const [dataTable, setDataTabble] = useState([]);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [trans_no, setTrans_no] = useState('');

  const [isTable2Open, setIsTable2Open] = useState(false);
  const [isTablethreeOpen, setIsTablethreeOpen] = useState(false);

  // table number data from table
  const [totalCountTable, setTotalCountTable] = useState(0);
  // total amount from data table

  const columns = React.useMemo(
    () => [
      {
        title: 'Username',
        dataIndex: 'username',
        width: 40,
        fixed: 'left',
      },
      {
        title: 'Type',
        dataIndex: 'bet_type',
        width: 40,
      },

      {
        title: 'Number',
        dataIndex: 'bet_num',
        width: 40,
      },
      {
        title: 'Bet Amount',
        dataIndex: 'bet_amt',
        width: 40,
      },
      {
        title: 'Win Amount',
        dataIndex: 'actual_amount',
        width: 40,
      },

      {
        title: 'Trans No.',
        dataIndex: 'trans_no',
        width: 40,
      },
      {
        title: 'Date Created',
        dataIndex: 'date',
        width: 80,
      },
    ],
    [],
  );
  const params = '4';
  const dateFormat = 'YYYY-MM-DD';
  const filterType = 'bet_list';
  const currentDate = moment().format(dateFormat);

  const dateparams = `&from=${currentDate}&to=${currentDate}`;

  const actionHandlertwo = (trans_no) => {
    setIsTable2Open(false);
    setIsTablethreeOpen(true);
    setTrans_no(trans_no);
  };

  const handleColumnClick = (record, e) => {
    const columnIndex = e.target.cellIndex;

    if (columnIndex === 4) {
      setData(record);
      setTrans_no(record?.trans_no);
      setIsTablethreeOpen(true);
    }
    if (columnIndex === 'Fullname') {
      setData(record);
      setTrans_no(record?.trans_no);
      setIsTable2Open(true);
    }
  };

  const handleColumnClick2 = (row) => {
    setData(row?.original);
  };

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

  const onCancel3 = () => {
    setIsTablethreeOpen(false);
  };

  const processResponseData = (response) => {
    const { data, total } = response;

    setTotalCountTable(total);

    const reconstructedList = data?.map((data, index) => {
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
        trans_no: data?.transaction?.trans_no,
        win_amount: data?.transaction?.win_amount,
        actual_amount: data?.transaction?.actual_win_amount,
        fullname: data?.user?.first_name + ' ' + data?.user?.last_name,
        user_id: data?.user?._id,
        trans_id: data?.transaction?._id,
        username: data?.user?.username,
        first_name: data?.user?.first_name,
        last_name: data?.user?.last_name,
        date: moment(data?.createdAt).format(dateFormat),
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

  return (
    <div className='betlistcontainer'>
      <div>
        {isTable2Open && (
          <TabletwoModal
            data={data}
            isTable2Open={isTable2Open}
            setIsTable2Open={setIsTable2Open}
            username={username}
            actionHandlertwo={actionHandlertwo}
            actioncall={getBetList}
            handleColumnClick={handleColumnClick2}
            dateSearch={filter}
          />
        )}
        {isTablethreeOpen && (
          <TableThreeModal
            actioncall={getBetList}
            isTablethreeOpen={isTablethreeOpen}
            setIsTablethreeOpen={setIsTablethreeOpen}
            trans_no={trans_no}
            data={data}
            onCancel={onCancel3}
            dateSearch={filter}
            filterType={filterType}
          />
        )}
        <BackButton title={title} />
        <Filter
          filterType={filterType}
          setFilter={setFilter}
          filterHandler={filterHandler}
          onBatchChange={onBatchChange}
          onChangeTo={onChangeTo}
          onChangeFrom={onChangeFrom}
          resetHandler={resetHandler}
          filter={filter}
          params={params}
        />

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
          scroll={{ x: 700, y: 400 }}
        />
      </div>
    </div>
  );
};

export default BetListSearch;
