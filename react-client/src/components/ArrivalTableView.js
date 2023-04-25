function ArrivalTableView({ arrivalData, updateTime, selectedStop, stops }) {
    function getCellColour(busTimings, stopSequence) {
        if (!busTimings[stopSequence]) {
          return ''
        }
        return busTimings[stopSequence]['isForecasted'] ? 'table-warning' : 'table-success'
    }

    function getBusTiming(busTimings, stopSequence) {
        if (!busTimings[stopSequence]) {
            return '-'
        }
        return busTimings[stopSequence]['time']
    }

    function timeDiff(time1, time2) {
        const parseTime = (timeStr) => {
            const [hours, minutes, seconds] = timeStr.split(':').map(Number);
            return new Date(0, 0, 0, hours, minutes, seconds);
        };
    
        const date1 = parseTime(time1);
        const date2 = parseTime(time2);
        const diffMins = Math.abs(date1 - date2) / 60000;

        // Round off to 1 decimal place
        return Math.round(diffMins * 10) / 10
    }

    function getTravelTimeRange(startStop, endStop) {
        let minTime = -1
        let maxTime = -1
        for (const bus of arrivalData) {
            if (bus['busTimings'][startStop] && bus['busTimings'][endStop]) {
                const time = timeDiff(bus['busTimings'][endStop]['time'], bus['busTimings'][startStop]['time'])
                if (minTime == -1 || time < minTime) {
                    minTime = time
                }
                if (maxTime == -1 || time > maxTime) {
                    maxTime = time
                }
            }
        }
        if (minTime == -1 || maxTime == -1) {
            return '-'
        } else {
            return `${minTime} - ${maxTime} mins`
        }
    }

    return (
        <div className='table-responsive'>
        <table className='table table-striped table-bordered'>
            <caption>
                Last Updated: { updateTime }
                <br />
                Orange rows are forecasted and may be inaccurate.
            </caption>
            <thead>
                <tr>
                    <th scope='col' key={0}>Bus Stop</th>
                    {arrivalData.map((item) => (
                        <th scope='col' key={item['busId']}>Bus { item['busId'] }</th>
                    ))}
                    <th scope='col' key={arrivalData.length + 1}>Travel Time</th>
                </tr>
            </thead>
            <tbody>
            {stops
                .filter(stop => stop['stopSequence'] <= parseInt(selectedStop))
                .sort((a, b) => b['stopSequence'] - a['stopSequence'])
                .map(stop => (
                    <tr scope='row' key={stop['stopSequence']}>
                        <td>{ stop['name'] }</td>
                        {arrivalData.map(bus => (
                            <td class={getCellColour(bus['busTimings'], stop['stopSequence'])}>
                                {getBusTiming(bus['busTimings'], stop['stopSequence'])}
                            </td>
                        ))}
                        <td>{ getTravelTimeRange(stop['stopSequence'], stop['stopSequence']-1) }</td>
                    </tr>
                  ))
            }
            </tbody>
        </table>
        </div>
    )
}

export default ArrivalTableView