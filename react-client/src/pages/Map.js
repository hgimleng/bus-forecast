import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TimingErrorAlert from "../components/Countdown/TimingErrorAlert";
import TimingDisplay from '../components/Countdown/TimingDisplay';
import { api_arrival } from '../api';

function Map({ active, coords, data, settings, compassDirection, isGeolocationEnabled }) {
    const [zoomLevel, setZoomLevel] = useState(12); // Initialize zoom level state

    // Update zoom level dynamically
    const MapZoomHandler = () => {
        useMapEvents({
            zoomend: (e) => {
                setZoomLevel(e.target.getZoom()); // Get the current zoom level
            },
        });
        return null;
    };

    // Function to calculate marker size based on zoom level
    const getMarkerRadius = (zoom) => {
        if (zoom < 10) return 1;    // Small radius for low zoom levels
        if (zoom >= 10 && zoom < 15) return 3;  // Medium size
        if (zoom >= 15) return 6;  // Larger radius for high zoom levels
        return 6;  // Default size
    };

    // Copied from Countdown.js
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

    useEffect(() => {
        // Update the time state every 1 second
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);

        // Fetch the timing data every 15 seconds
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
        if (currentTime.getSeconds() % 3 !== 0) {
            return;
        }

        // Update stop list every 3 seconds
        if (isNearbyClicked) {
            // Re calculate and sort distance to all stops
            setStopList(getStopListSortedByDistance(data['stop_data'], 1));
        } else if (isGeolocationEnabled && selectedBus === '') {
            // Re sort distances to displayed stops
            const filteredStopData = Object.fromEntries(
                Object.entries(data['stop_data']).filter(([stopCode, stopValue]) => {
                    return stopList.includes(stopCode);
                })
            );
            setStopList(getStopListSortedByDistance(filteredStopData));
        }
    }, [currentTime])

    async function fetchStopInfo(stopCode) {
        let stopChanged = false;
        if (selectedStop !== stopCode) {
            setSelectedStop(stopCode)
            stopChanged = true;
        }

        if (!stopList.includes(stopCode)) {
            setStopList(stopList.concat([stopCode]));
        }

        try {
            stopCode = getModifiedStopCode(stopCode);

            let stopCodes = stopCode.split("/").reverse()
            const response = await api_arrival.get(`/?id=${stopCodes[0]}`)
            const data = response.data
            for (let i = 1; i < stopCodes.length; i++) {
                const response = await api_arrival.get(`/?id=${stopCodes[i]}`)
                for (let j = 0; j < response.data['services'].length; j++) {
                    if (response.data['services'][j]['next']) {
                        response.data['services'][j]['next']['visit_number'] = 2
                    }
                    if (response.data['services'][j]['subsequent']) {
                        response.data['services'][j]['subsequent']['visit_number'] = 2
                    }
                    if (response.data['services'][j]['next2']) {
                        response.data['services'][j]['next2']['visit_number'] = 2
                    }
                    if (response.data['services'][j]['next3']) {
                        response.data['services'][j]['next3']['visit_number'] = 2
                    }
                }
                data['services'] = data['services'].concat(response.data['services'])
            }

            // Remove services where next is null
            data['services'] = data['services'].filter(bus => bus['next'] !== null)

            setTimingData(data)
            setLastUpdateTime(new Date().toLocaleTimeString())
            setShowAlert(false)
        } catch(error) {
            console.error('Error fetching data:', error)

            setShowAlert(true)
            if (stopChanged) {
                setTimingData({"services": []});
            }
        }
    }

    function getStopListSortedByDistance(data, distanceLimit = Number.MAX_VALUE) {
        // Sort the stopList by distance in ascending order and limit by distance
        let stopsWithDistanceSorted = Object.keys(data).map((stopCode) => {
            return {stopCode: stopCode, distance: getDistance(data[stopCode]['lat'], data[stopCode]['lng'])};
        }).sort((a, b) => a.distance - b.distance);
        let stopList = [];
        for (let i = 0; i < stopsWithDistanceSorted.length; i++) {
            if (i < 5 || stopsWithDistanceSorted[i].distance < distanceLimit) {
                stopList.push(stopsWithDistanceSorted[i].stopCode);
            }
        }
        return stopList;
    }

    function getFilteredStopData(inputText) {
        const cleanString = (str) => str.replace(/[^\w\s]/gi, '').toUpperCase();

        return Object.fromEntries(
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
    }

    async function handleSearch(inputText) {
        function getStopListSortedByName(data) {
            // Sort the stopList by name in ascending order
            return [...Object.keys(data)].sort((a, b) => data[a].name.localeCompare(data[b].name));
        }

        if (inputText === 'nearby' && isGeolocationEnabled) {
            setIsNearbyClicked(true)
            setStopList(getStopListSortedByDistance(data['stop_data'], 1))
        } else {
            setIsNearbyClicked(false)
            const filteredStopData = getFilteredStopData(inputText);
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
        let direction = Object.keys(busData).find(direction => busData[direction]['stops'].slice(-2).includes(dest_code));
        if (direction === undefined) {
            // For certain buses like 160, the destination code is not the route's destination. Default to direction 1 in this case.
            direction = "1";
        }

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

    // Memoize the bus stop markers to avoid unnecessary re-rendering
    const memoizedMarkers = useMemo(() => {
        return data.stop_data && Object.entries(data.stop_data).map(([busStopCode, busStop]) => (
            <CircleMarker 
                key={busStopCode}
                center={[busStop.lat, busStop.lng]}  // Use lat/lng from the data object
                radius={getMarkerRadius(zoomLevel)}  // Adjust size for bus stops
                fillColor="grey"  // Color for bus stop markers
                color="white"
                fillOpacity={0.7}
                weight={1}
                eventHandlers={{
                    click: () => fetchStopInfo(busStopCode) // Handle click event
                }} />
        ));
    }, [data, zoomLevel]);

    return (
        <div className={`container mt-4 mb-4 ${active ? '' : 'd-none'}`} style={{ height: '80vh', width: '100%' }}>
            <MapContainer 
            center={[1.3521, 103.8198]} 
            zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                <MapZoomHandler />
                
                {coords && coords.latitude && coords.longitude && (
                    <CircleMarker 
                    center={[coords.latitude, coords.longitude]} 
                    radius={10} 
                    fillColor="black"
                    color="grey" 
                    fillOpacity={0.5}
                    weight={3} />
                )}

                {/* Loop through the bus stop data and display a CircleMarker for each bus stop */}
                {memoizedMarkers}
            </MapContainer>
            <TimingErrorAlert showAlert={showAlert}
                              setShowAlert={setShowAlert} />
            {timingData['services'] &&
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
    );
};

export default Map;
