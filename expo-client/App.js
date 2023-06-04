import React, {useState} from 'react';
import { StyleSheet, Text, View, ActivityIndicator, StatusBar } from 'react-native';

import api from './api';
import SearchForm from './components/SearchForm';
import ErrorMessage from './components/ErrorMessage';
import DisclaimerMessage from './components/DisclaimerMessage';
import DirectionSelector from './components/DirectionSelector';
import BusStopSelector from './components/BusStopSelector';

export default function App() {
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
  const [unsupportedBuses, setUnsupportedBuses] = useState(['123', '123M', '160', '170', '170X', '291', '293', '358', '359', '60', '73', '812', '883', '883M', '950', '98'])

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
      setDisclaimerMsg(unsupportedBuses.includes(findNum) ? `'${findNum}' is not fully supported at the moment.` : '')
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
    }
  }

  function selectDirection(direction) {
    setSelectedDirection(direction)
    setSelectedStop('')
    setStep(3)
  }

  async function fetchArrivalData(stopSequence) {
    console.log(stopSequence)
    // try {
    //   setIsFetching(true)
    //   const response = await api.get(`/bus/${busNum}/direction/${selectedDirection}/stop/${stopSequence}`)

    //   const data = response.data
      setSelectedStop(stopSequence)
    //   setArrivalData(data['timing'])
    //   setUpdateTime(data['updateTime'])
    //   setBusDiff(data['busDiff'])
    //   setStep(4)
    // } catch (error) {
    //   console.error('Error fetching bus arrival timing:', error)
    //   // Go back to step 1 and show error message
    //   if (error.response && error.response.status === 502) {
    //     setErrorMsg(`No timings found for bus '${busNum}'`)
    //   } else if (error.response && error.response.status === 501) {
    //     setErrorMsg('An error occurred while fetching data.')
    //   } else if (error.response && error.response.status === 503) {
    //     setErrorMsg('A database error occured.')
    //   } else {
    //     setErrorMsg('An unknown error occurred.')
    //   }
    //   setStep(1)
    // } finally {
    //   setIsFetching(false)
    // }
  }

  return (
    <View style={styles.container}>
      <SearchForm onFind={fetchDirectionsAndStops} />
      {isFetching && step===1 && <ActivityIndicator />}
      {errorMsg !== '' && <ErrorMessage message={errorMsg} />}
      {disclaimerMsg !== '' && <DisclaimerMessage message={disclaimerMsg} />}
      {step >= 2 && <DirectionSelector directions={routes['directions']} onClick={selectDirection} selectedDirection={selectedDirection} />}
      {step >= 3 && <BusStopSelector stops={routes['stops'][selectedDirection]} selectStop={fetchArrivalData} selectedStop={selectedStop} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
  },
});
