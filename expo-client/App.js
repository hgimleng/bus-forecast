import React, {useState} from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import api from './api';
import SearchForm from './components/SearchForm';
import ErrorMessage from './components/ErrorMessage';
import DisclaimerMessage from './components/DisclaimerMessage';
import DirectionSelector from './components/DirectionSelector';

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
    console.log(direction)
  }

  return (
    <View style={styles.container}>
      <SearchForm onFind={fetchDirectionsAndStops} />
      {isFetching && step===1 && <ActivityIndicator />}
      {errorMsg !== '' && <ErrorMessage message={errorMsg} />}
      {disclaimerMsg !== '' && <DisclaimerMessage message={disclaimerMsg} />}
      {step >= 2 && <DirectionSelector directions={routes['directions']} onClick={selectDirection} selectedDirection={selectedDirection} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
