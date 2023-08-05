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

    function getBusType(busTimings, stopSequence) {
        return busTimings[stopSequence] ? busTimings[stopSequence]['busType'] : ''
    }

    function getBusLoad(busTimings, stopSequence) {
        return busTimings[stopSequence] ? busTimings[stopSequence]['load'] : ''
    }

    function getBusLatlng(busTimings, stopSequence) {
        return busTimings[stopSequence] ? busTimings[stopSequence]['latlng'].join(', ') : ''
    }

    function getIsSpecial(busTimings, stopSequence) {
        return busTimings[stopSequence] ? busTimings[stopSequence]['isSpecial'] : ''
    }

    function timeDiff(time1, time2) {
        const parseTime = (timeStr) => {
            const [hours, minutes, seconds] = timeStr.split(':').map(Number);
            const day = hours < 4 ? 1 : 0;
            return new Date(0, 0, day, hours, minutes, seconds);
        };
    
        const date1 = parseTime(time1);
        const date2 = parseTime(time2);
        const diffMins = Math.max((date2 - date1) / 60000, 0);

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

    function mapToDebug(busTimings) {
        let validBusEntries = Object.keys(busTimings)
            .filter(key => !busTimings[key].isForecasted)
            .map(key => busTimings[key]);

        let busTypes = validBusEntries.map(entry => entry.busType.split(" ")[0]);
        let isSpecial = validBusEntries.map(entry => entry.isSpecial);
        let loads = validBusEntries.map(entry => entry.load);
        let latlngs = validBusEntries.map(entry => entry.latlng.join(', '));

        busTypes = [...new Set(busTypes)].join(', ');
        isSpecial = [...new Set(isSpecial)].join(', ');
        loads = [...new Set(loads)].join(', ');
        latlngs = [...new Set(latlngs)].join(', ');

        return [busTypes, isSpecial, loads, latlngs];
    }

    return (
        <div className='table-responsive'>
        <table className='table table-striped table-bordered table-sm'>
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
                        <td style={{'white-space': 'nowrap'}}>{ stop['name'] }</td>
                        {arrivalData.map(bus => (
                            <td className={getCellColour(bus['busTimings'], stop['stopSequence'])}>
                                {getBusTiming(bus['busTimings'], stop['stopSequence'])}
                                {process.env.REACT_APP_DEBUG_MODE === 'true' &&
                                 bus['busTimings'][stop['stopSequence']] &&
                                 !bus['busTimings'][stop['stopSequence']]['isForecasted'] && (
                                    <>
                                    <br />
                                    {getBusType(bus['busTimings'], stop['stopSequence'])}
                                    <br />
                                    {getBusLoad(bus['busTimings'], stop['stopSequence'])}
                                    <br />
                                    {getBusLatlng(bus['busTimings'], stop['stopSequence'])}
                                    {getIsSpecial(bus['busTimings'], stop['stopSequence']) && <><br /><b>Special</b></>}
                                    </>
                                )}
                            </td>
                        ))}
                        <td style={{'white-space': 'nowrap'}}>{ getTravelTimeRange(stop['stopSequence'], stop['stopSequence']-1) }</td>
                    </tr>
                  ))
            }
            {process.env.REACT_APP_DEBUG_MODE === 'true' && (
                <tr scope='row' key='summary'>
                    <td style={{'white-space': 'nowrap'}}>Debug Summary</td>
                    {arrivalData.map(bus => (
                        <td>
                            {mapToDebug(bus['busTimings']).map((item) => (
                                <div>{item}</div>
                            )
                            )}
                        </td>
                    ))}
                </tr>
            )}
            </tbody>
        </table>
        </div>
    )
}

export default ArrivalTableView