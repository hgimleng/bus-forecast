import 'bootstrap-icons/font/bootstrap-icons.css';
import BDIcon from "../Icon/BDIcon";
import SDIcon from "../Icon/SDIcon";
import DDIcon from "../Icon/DDIcon";

function BusArrivalCellDisplay({time, type, load, prevBusTime, currentTime, stopLatLon, busLatLon, settings}) {
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
            return R * c; // Distance in km
        }

        if (latLon2[0] === 0 || latLon2[1] === 0) {
            return '';
        }

        const distance = getDistanceFromLatLonInKm(latLon1[0], latLon1[1], latLon2[0], latLon2[1]);
        return ` ${distance.toFixed(1)} km`;
    }

    // Function to calculate bearing between two points
    function getBearing(startLatLon, endLatLon) {
        const [startLat, startLon] = startLatLon;
        const [endLat, endLon] = endLatLon;

        const dLon = (endLon - startLon);
        const x = Math.cos(endLat) * Math.sin(dLon);
        const y = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLon);
        let bearing = Math.atan2(x, y);
        bearing = (bearing * 180) / Math.PI;

        // Convert bearing to a positive value
        bearing = (bearing + 360) % 360;

        return bearing;
    }

    const distance = getDistance(stopLatLon, busLatLon);
    const bearing = getBearing(busLatLon, stopLatLon);

    return (
        <td>
            <div style={{ height:'1.4em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                { convertToTimeDisplay(time) }
                <small style={{ marginLeft: '0.4em' }}>
                    { convertToIcon(type, load) }
                </small>
            </div>
            { prevBusTime && <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    (+{calculateTimeDifference(time, new Date(prevBusTime))})
                </div>
            </>}
            { distance !== '' &&
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <small>{ distance }</small>
                    <i className={`bi bi-arrow-up-short`} style={{ marginBottom: '-0.2em', transform: `rotate(${bearing}deg)` }} />
                </div>
            }
        </td>
    )
}

export default BusArrivalCellDisplay;
