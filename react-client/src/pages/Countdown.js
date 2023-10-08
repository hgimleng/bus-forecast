import { useState, useEffect, useRef } from 'react';
import { api_arrival } from '../api';
import SearchForm from '../components/Countdown/SearchForm';
import TimingDisplay from '../components/Countdown/TimingDisplay';
import BusSelector from '../components/Countdown/BusSelector';
import StopSelector from '../components/Countdown/StopSelector';
import { useGeolocated } from "react-geolocated";
import TimingErrorAlert from "../components/Countdown/TimingErrorAlert";

function Countdown({ active, data, updateDistanceForStops }) {
    const [timingData, setTimingData] = useState({})
    const [lastUpdateTime, setLastUpdateTime] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [busList, setBusList] = useState([])
    const [stopList, setStopList] = useState([])
    const [selectedStop, setSelectedStop] = useState('')
    const [selectedBus, setSelectedBus] = useState('')
    const [selectedDirection, setSelectedDirection] = useState('')
    const [isNearbyClicked, setIsNearbyClicked] = useState(false)
    const [getStopList, setGetStopList] = useState(() => (stopData) => [])
    const [showAlert, setShowAlert] = useState(false);
    const [isTimingDisplayRendered, setIsTimingDisplayRendered] = useState(false);
    const targetRef = useRef(null);

    const scrollToRef = (ref) => ref.current.scrollIntoView({ behavior: 'smooth' });

    const { coords, getPosition, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 10000,
        });

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

    useEffect(() => {
        console.log("[data/getStopList changed] updating stop list from data of "+Object.keys(data['stop_data']).length.toString())
        setStopList(getStopList(data['stop_data']));
    }, [data, getStopList])

    useEffect(() => {
        if (isNearbyClicked && stopList.length > 0){
            let newBusList = [];
            for (const stopCode of stopList) {
                if (data['stop_data'][stopCode]['distance'] > 0.5) {
                    break;
                }

                const buses = data['stop_data'][stopCode]['buses'];
                for (const busNum of buses) {
                    if (!newBusList.includes(busNum)) {
                        newBusList.push(busNum);
                    }
                }
            }
            setBusList(newBusList);
        }
    }, [isNearbyClicked, stopList])

    useEffect(() => {
        if (selectedStop && isTimingDisplayRendered) {
            scrollToRef(targetRef);
        }
    }, [selectedStop, isTimingDisplayRendered])

    async function fetchStopInfo(stopCode) {
        if (selectedStop !== stopCode) {
            setSelectedStop(stopCode)
        }
        await updateDistanceForStops()

        try {
            const response = await api_arrival.get(`/?id=${stopCode}`)
            const data = response.data
            setTimingData(data)
            setLastUpdateTime(new Date().toLocaleTimeString())
            setShowAlert(false)
        } catch(error) {
            console.error('Error fetching data:', error)

            setShowAlert(true)
        }
    }

    async function handleSearch(inputText) {
        await updateDistanceForStops()
        const cleanString = (str) => str.replace(/[^\w\s]/gi, '').toUpperCase()

        function getStopListSortedByDistance(data, distanceLimit = Number.MAX_VALUE) {
            // Sort the stopList by distance in ascending order and limit by distance
            console.log("Sorting stop list by distance")
            return [...Object.keys(data)].sort((a, b) => data[a].distance - data[b].distance).filter((stopCode) => data[stopCode].distance < distanceLimit);
        }

        function getStopListSortedByName(data) {
            // Sort the stopList by name in ascending order
            console.log("Sorting stop list by name")
            return [...Object.keys(data)].sort((a, b) => data[a].name.localeCompare(data[b].name));
        }

        if (inputText === 'nearby') {
            setIsNearbyClicked(true)
            setGetStopList(() =>
                (stopData) => getStopListSortedByDistance(stopData, 2)
            )
        } else {
            setIsNearbyClicked(false)
            setGetStopList(() =>
                function (stopData) {
                    const filteredStopData = Object.fromEntries(
                        Object.entries(stopData).filter(([stopCode, stopValue]) => {
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

                    return isGeolocationEnabled ? getStopListSortedByDistance(filteredStopData) : getStopListSortedByName(filteredStopData)
                }
            )
        }
        setSelectedBus('')
        setSelectedDirection('')
    }

    function handleBusSelect(busNum, direction) {
        setSelectedBus(busNum)
        setSelectedDirection(direction)
        setGetStopList(() =>
            (stopData) => data['bus_data'][busNum][direction]['stops']
        )
        setIsNearbyClicked(false)
    }

    function onBusRowClick(busNum, dest_code) {
        const busData = data['bus_data'][busNum]
        const direction = Object.keys(busData).find(direction => busData[direction]['stops'].slice(-2).includes(dest_code));

        setBusList([busNum])
        handleBusSelect(busNum, direction)
        setIsNearbyClicked(false)
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
                />}
            </div>
        </div> :
        <div className="container mt-4 mb-4 spinner-border"
             style={{display: 'flex', alignItems: 'center', justifyContent: 'center',}} />}
        </>
    )
}

export default Countdown;
