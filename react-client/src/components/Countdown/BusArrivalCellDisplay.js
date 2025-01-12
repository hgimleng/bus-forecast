import 'bootstrap-icons/font/bootstrap-icons.css';
import BDIcon from "../Icon/BDIcon";
import SDIcon from "../Icon/SDIcon";
import DDIcon from "../Icon/DDIcon";
import DirectionIcon from "../Icon/DirectionIcon";
import { getDistanceFromLatLonInKm } from "../../utilities/utils";

function BusArrivalCellDisplay({time, type, load, prevBusTime, currentTime, stopLatLon, busLatLon, settings, getDirection, visitInfo}) {
    function convertToTimeDisplay(dateString) {
        function getTimeString() {
            const date = new Date(dateString);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        if (settings["arrivalDisplay"] === "Static") {
            return getTimeString();
        } else {
            return calculateTimeDifference(dateString, currentTime);
        }
    }

    function calculateTimeDifference(dateString, currentTime) {
        // Parse the date string into a date object
        const targetDate = new Date(dateString);
      
        // Calculate the difference in seconds
        let totalDiffSeconds = Math.floor((targetDate - currentTime) / 1000);
      
        // Determine if time difference is negative
        let prefix = "";
        if (totalDiffSeconds < 0) {
          prefix = "-";
          totalDiffSeconds = -totalDiffSeconds;
        }
      
        // Calculate minutes and seconds
        const diffMinutes = Math.floor(totalDiffSeconds / 60);
        const diffSeconds = totalDiffSeconds % 60;
      
        // Format the difference as "MM:SS"
        return `${prefix}${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
    }

    function convertToIcon(type, loadStr) {
        const load = convertLoad(loadStr)

        switch (type) {
            case 'DD':
                return <DDIcon load={load} />;
            case 'BD':
                return <BDIcon load={load} />;
            default:
                return <SDIcon load={load} />;
        }
    }

    function convertLoad(load) {
        switch (load) {
            case 'SDA':
                return 2;
            case 'LSD':
                return 3;
            default:
                return 1;
        }
    }

    function getDistance(latLon1, latLon2) {
        if (latLon2[0] === 0 || latLon2[1] === 0) {
            return '';
        }

        const distance = getDistanceFromLatLonInKm(latLon1[0], latLon1[1], latLon2[0], latLon2[1]);
        return ` ${distance.toFixed(1)} km`;
    }

    const distance = getDistance(stopLatLon, busLatLon);
    const direction = getDirection(busLatLon[0], busLatLon[1]);

    return (
        <td>
            <div style={{ height:'1.4em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                { convertToTimeDisplay(time) }
                <small style={{ marginLeft: '0.4em' }}>
                    { convertToIcon(type, load) }
                </small>
            </div>
            { visitInfo !== '' &&
                <div style={{ textAlign: 'center' }}>
                    { visitInfo }
                </div>
            }
            { prevBusTime && <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    (+{calculateTimeDifference(time, new Date(prevBusTime))})
                </div>
            </> }
            { distance !== '' &&
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <small>{ distance }</small>
                    <DirectionIcon angle={direction} />
                </div>
            }
        </td>
    )
}

export default BusArrivalCellDisplay;
