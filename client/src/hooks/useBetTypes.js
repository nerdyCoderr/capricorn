import { useEffect, useState } from 'react';
import { getBetType } from '../api/request';

function useBetTypes(setFilter) {
  const [betTypeOptions, setBetTypeOptions] = useState([]);

  useEffect(() => {
    getBetType(callbackBetType);
  }, []);

  const callbackBetType = async (res) => {
    const { data } = await res;
    setBetTypeOptions(data.betTypes);
  };

  const onTypeChange = (value) => {
    setFilter((prev) => {
      return { ...prev, bet_type: value };
    });
  };

  return { betTypeOptions, onTypeChange };
}

export default useBetTypes;
