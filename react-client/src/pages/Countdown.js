import { useState, useEffect } from 'react';
import { api_arrival } from '../api';
import SearchForm from '../components/Countdown/SearchForm';
import TimingDisplay from '../components/Countdown/TimingDisplay';
import useAppData from '../utilities/useAppData';
import StopSelector from '../components/Countdown/StopSelector';

function Countdown({ active }) {
    const [timingData, setTimingData] = useState({})
    const [lastUpdateTime, setLastUpdateTime] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [stopList, setStopList] = useState([])
    const [selectedStop, setSelectedStop] = useState('')

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
      }, [selectedStop]);

    function setNewStopList(stopList) {
        updateDistanceForStops()
        setStopList(stopList)

        if (stopList.length == 1) {
            fetchStopInfo(stopList[0])
        }
    }

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

    return (
        <div className={`container mt-4 mb-4 text-center ${active ? '' : 'd-none'}`} >
            <SearchForm busData={data['bus_data']} stopData={data['stop_data']} setStopList={setNewStopList} />
            {stopList.length > 0 && <StopSelector stopData={data['stop_data']} stopList={stopList} setSelectedStop={fetchStopInfo} />}
            {timingData['services'] && stopList.length > 0 && <TimingDisplay selectedStop={selectedStop} timingData={timingData} stopData={data['stop_data']} lastUpdateTime={lastUpdateTime} currentTime={currentTime} />}
        </div>
    )
}

export default Countdown;
