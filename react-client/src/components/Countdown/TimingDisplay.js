import BusRowDisplay from "./BusRowDisplay";
import 'bootstrap-icons/font/bootstrap-icons.css';
import {useEffect} from "react";

function TimingDisplay({ selectedStop, timingData, stopData, lastUpdateTime, currentTime, onBusRowClick, setSelectedStop, onRendered }) {

    useEffect(() => {
        // Notify parent that the component has rendered
        onRendered();
    }, []);

    const sortedTimingData = timingData['services'].sort((a, b) => {
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
    })
    const stopLatLon = [stopData[selectedStop]['lat'], stopData[selectedStop]['lng']];

    function getOppositeStop() {
        const lastDigit = selectedStop.slice(-1);
        const oppositeStop = selectedStop.slice(0, -1) + (10 - parseInt(lastDigit, 10)).toString();
        return stopData[oppositeStop] ? oppositeStop : '';
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
            <h6>{ stopData[selectedStop]['road'] } | {selectedStop}{stopData[selectedStop]['distance'] && ` | ${stopData[selectedStop]['distance'].toFixed(1)}`} km</h6>
            <table className='table table-striped table-bordered'>
                <caption>
                    Last Updated: { lastUpdateTime }
                </caption>
                <thead>
                    <tr>
                        <th scope='col'></th>
                        <th scope='col'>Bus 1</th>
                        <th scope='col'>Bus 2</th>
                        <th scope='col'>Bus 3</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTimingData
                    .map((bus) => (
                        <BusRowDisplay
                            key={`${bus['no']}-${bus['next']['destination_code']}`}
                            busNum={bus['no']}
                            arrival1={bus['next']}
                            arrival2={bus['next2']}
                            arrival3={bus['next3']}
                            currentTime={currentTime}
                            stopLatLon={stopLatLon}
                            onBusRowClick={onBusRowClick}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TimingDisplay;