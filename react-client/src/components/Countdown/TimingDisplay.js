import { useEffect, useState } from "react";
import BusRowDisplay from "./BusRowDisplay";

function TimingDisplay({ selectedStop, timingData, stopData, lastUpdateTime, currentTime }) {
    const [userLat, setUserLat] = useState(0);
    const [userLon, setUserLon] = useState(0);

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

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                setUserLat(position.coords.latitude);
                setUserLon(position.coords.longitude);
            }, error => {
                console.error("Error retrieving user's location: ", error);
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, [lastUpdateTime]);

    return (
        <div className='col-auto text-center mb-1'>
            <hr />
            <h4>{ stopData[selectedStop]['name'] }</h4>
            <h6>{ stopData[selectedStop]['road'] } | {selectedStop}</h6>
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
                            key={bus['no']}
                            busNum={bus['no']}
                            arrival1={bus['next']}
                            arrival2={bus['next2']}
                            arrival3={bus['next3']}
                            currentTime={currentTime}
                            userLatLon={[userLat, userLon]}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TimingDisplay;