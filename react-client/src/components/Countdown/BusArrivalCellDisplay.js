function BusArrivalCellDisplay({time, type, load, prevBusTime, currentTime}) {
    function calculateTimeDifference(dateString, currentTime) {
        // Parse the date string into a date object
        const targetDate = new Date(dateString);
      
        // Calculate the difference in milliseconds
        let diffMilliseconds = targetDate - currentTime;
      
        // Determine if time difference is negative
        let prefix = "";
        if (diffMilliseconds < 0) {
          prefix = "-";
          diffMilliseconds = -diffMilliseconds;
        }
      
        // Calculate minutes and seconds
        const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
        const diffSeconds = Math.floor((diffMilliseconds % (1000 * 60)) / 1000);
      
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

    return (
        <td>
            { calculateTimeDifference(time, currentTime) }
            { prevBusTime && <> (+{calculateTimeDifference(time, new Date(prevBusTime))})</> }
            <br />
            <small>
            ({ convertType(type) }, { convertLoad(load) } crowd)
            </small>
        </td>
    )
}

export default BusArrivalCellDisplay;
