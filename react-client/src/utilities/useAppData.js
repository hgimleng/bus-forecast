import { useState, useEffect } from 'react';
import { getData, setData } from './storage';
import { api_forecast } from '../api';
import { useGeolocated } from "react-geolocated";

function useAppData() {
  const [data, setDataState] = useState({'bus_data': {}, 'stop_data': {}});
  const { coords, getPosition, isGeolocationEnabled } =
      useGeolocated({
        positionOptions: {
          enableHighAccuracy: false,
        },
        userDecisionTimeout: 10000,
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

    console.log("Fetching data")
    fetchAndSetData();
  }, []);

  useEffect(() => {
    console.log("Location enabled, updating distances")
    if (isGeolocationEnabled && Object.values(data['stop_data']).length > 0 && Object.values(data['stop_data'])[0].distance === undefined) {
      const updateDistances = async () => {
        const updatedData = await updateDataDistance(data);
        setDataState(updatedData);
      };

      updateDistances();
    }
  }, [isGeolocationEnabled, data]);

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

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  async function updateDataDistance(data) {
    getPosition();
    let updatedData = JSON.parse(JSON.stringify(data));
    if (isGeolocationEnabled && coords) {
      const updatedStopData = { ...updatedData['stop_data'] };
      for (let stopCode in updatedStopData) {
        const stopLat = updatedStopData[stopCode].lat;
        const stopLon = updatedStopData[stopCode].lng;
        updatedStopData[stopCode].distance = getDistanceFromLatLonInKm(coords.latitude, coords.longitude, stopLat, stopLon);
      }

      updatedData['stop_data'] = updatedStopData;
      console.log("Updated stop data with distance");

      return updatedData;
    } else {
      console.log("Location not enabled, not updating distances");
      return updatedData;
    }
  }

  const updateDistanceForStops = async () => {
    const newData = await updateDataDistance(data);
    setDataState(newData);
    return newData;
  };

  const downloadData = async () => {
    const freshData = await fetchDataFromAPI();
    await setData('busInfo', freshData);
    setDataState(freshData);
  }

  return { data, updateDistanceForStops, downloadData };
}

export default useAppData;