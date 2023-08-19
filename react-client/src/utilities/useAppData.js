import { useState, useEffect } from 'react';
import { getData, setData } from './storage';
import { api_forecast } from '../api';

function useAppData() {
  const [data, setDataState] = useState({'bus_data': {}, 'stop_data': {}});

  useEffect(() => {
    const fetchAndSetData = async () => {
      let localData = await getData('busInfo');

      if (!localData || isDataOutdated(localData)) {
        const freshData = await fetchDataFromAPI();
        await setData('busInfo', freshData);
        localData = freshData;
      }
      localData = updateDataDistance(localData);
      setDataState(localData);
    };

    fetchAndSetData();
    updateDistanceForStops();
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

  const updateDataDistance = (data) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const updatedStopData = {...data['stop_data']};
        for (let stopCode in updatedStopData) {
          const stopLat = updatedStopData[stopCode].lat;
          const stopLon = updatedStopData[stopCode].lng;
          const distance = getDistanceFromLatLonInKm(userLat, userLon, stopLat, stopLon);

          updatedStopData[stopCode].distance = distance;
        }

        data['stop_data'] = updatedStopData;
      }, error => {
        console.error("Error retrieving user's location: ", error);
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
    return data;
  };

  const updateDistanceForStops = () => {
    setDataState(prevData => {
      const updatedData = updateDataDistance(prevData);
      return updatedData;
    });
  }

  return { data, updateDistanceForStops };
};

export default useAppData;