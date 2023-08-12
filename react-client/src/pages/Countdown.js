import { useState, useEffect } from 'react';
import { api_arrival } from '../api';
import SearchForm from '../components/Countdown/SearchForm';
import TimingDisplay from '../components/Countdown/TimingDisplay';
import useAppData from '../utilities/useAppData';

function Countdown() {
    const [busInfo, setBusInfo] = useState({})
    const [lastSearchTime, setLastSearchTime] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())

    const data = useAppData()

    useEffect(() => {
        // Update the time state every 1 second/ 1000 milliseconds
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
    
        // Clear interval on re-render to avoid memory leaks
        return () => clearInterval(timer);
      }, []);

    async function fetchStopInfo(stopCode) {
        console.log('Data: ', data)

        try {
            const response = await api_arrival.get(`/?id=${stopCode}`)
            const data = response.data
            setBusInfo(data)
            setLastSearchTime(new Date().toLocaleTimeString())
        } catch(error) {
            console.error('Error fetching data:', error)
        }
    }

    return (
        <div className='container mt-4 mb-4 text-center' >
            <SearchForm onFind={fetchStopInfo} />
            {busInfo['services'] && <TimingDisplay busInfo={busInfo} lastSearchTime={lastSearchTime} currentTime={currentTime} />}
        </div>
    )
}

export default Countdown;
