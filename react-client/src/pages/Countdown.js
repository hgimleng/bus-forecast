import { useState, useEffect, useRef } from 'react';
import { api_arrival } from '../api';
import SearchForm from '../components/Countdown/SearchForm';
import TimingDisplay from '../components/Countdown/TimingDisplay';
import BusSelector from '../components/Countdown/BusSelector';
import StopSelector from '../components/Countdown/StopSelector';
import TimingErrorAlert from "../components/Countdown/TimingErrorAlert";

function Countdown({ active, data, settings, compassDirection, coords, getPosition, isGeolocationEnabled }) {
    const [timingData, setTimingData] = useState({})
    const [lastUpdateTime, setLastUpdateTime] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [busList, setBusList] = useState([])
    const [stopList, setStopList] = useState([])
    const [selectedStop, setSelectedStop] = useState('')
    const [selectedBus, setSelectedBus] = useState('')
    const [selectedDirection, setSelectedDirection] = useState('')
    const [isNearbyClicked, setIsNearbyClicked] = useState(false)
    const [showAlert, setShowAlert] = useState(false);
    const [isTimingDisplayRendered, setIsTimingDisplayRendered] = useState(false);
    const targetRef = useRef(null);

    const scrollToRef = (ref) => ref.current.scrollIntoView({ behavior: 'smooth' });

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
            if (isNearbyClicked) {
                setStopList(getStopListSortedByDistance(data['stop_data'], 1));
            }
        }, 15000);
    
        // Clear interval on re-render to avoid memory leaks
        return () => {
            clearInterval(timer);
            clearInterval(dataRefresher);
        };
      }, [selectedStop, isNearbyClicked])

    useEffect(() => {
        if (selectedStop && isTimingDisplayRendered) {
            scrollToRef(targetRef);
        }
    }, [selectedStop, isTimingDisplayRendered])

    async function fetchStopInfo(stopCode) {
        if (selectedStop !== stopCode) {
            setSelectedStop(stopCode)
            // setTimingData([])
        }

        try {
            stopCode = getModifiedStopCode(stopCode);

            let stopCodes = stopCode.split("/")
            const response = await api_arrival.get(`/?id=${stopCodes[0]}`)
            const data = response.data
            for (let i = 1; i < stopCodes.length; i++) {
                const response = await api_arrival.get(`/?id=${stopCodes[i]}`)
                data['services'] = data['services'].concat(response.data['services'])
            }

            setTimingData(data)
            setLastUpdateTime(new Date().toLocaleTimeString())
            setShowAlert(false)
        } catch(error) {
            console.error('Error fetching data:', error)

            setShowAlert(true)
        }
    }

    function getStopListSortedByDistance(data, distanceLimit = Number.MAX_VALUE) {
        // Sort the stopList by distance in ascending order and limit by distance
        return [...Object.keys(data)].sort((a, b) => getDistance(data[a]['lat'], data[a]['lng']) - getDistance(data[b]['lat'], data[b]['lng'])).filter((stopCode) => getDistance(data[stopCode]['lat'], data[stopCode]['lng']) < distanceLimit);
    }

    async function handleSearch(inputText) {
        const cleanString = (str) => str.replace(/[^\w\s]/gi, '').toUpperCase()

        function getStopListSortedByName(data) {
            // Sort the stopList by name in ascending order
            return [...Object.keys(data)].sort((a, b) => data[a].name.localeCompare(data[b].name));
        }

        if (inputText === 'nearby') {
            setIsNearbyClicked(true)
            setStopList(getStopListSortedByDistance(data['stop_data'], 1))
        } else {
            setIsNearbyClicked(false)
            const filteredStopData = Object.fromEntries(
                Object.entries(data['stop_data']).filter(([stopCode, stopValue]) => {
                    // Check if stop code matches input text
                    // or if stop name contains input text
                    // or if any of the buses at the stop is a variant of the input text
                    return (
                        stopCode === inputText ||
                        cleanString(stopValue['name']).includes(cleanString(inputText)) ||
                        stopValue['buses'].some(busNum => [cleanString(busNum), busNum.replace(/[a-zA-Z]$/, '')].includes(cleanString(inputText)))
                    )
                })
            );
            if (isGeolocationEnabled) {
                setStopList(getStopListSortedByDistance(filteredStopData))
            } else {
                setStopList(getStopListSortedByName(filteredStopData))
            }
        }
        setSelectedBus('')
        setSelectedDirection('')
    }

    function handleBusSelect(busNum, direction) {
        setSelectedBus(busNum)
        setSelectedDirection(direction)
        setStopList(data['bus_data'][busNum][direction]['stops'])
        setIsNearbyClicked(false)
    }

    function onBusRowClick(busNum, dest_code) {
        const busData = data['bus_data'][busNum]
        const direction = Object.keys(busData).find(direction => busData[direction]['stops'].slice(-2).includes(dest_code));

        setBusList([busNum])
        setIsNearbyClicked(false)
        handleBusSelect(busNum, direction)
    }

    function showStopSelector() {
        if (stopList.length === 0) {
            return false;
        }
        return (isNearbyClicked && isGeolocationEnabled) || !isNearbyClicked;
    }

    function hasData() {
        return Object.keys(data['stop_data']).length > 0;
    }

    function getDistance(lat, lon){
        if (!coords) {
            return null;
        }

        // Get distance from coords to the stop
        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            function deg2rad(deg) {
                return deg * (Math.PI / 180);
            }

            const R = 6371; // Radius of the earth in km
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance in km
            return distance;
        }

        return getDistanceFromLatLonInKm(coords.latitude, coords.longitude, lat, lon);
    }

    function getDirection(lat, lon) {
        if (!coords || !compassDirection) {
            return null;
        }

        // Function to calculate bearing between two points
        function getBearing(lat1, lon1, lat2, lon2) {
            const dLon = (lon2 - lon1);
            const x = Math.cos(lat2) * Math.sin(dLon);
            const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            let bearing = Math.atan2(x, y);
            bearing = (bearing * 180) / Math.PI - compassDirection;

            // Convert bearing to a positive value
            bearing = ((bearing % 360) + 360) % 360;
            return bearing;
        }

        return getBearing(coords.latitude, coords.longitude, lat, lon);
    }

    // Special case of combining stops for Woodlands and Yishun Int
    function getModifiedStopCode(stop) {
        if (stop === '46008' || stop === '46009') {
            return '46008/46009';
        }
        if (stop === '59008' || stop === '59009') {
            return '59008/59009';
        }
        return stop;
    }

    return (
        <>
        {hasData() ?
        <div className={`container mt-4 mb-4 ${active ? '' : 'd-none'}`}>
            <SearchForm busData={data['bus_data']}
                        setBusList={setBusList}
                        isNearbyClicked={isNearbyClicked}
                        handleSearch={handleSearch}
                        locationEnabled={isGeolocationEnabled}
                        requestLocationPermission={getPosition}
            />
            {busList.length > 0 &&
                <BusSelector busData={data['bus_data']}
                             busList={busList}
                             selectedBus={selectedBus}
                             selectedDirection={selectedDirection}
                             handleBusSelect={handleBusSelect}
                />}
            {showStopSelector() &&
                <StopSelector stopData={data['stop_data']}
                              stopList={stopList}
                              setSelectedStop={fetchStopInfo}
                              selectedStop={selectedStop}
                              getDistance={getDistance}
                              getDirection={getDirection}
                />}
            <div ref={targetRef}>
            <TimingErrorAlert showAlert={showAlert}
                              setShowAlert={setShowAlert} />
            {timingData['services'] && stopList.length > 0 &&
                <TimingDisplay selectedStop={selectedStop}
                               timingData={timingData}
                               stopData={data['stop_data']}
                               lastUpdateTime={lastUpdateTime}
                               currentTime={currentTime}
                               onBusRowClick={onBusRowClick}
                               setSelectedStop={fetchStopInfo}
                               onRendered={() => setIsTimingDisplayRendered(true)}
                               settings={settings}
                               getDistance={getDistance}
                               getDirection={getDirection}
                               getModifiedStopCode={getModifiedStopCode}
                />}
            </div>
        </div> :
        <div className="container mt-4 mb-4 spinner-border"
             style={{display: 'flex', alignItems: 'center', justifyContent: 'center',}} />}
        </>
    )
}

export default Countdown;
