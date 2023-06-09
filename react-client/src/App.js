import { useState } from 'react';
import api from './api';
import BusArrivalDisplay from "./components/BusArrivalDisplay";
import BusStopSelector from "./components/BusStopSelector";
import DirectionSelector from "./components/DirectionSelector";
import DisclaimerMessage from "./components/DisclaimerMessage";
import ErrorMessage from "./components/ErrorMessage";
import SearchForm from "./components/SearchForm";
import CircularProgress from "@mui/material/CircularProgress";

function App() {
  const [step, setStep] = useState(1)
  const [errorMsg, setErrorMsg] = useState('')
  const [disclaimerMsg, setDisclaimerMsg] = useState('')
  const [busNum, setBusNum] = useState('')
  const [routes, setRoutes] = useState({'directions': {}, 'stops': {}})
  const [selectedDirection, setSelectedDirection] = useState('')
  const [selectedStop, setSelectedStop] = useState('')
  const [arrivalData, setArrivalData] = useState([])
  const [updateTime, setUpdateTime] = useState('')
  const [busDiff, setBusDiff] = useState({})
  const [isFetching, setIsFetching] = useState(false)
  const [unsupportedBuses, setUnsupportedBuses] = useState(['160', '170', '170X', '291', '293', '358', '359', '812', '950', '975'])

  // Fetch directions, stops, and update busNum, step and routes
  async function fetchDirectionsAndStops(findNum) {
    try {
      setIsFetching(true)
      const response = await api.get(`/bus/${findNum}`)
      setIsFetching(false)

      const data = response.data
      if (Object.keys(data['directions']).length === 0) {
        throw new Error('No directions found')
      }
      setRoutes(data)
      setErrorMsg('')
      setDisclaimerMsg(unsupportedBuses.includes(findNum) ? `Bus '${findNum}' is not fully supported at the moment.` : '')
      setStep(2)
      setBusNum(findNum)
      // if 1 direction, select it
      if (Object.keys(data['directions']).length === 1) {
        selectDirection(Object.keys(data['directions'])[0])
      } else {
        setSelectedDirection('')
      }
    } catch (error) {
      setErrorMsg(`Bus '${findNum}' not found`)
      setDisclaimerMsg('')
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
      setSelectedStop(stopSequence)
      setIsFetching(true)
      const response = await api.get(`/bus/${busNum}/direction/${selectedDirection}/stop/${stopSequence}`)

      const data = response.data
      setArrivalData(data['timing'])
      setUpdateTime(data['updateTime'])
      setBusDiff(data['busDiff'])
      setStep(4)
    } catch (error) {
      console.error('Error fetching bus arrival timing:', error)
      // Go back to step 1 and show error message
      if (error.response && error.response.status === 502) {
        setErrorMsg(`No timings found for bus '${busNum}'`)
      } else if (error.response && error.response.status === 501) {
        setErrorMsg('An error occurred while fetching data.')
      } else if (error.response && error.response.status === 503) {
        setErrorMsg('A database error occured.')
      } else {
        setErrorMsg('An unknown error occurred.')
      }
      setStep(1)
    } finally {
      setIsFetching(false)
    }
  }

  function refreshData() {
    fetchArrivalData(selectedStop)
  }

  return (
    <div className='container mt-4 mb-4 text-center' >
      <SearchForm onFind={fetchDirectionsAndStops} />
      {errorMsg !== '' && <ErrorMessage message={errorMsg} />}
      {disclaimerMsg !== '' && <DisclaimerMessage message={disclaimerMsg} />}
      {step >= 2 && <DirectionSelector directions={routes['directions']} onClick={selectDirection} selectedDirection={selectedDirection} />}
      {step >= 3 && <BusStopSelector stops={routes['stops'][selectedDirection]} selectStop={fetchArrivalData} selectedStop={selectedStop} isLoading={isFetching} />}
      {step >= 4 && <BusArrivalDisplay arrivalData={arrivalData} updateTime={updateTime} refreshData={refreshData} selectedStop={selectedStop} stops={routes['stops'][selectedDirection]} busDiff={busDiff} isLoading={isFetching} />}
    </div>
  );
}

export default App;
