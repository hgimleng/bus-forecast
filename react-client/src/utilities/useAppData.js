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

      if (!localData || await isDataOutdated(localData)) {
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

  const isDataOutdated = async (data) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now - data.lastCheckedTimestamp < oneDay) {
        return false;
    } else {
      const lastUpdatedResponse = await api_forecast.get('/last-updated');
      data.lastCheckedTimestamp = now;
      return (data.lastUpdatedTimestamp < lastUpdatedResponse.data.timestamp);
    }
  };

  const fetchDataFromAPI = async () => {
    const response = await api_forecast.get('/all-bus-info');
    const data = response.data;
    data.lastCheckedTimestamp = Date.now();
    data.lastUpdatedTimestamp = await getDataLastUpdated();
    console.log("Downloaded data updated on", data.lastUpdatedTimestamp);
    return data;
  };

  const getDataLastUpdated = async () => {
    const lastUpdatedResponse = await api_forecast.get('/last-updated');
    return Date.parse(lastUpdatedResponse.data.last_updated);
  }

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

  const updateLastChecked = async () => {
    const newData = { ...data };
    newData.lastCheckedTimestamp = Date.now();
    await setData('busInfo', newData);
    setDataState(newData);
  }

  return { data, getDataLastUpdated, downloadData, settings, updateSettings, updateLastChecked };
}

export default useAppData;