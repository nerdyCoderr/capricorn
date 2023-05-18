import { useEffect, useState } from 'react';
import config from '../api/config';
// import moment from 'moment';

const usePagination = (
  params,
  dataTablelink,
  actioncall,
  otherparams = null,
  dateparams = null,
) => {
  const [callbackresponse, setCallbackResponse] = useState('check');
  const [isloading, setIsloading] = useState(false);

  const [errorResponse, setErrorResposne] = useState(null);

  const urlLinkData = (key) => {
    const urlpage = dataTablelink?.links?.[key] ?? config.base_url;

    const url = new URL(urlpage);
    const searchParams = url.searchParams;
    const additionalParams = otherparams ?? '';

    const queryParams = {
      page: searchParams.get('page'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      trans_no: searchParams.get('trans_no'),
      bet_result: searchParams.get('bet_result'),
      bet_type: searchParams.get('bet_type'),
      bet_num: searchParams.get('bet_num'),
      batch_id: searchParams.get('batch_id'),
    };

    const newParams = `${params}?page=${queryParams.page}${
      queryParams.from ? `&from=${queryParams.from}` : ''
    }${queryParams.to ? `&to=${queryParams.to}` : ''}${
      queryParams.bet_type ? `&bet_type=${queryParams.bet_type}` : ''
    }${queryParams.bet_num ? `&bet_num=${queryParams.bet_num}` : ''}${
      queryParams.bet_result ? `&bet_result=${queryParams.bet_result}` : ''
    }${queryParams.trans_no ? `&trans_no=${queryParams.trans_no}` : ''}${
      queryParams.batch_id ? `&batch_id=${queryParams.batch_id}` : ''
    }${additionalParams}`;

    setIsloading(true);
    actioncall(newParams, callbackPagination);
  };

  const onPrevious = () => {
    urlLinkData('previous');
  };

  const onFirst = () => {
    urlLinkData('first');
  };

  const onNext = () => {
    urlLinkData('next');
  };

  const onLast = () => {
    urlLinkData('last');
  };

  const callbackPagination = async (res) => {
    if (!res?.data) {
      setErrorResposne('No Intertnet');
      setIsloading(false);
      return;
    }
    const { data, status } = await res;
    if (status === 200 || status === 201) {
      setCallbackResponse(data);
    }
    if (status === 404) {
      setErrorResposne(res.statusText);
    }
    if (status === 204) {
      setErrorResposne(res.statusText);
    }
    console.log(res);
    setIsloading(false);
  };

  useEffect(() => {
    const newparams = `${params}?page=1${otherparams ?? ''}${dateparams ?? ''}`;
    setIsloading(true);

    actioncall(newparams, callbackPagination);
  }, []);

  return {
    isloading,

    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
    errorResponse,
  };
};

export default usePagination;
