import BusRowDisplay from "./BusRowDisplay";
import 'bootstrap-icons/font/bootstrap-icons.css';
import {useEffect} from "react";
import DirectionIcon from "../Icon/DirectionIcon";

function TimingDisplay({ selectedStop, timingData, stopData, lastUpdateTime, currentTime, onBusRowClick, setSelectedStop, onRendered, settings, getDistance, getDirection, getModifiedStopCode }) {

    useEffect(() => {
        // Notify parent that the component has rendered
        onRendered();
    }, []);

    const sortedTimingData = timingData['services'].sort((a, b) => {
        function compareByBusNum() {
            // Extract numeric and alphabetic parts of bus numbers
            const matchA = a['no'].match(/^(\d+)([a-zA-Z]?)$/);
            const matchB = b['no'].match(/^(\d+)([a-zA-Z]?)$/);

            const numA = parseInt(matchA[1], 10);
            const numB = parseInt(matchB[1], 10);
            const letterA = matchA[2];
            const letterB = matchB[2];

            // Compare numeric parts
            if (numA !== numB) {
                return numA - numB;
            }

            // If numeric parts are the same, compare alphabetic parts
            return letterA.localeCompare(letterB);
        }

        function comparedByArrivalTime() {
            const arrivalA = a['next']['duration_ms'];
            const arrivalB = b['next']['duration_ms'];

            return arrivalA - arrivalB;
        }

        if (settings['sortBy'] === 'Arrival time') {
            return comparedByArrivalTime();
        } else {
            return compareByBusNum();
        }
    })
    const stopLatLon = [stopData[selectedStop]['lat'], stopData[selectedStop]['lng']];
    const stopCode = getModifiedStopCode(selectedStop);
    const distance = getDistance(stopLatLon[0], stopLatLon[1]);
    const direction = getDirection(stopLatLon[0], stopLatLon[1]);
    const showDestinationBuses = stopData[selectedStop]['show_destination'];

    function getOppositeStop() {
        const lastDigit = selectedStop.slice(-1);
        const oppositeStop = selectedStop.slice(0, -1) + (10 - parseInt(lastDigit, 10)).toString();
        return stopData[oppositeStop] ? oppositeStop : '';
    }

    function getDestinationInfo(busNum, destinationCode) {
        if (showDestinationBuses.includes(busNum)) {
            return stopData[destinationCode]['name'];
        }
        return "";
    }

    return (
        <div className='col-auto mb-5'>
            <hr />
            <div className="d-flex align-items-center">
                <h4>{ stopData[selectedStop]['name'] }</h4>
                {getOppositeStop() !== '' &&
                <i className="bi bi-shuffle ms-2"
                   onClick={() => setSelectedStop(getOppositeStop())}></i>}
            </div>
            <h6 style={{ display: 'flex'}}>
                { stopData[selectedStop]['road'] } | {stopCode}{distance && ` | ${distance.toFixed(1)}`} km
                <DirectionIcon angle={direction}/>
            </h6>
            <table className='table table-striped table-bordered'>
                <caption>
                    Last Updated: { lastUpdateTime }
                </caption>
                <thead>
                    <tr>
                        <th scope='col'></th>
                        <th scope='col' className="text-center">Bus 1</th>
                        <th scope='col' className="text-center">Bus 2</th>
                        <th scope='col' className="text-center">Bus 3</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTimingData
                    .map((bus, index) => (
                        <BusRowDisplay
                            key={index}
                            busNum={bus['no']}
                            arrival1={bus['next']}
                            arrival2={bus['next2']}
                            arrival3={bus['next3']}
                            currentTime={currentTime}
                            stopLatLon={stopLatLon}
                            onBusRowClick={onBusRowClick}
                            settings={settings}
                            getDirection={getDirection}
                            destinationInfo={getDestinationInfo(bus['no'], bus['next']['destination_code'])}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TimingDisplay;