import { useState } from 'react';

const useFilter = (params, currentDate, actioncall, otherparams = null) => {
  console.log(otherparams);
  const [filter, setFilter] = useState({
    trans_no: '',
    batch_id: '',
    from: otherparams ? otherparams?.from : currentDate,
    to: otherparams ? otherparams?.to : currentDate,
    bet_result: '',
    bet_type: '',
    bet_num: '',
    username: '',
    role: 'admin',
    win_result_switch: false,
  });
  const [callbackfilterRes, setCallbackfilter] = useState();

  const onChangeFrom = (_, dateString) => {
    setFilter((prev) => {
      return { ...prev, from: dateString };
    });
  };

  const onChangeTo = (_, dateString) => {
    setFilter((prev) => {
      return { ...prev, to: dateString };
    });
  };

  const onBatchChange = (value) => {
    setFilter((prev) => {
      return { ...prev, batch_id: value };
    });
  };

  const callbackfilter = async (res) => {
    const { data } = await res;
    setCallbackfilter(data);
  };
  const filterHandler = () => {
    const {
      bet_type: betType,
      trans_no: transNo,
      bet_num: betNumber,
      batch_id: batchType,
      from,
      to,
      bet_result: betResult,
      username: username,
      role,
    } = filter;

    const queryParams = {
      betType: betType ? `&bet_type=${betType}` : '',
      transNo: transNo ? `&trans_no=${transNo}` : '',
      betNumber: betNumber ? `&bet_num=${betNumber}` : '',
      batchType: batchType ? `&batch_id=${batchType}` : '',
      from: from ? `&from=${from}` : '',
      to: to ? `&to=${to}` : '',
      betResult: betResult ? `&bet_result=${betResult}` : '',
      username: username ? `&username=${username}` : '',
      role: role ? `&role=${role}` : '',
      otherparams: otherparams ? otherparams?.userID : '',
    };

    const query = Object.values(queryParams).join('');

    const data = `${params}?page=1${query}`;

    actioncall(data, callbackfilter);
  };

  const resetHandler = () => {
    setFilter({
      trans_no: '',
      batch_id: '',
      from: currentDate,
      to: currentDate,
      bet_result: '',
      bet_type: '',
      bet_num: '',
      username: '',
      role: 'admin',
      win_result_switch: false,
    });
  };

  return {
    setFilter,
    filterHandler,
    onBatchChange,
    onChangeTo,
    onChangeFrom,
    resetHandler,
    filter,
    callbackfilterRes,
  };
};

export default useFilter;
