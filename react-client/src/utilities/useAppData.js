import { useState, useEffect } from 'react';
import { getData, setData } from './storage';
import { api_forecast } from '../api';

function useAppData() {
  const [data, setDataState] = useState(null);

  useEffect(() => {
    const fetchAndSetData = async () => {
      let localData = await getData('busInfo');

      if (!localData || isDataOutdated(localData)) {
        const freshData = await fetchDataFromAPI();
        await setData('busInfo', freshData);
        setDataState(freshData);
      } else {
        setDataState(localData);
      }
    };

    fetchAndSetData();
  }, []);

  const isDataOutdated = (data) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    return (now - data.timestamp) > oneDay;
  };

  const fetchDataFromAPI = async () => {
    const response = await api_forecast.get('/all-bus-info');
    const data = response.data;
    data.timestamp = Date.now();
    return data;
  };

  return data;
};

export default useAppData;