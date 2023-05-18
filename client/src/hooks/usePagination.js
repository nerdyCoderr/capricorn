import { useEffect, useState } from 'react';
import moment from 'moment';

const usePagination = (
  params,
  dataTablelink,
  actioncall,
  otherparams = null,
  dateparams = null,
) => {
  const dateFormat = 'YYYY-MM-DD';
  const currentDate = moment().format(dateFormat);

  const [callbackresponse, setCallbackResponse] = useState('check');
  const [isloading, setIsloading] = useState(false);
  const [dateSearch, setDateSearch] = useState(currentDate);
  const [errorResponse, setErrorResposne] = useState(null);
  const onPrevious = () => {
    const urlpage = dataTablelink?.links?.previous;
    const url = new URL(urlpage);
    const searchParams = url.searchParams;
    const page = searchParams.get('page');
    const createdAt = searchParams.get('createdAt');
    setIsloading(true);
    const newparams = `${params}?page=${page}${
      createdAt ? `&createdAt=${createdAt}` : ''
    }${otherparams ?? ''}`;
    actioncall(newparams, callbackPagination);
  };

  const onFirst = () => {
    const urlpage = dataTablelink?.links?.first;
    const url = new URL(urlpage);
    const searchParams = url.searchParams;
    const page = searchParams.get('page');
    const createdAt = searchParams.get('createdAt');
    setIsloading(true);
    const newparams = `${params}?page=${page}${
      createdAt ? `&createdAt=${createdAt}` : ''
    }${otherparams ?? ''}`;
    actioncall(newparams, callbackPagination);
  };

  const onNext = () => {
    const urlpage = dataTablelink?.links?.next;

    const url = new URL(urlpage);
    const searchParams = url.searchParams;
    const page = searchParams.get('page');
    const createdAt = searchParams.get('createdAt');
    const bet_type_id = searchParams.get('bet_type_id');
    const bet_num = searchParams.get('bet_num');
    const batch_type = searchParams.get('batch_type');
    setIsloading(true);
    const newparams = `${params}?page=${page}${
      createdAt ? `&createdAt=${createdAt}` : ''
    }${bet_type_id ? `&bet_type_id=${bet_type_id}` : ''}${
      bet_num ? `&bet_num=${bet_num}` : ''
    }${batch_type ? `&batch_type=${batch_type}` : ''}${otherparams ?? ''}`;
    actioncall(newparams, callbackPagination);
  };

  const onLast = () => {
    const urlpage = dataTablelink?.links?.last;
    const url = new URL(urlpage);
    const searchParams = url.searchParams;
    const page = searchParams.get('page');
    const createdAt = searchParams.get('createdAt');

    setIsloading(true);
    const newparams = `${params}?page=${page}${
      createdAt ? `&createdAt=${createdAt}` : ''
    }${otherparams ?? ''}`;
    actioncall(newparams, callbackPagination);
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

  const onChangeDate = (date, dateString) => {
    setDateSearch(dateString);
    setIsloading(true);
    console.log('cehcfk');
    const newparams = `${params}?page=1&createdAt=${dateString}`;
    actioncall(newparams, callbackPagination);
  };

  useEffect(() => {
    const newparams = `${params}?page=1${otherparams ?? ''}${dateparams ?? ''}`;
    setIsloading(true);

    actioncall(newparams, callbackPagination);
  }, []);

  return {
    isloading,
    onChangeDate,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    dateSearch,
    callbackresponse,
    errorResponse,
  };
};

export default usePagination;
