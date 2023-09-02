import { useState, useEffect } from 'react';
import { api_arrival } from '../api';
import SearchForm from '../components/Countdown/SearchForm';
import TimingDisplay from '../components/Countdown/TimingDisplay';
import useAppData from '../utilities/useAppData';
import BusSelector from '../components/Countdown/BusSelector';
import StopSelector from '../components/Countdown/StopSelector';

function Countdown({ active }) {
    const [timingData, setTimingData] = useState({})
    const [lastUpdateTime, setLastUpdateTime] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [busList, setBusList] = useState([])
    const [stopList, setStopList] = useState([])
    const [selectedStop, setSelectedStop] = useState('')
    const [selectedBus, setSelectedBus] = useState('')
    const [selectedDirection, setSelectedDirection] = useState('')
    const [isNearbyClicked, setIsNearbyClicked] = useState(false)

    const { data, updateDistanceForStops } = useAppData()

    useEffect(() => {
        // Update the time state every 1 second/ 1000 milliseconds
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);

        // Fetch the timing data every 15 seconds/ 15000 milliseconds
        const dataRefresher = setInterval(() => {
            if (selectedStop) {
                fetchStopInfo(selectedStop);
            }
        }, 15000);
    
        // Clear interval on re-render to avoid memory leaks
        return () => {
            clearInterval(timer);
            clearInterval(dataRefresher);
        };
      }, [selectedStop])

    async function fetchStopInfo(stopCode) {
        setSelectedStop(stopCode)
        updateDistanceForStops()

        try {
            const response = await api_arrival.get(`/?id=${stopCode}`)
            const data = response.data
            setTimingData(data)
            setLastUpdateTime(new Date().toLocaleTimeString())
        } catch(error) {
            console.error('Error fetching data:', error)
        }
    }

    function handleSearch(inputText) {
        if (inputText === 'nearby') {
            setIsNearbyClicked(true)
        } else {
            setIsNearbyClicked(false)
        }
        setSelectedBus('')
        setSelectedDirection('')
    }

    function handleBusSelect(busNum, direction) {
        setSelectedBus(busNum)
        setSelectedDirection(direction)
        setStopList(data['bus_data'][busNum][direction]['stops'].slice(0, -1))
    }

    function onBusRowClick(busNum, dest_code) {
        const busData = data['bus_data'][busNum]
        const direction = Object.keys(busData).find(direction => busData[direction]['stops'].slice(-2).includes(dest_code));

        setBusList([{'number': busNum, 'direction': direction}])
        handleBusSelect(busNum, direction)
        setIsNearbyClicked(false)
    }

    return (
        <div className={`container mt-4 mb-4 ${active ? '' : 'd-none'}`} >
            <SearchForm busData={data['bus_data']} stopData={data['stop_data']} setBusList={setBusList} setStopList={setStopList} updateDistanceForStops={updateDistanceForStops} isNearbyClicked={isNearbyClicked} handleSearch={handleSearch} />
            {busList.length > 0 && <BusSelector busData={data['bus_data']} busList={busList} selectedBus={selectedBus} selectedDirection={selectedDirection} handleBusSelect={handleBusSelect} />}
            {stopList.length > 0 && <StopSelector stopData={data['stop_data']} stopList={stopList} setSelectedStop={fetchStopInfo} />}
            {timingData['services'] && stopList.length > 0 && <TimingDisplay selectedStop={selectedStop} timingData={timingData} stopData={data['stop_data']} lastUpdateTime={lastUpdateTime} currentTime={currentTime} onBusRowClick={onBusRowClick} />}
        </div>
    )
}

export default Countdown;
