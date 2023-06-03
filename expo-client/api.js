import axios from 'axios';

// const API_ENDPOINT_URL = "http://localhost:5000/api"
const API_ENDPOINT_URL = "https://bus-forecast-sg.onrender.com/api"

const api = axios.create({
  baseURL: API_ENDPOINT_URL,
});

export default api;