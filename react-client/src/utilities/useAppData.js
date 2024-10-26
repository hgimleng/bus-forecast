import { useState, useEffect } from 'react';
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
    homePage: 'countdown',
    forecastDisplay: false,
    sortBy: 'Bus number',
    arrivalDisplay: 'Countdown',
    nextStopRoadName: 'Show',
  });

  const BUS_INFO_KEY = 'busInfo';
  const LAST_CHECKED_TIMESTAMP_KEY = 'lastCheckedTimestamp';

  useEffect(() => {
    const fetchAndSetData = async () => {
      let localData = await getData(BUS_INFO_KEY);

      if (!localData || await isDataOutdated(localData)) {
        if (!localData) {
          getPosition()
        }

        const freshData = await fetchDataFromAPI();
        await setData(BUS_INFO_KEY, freshData);
        await setData(LAST_CHECKED_TIMESTAMP_KEY, Date.now());
        localData = freshData;
      }
      localData.lastCheckedTimestamp = await getData(LAST_CHECKED_TIMESTAMP_KEY);

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

  const isDataOutdated = async (localData) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastCheckedTimestamp = await getData(LAST_CHECKED_TIMESTAMP_KEY)
    if (lastCheckedTimestamp && now - lastCheckedTimestamp < oneDay) {
        return false;
    } else {
      const lastUpdatedResponse = await api_forecast.get('/last-updated');
      await setData(LAST_CHECKED_TIMESTAMP_KEY, now);
      return (new Date(localData.lastUpdatedTimestamp) < new Date(lastUpdatedResponse.data.last_updated));
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
    await setData(BUS_INFO_KEY, freshData);
    setDataState(freshData);
  }

  const updateSettings = async (key, value) => {
    const newSettings = { ...settings };
    newSettings[key] = value;
    await setData('settings', newSettings);
    setSettings(newSettings);
  }

  const updateLastChecked = async () => {
    const now = Date.now();
    await setData(LAST_CHECKED_TIMESTAMP_KEY, now);
    data.lastCheckedTimestamp = now;
    setDataState(data);
  }

  return { data, getDataLastUpdated, downloadData, settings, updateSettings, updateLastChecked };
}

export default useAppData;