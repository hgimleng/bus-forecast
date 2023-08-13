function BusArrivalCellDisplay({time, type, load, prevBusTime, currentTime}) {
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
