function BusArrivalCellDisplay({time, type, load, prevBusTime, currentTime, stopLatLon, busLatLon}) {
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
        const timeDiffString = `${prefix}${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
      
        return timeDiffString;
    }

    function convertType(type) {
        switch (type) {
            case 'SD':
                return 'Single Deck';
            case 'DD':
                return 'Double Deck';
            case 'BD':
                return 'Bendy';
            default:
                return 'Unknown';
        }
    }

    function convertLoad(load) {
        switch (load) {
            case 'SEA':
                return 'Low';
            case 'SDA':
                return 'Med';
            case 'LSD':
                return 'High';
            default:
                return 'Unknown';
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
            const distance = R * c; // Distance in km
            return distance;
        }

        if (latLon2[0] == 0 || latLon2[1] == 0) {
            return '';
        }

        const distance = getDistanceFromLatLonInKm(latLon1[0], latLon1[1], latLon2[0], latLon2[1]);
        return `, ${distance.toFixed(1)} km`;
    }

    return (
        <td>
            { calculateTimeDifference(time, currentTime) }
            { prevBusTime && <> (+{calculateTimeDifference(time, new Date(prevBusTime))})</> }
            <br />
            <small>
            ({ convertType(type) }, { convertLoad(load) } crowd{ getDistance(stopLatLon, busLatLon) })
            </small>
        </td>
    )
}

export default BusArrivalCellDisplay;
