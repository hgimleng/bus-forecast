import { useState } from 'react';
import api from './api';
import BusArrivalDisplay from "./components/BusArrivalDisplay";
import BusStopSelector from "./components/BusStopSelector";
import DirectionSelector from "./components/DirectionSelector";
import ErrorMessage from "./components/ErrorMessage";
import SearchForm from "./components/SearchForm";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function App() {
  const [step, setStep] = useState(1)
  const [errorMsg, setErrorMsg] = useState('')
  const [busNum, setBusNum] = useState('')
  const [routes, setRoutes] = useState({'directions': {}, 'stops': {}})
  const [selectedDirection, setSelectedDirection] = useState('')
  const [selectedStop, setSelectedStop] = useState('')
  const [arrivalData, setArrivalData] = useState([])
  const [updateTime, setUpdateTime] = useState('')
  const [isFetching, setIsFetching] = useState(false)

  // Fetch directions, stops, and update busNum, step and routes
  async function fetchDirectionsAndStops(findNum) {
    try {
      setIsFetching(true)
      const response = await api.get(`/bus/${findNum}`)
      setIsFetching(false)
      if (response.status === 200) {
        const data = response.data
        setRoutes(data)
        setErrorMsg('')
        setStep(2)
        setBusNum(findNum)
        setSelectedDirection('')
      } else {
        throw new Error('Not found')
      }
    } catch (error) {
      setErrorMsg(`Bus '${findNum}' not found`)
      setStep(1)
      console.error('Error fetching data:', error)
    }
  }

  function selectDirection(direction) {
    setSelectedDirection(direction)
    setSelectedStop('')
    setStep(3)
  }

  async function fetchArrivalData(stopSequence) {
    try {
      setIsFetching(true)
      const response = await api.get(`/bus/${busNum}/direction/${selectedDirection}/stop/${stopSequence}`)
      setIsFetching(false)

      if (response.status === 200) {
        const data = response.data
        setSelectedStop(stopSequence)
        setArrivalData(data['timing'])
        setUpdateTime(data['updateTime'])
        setStep(4)
      } else {
        throw new Error('Not found')
      }
    } catch (error) {
      console.error('Error fetching bus arrival timing:', error)
    }
  }

  function refreshData() {
    fetchArrivalData(selectedStop)
  }

  return (
    <div className='container mt-4 mb-4 text-center' >
      <SearchForm onFind={fetchDirectionsAndStops} />
      {isFetching && <CircularProgress />}
      {errorMsg !== '' && <ErrorMessage message={errorMsg} />}
      {step >= 2 && <DirectionSelector directions={routes['directions']} onClick={selectDirection} selectedDirection={selectedDirection} />}
      {step >= 3 && <BusStopSelector stops={routes['stops'][selectedDirection]} selectStop={fetchArrivalData} selectedStop={selectedStop} />}
      {step >= 4 && <BusArrivalDisplay arrivalData={arrivalData} stopName={routes['stops'][selectedDirection].filter(s => s['stopSequence'] === selectedStop)[0]['name']} updateTime={updateTime} refreshData={refreshData} selectedStop={selectedStop} />}
    </div>
  );
}

export default App;
