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
    const serviceBuses = timingData['services'].map(bus => bus['no']);
    const nonServiceBuses = stopData[selectedStop]['buses'].filter(bus => !serviceBuses.includes(bus));

    function getOppositeStop() {
        const lastDigit = selectedStop.slice(-1);
        const oppositeStop = selectedStop.slice(0, -1) + (10 - parseInt(lastDigit, 10)).toString();
        return stopData[oppositeStop] ? oppositeStop : '';
    }

    function getDestinationInfo(busNum, nextBusTimingInfo) {
        const specialStops = ["46008", "46009", "59008", "59009"];
        const specialBuses = ["812", "911", "912", "913"];
        const specialDestinationInfoMap = {
            "812": ["East", "West"],
            "911": ["East", "West"],
            "912": ["East", "West"],
            "913": ["East", "West"]
        };
        if (showDestinationBuses.includes(busNum)) {
            return stopData[nextBusTimingInfo['destination_code']]['name'];
        } else if (specialStops.includes(selectedStop) && specialBuses.includes(busNum)) {
            return specialDestinationInfoMap[busNum][nextBusTimingInfo['visit_number'] - 1];
        }
        return "";
    }

    function getVisitInfo(busNum) {
        if (stopData[selectedStop]['visit_info'][busNum]) {
            return stopData[selectedStop]['visit_info'][busNum];
        }
        return ['', ''];
    }

    function getNotInServiceBuses() {
        const serviceBuses = timingData['services'].map(bus => bus['no']);
        return stopData[selectedStop]['buses']
            .filter(bus => !serviceBuses.includes(bus));
    }

    function getKeyByBus(busNum, nextBusTimingInfo) {
        return `${busNum}-${nextBusTimingInfo['destination_code']}-${nextBusTimingInfo['visit_number']}`;
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
                { stopData[selectedStop]['road'] } | {stopCode}{distance && ` | ${distance.toFixed(1)} km`}
                <DirectionIcon angle={direction}/>
            </h6>
            <table className='table table-striped table-bordered'>
                <caption>
                    {nonServiceBuses.length > 0 && <>Not in service: { getNotInServiceBuses().join(', ') }<br /></>}
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
                    .map((bus) => (
                        <BusRowDisplay
                            key={getKeyByBus(bus['no'], bus['next'])}
                            busNum={bus['no']}
                            arrival1={bus['next']}
                            arrival2={bus['next2']}
                            arrival3={bus['next3']}
                            currentTime={currentTime}
                            stopLatLon={stopLatLon}
                            onBusRowClick={onBusRowClick}
                            settings={settings}
                            getDirection={getDirection}
                            destinationInfo={getDestinationInfo(bus['no'], bus['next'])}
                            visitInfo={getVisitInfo(bus['no'])}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TimingDisplay;