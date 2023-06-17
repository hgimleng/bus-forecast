import React, {useState} from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';

import api from './api';
import SearchForm from './components/SearchForm';
import ErrorMessage from './components/ErrorMessage';
import DisclaimerMessage from './components/DisclaimerMessage';
import DirectionSelector from './components/DirectionSelector';
import BusStopSelector from './components/BusStopSelector';
import BusArrivalDisplay from './components/BusArrivalDisplay';

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
    } catch (error) {
      setErrorMsg(`Bus '${findNum}' not found`)
      setDisclaimerMsg('')
      setStep(1)
    } finally {
      setIsFetching(false)
      setSelectedDirection('')
      setSelectedStop('')
    }
  }

  async function fetchArrivalData(direction, stopSequence) {
    try {
      setSelectedStop(stopSequence)
      setSelectedDirection(direction)

      setIsFetching(true)
      const response = await api.get(`/bus/${busNum}/direction/${direction}/stop/${stopSequence}`)

      const data = response.data
      setArrivalData(data['timing'])
      setUpdateTime(data['updateTime'])
      setBusDiff(data['busDiff'])
      setStep(3)
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
    fetchArrivalData(selectedDirection, selectedStop)
  }

  return (
    <PaperProvider>
    <ScrollView contentContainerStyle={styles.scrollView}>
      <SearchForm onFind={fetchDirectionsAndStops} busNum={busNum} />
      {isFetching && step===1 && <ActivityIndicator />}
      {errorMsg !== '' && <ErrorMessage message={errorMsg} />}
      {disclaimerMsg !== '' && <DisclaimerMessage message={disclaimerMsg} />}
      {step >= 2 && <BusStopSelector selectStop={fetchArrivalData} selectedStop={selectedStop} selectedDirection={selectedDirection} routes={routes} />}
      {isFetching && step===2 && <ActivityIndicator />}
      {step >= 3 && <BusArrivalDisplay arrivalData={arrivalData} updateTime={updateTime} refreshData={refreshData} selectedStop={selectedStop} stops={routes['stops'][selectedDirection]} busDiff={busDiff} isLoading={isFetching} />}
    </ScrollView>
    </PaperProvider>
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
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight,
  }
});
