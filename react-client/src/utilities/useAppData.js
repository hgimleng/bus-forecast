import {useState, useEffect, useRef} from 'react';
import { getData, setData } from './storage';
import { api_forecast } from '../api';
import { useGeolocated } from "react-geolocated";

function useAppData() {
  const [data, setDataState] = useState({'bus_data': {}, 'stop_data': {}});
  const { _, getPosition, __ } =
      useGeolocated({
        positionOptions: {
          enableHighAccuracy: false,
        },
        userDecisionTimeout: 10000,
      });
  const [settings, setSettings] = useState({
    forecastDisplay: false,
    sortBy: 'Bus number',
    arrivalDisplay: 'Countdown'
  });

  useEffect(() => {
    const fetchAndSetData = async () => {
      let localData = await getData('busInfo');

      if (!localData || isDataOutdated(localData)) {
        if (!localData) {
          getPosition()
        }

        const freshData = await fetchDataFromAPI();
        await setData('busInfo', freshData);
        localData = freshData;
      }

      console.log("Setting data to local data")
      setDataState(localData);
    };
    const fetchAndSetSettings = async () => {
      const localSettings = await getData('settings');
      if (localSettings) {
        setSettings(localSettings);
      }
    };

    console.log("Fetching data")
    fetchAndSetData();
    fetchAndSetSettings();

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
    console.log("Downloaded data")
    return data;
  };

  const downloadData = async () => {
    const freshData = await fetchDataFromAPI();
    await setData('busInfo', freshData);
    setDataState(freshData);
  }

  const updateSettings = async (key, value) => {
    const newSettings = { ...settings };
    newSettings[key] = value;
    await setData('settings', newSettings);
    setSettings(newSettings);
  }

  return { data, downloadData, settings, updateSettings };
}

export default useAppData;