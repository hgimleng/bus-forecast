import axios from 'axios';

const api_forecast = axios.create({
  baseURL: process.env.REACT_APP_API_ENDPOINT,
});

const api_arrival = axios.create({
  baseURL: process.env.REACT_APP_ARRIVAL_API_ENDPOINT,
});

export { api_forecast, api_arrival };