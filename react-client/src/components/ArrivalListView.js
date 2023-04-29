function ArrivalListView({ arrivalData, updateTime, selectedStop }) {
    function getBusType(busTimings) {
        // Loop through all bus timings and find first non 'NA' bus type
        for (const stopSequence in busTimings) {
            if (busTimings[stopSequence]['busType'] != 'NA') {
                return busTimings[stopSequence]['busType']
            }
        }
    }

    function getBusLoad(busTimings) {
        // Loop through all bus timings and find first non 'NA' bus load
        const colourMap = {'Low': 'text-success', 'Medium': 'text-primary', 'High': 'text-danger', 'NA': ''}
        for (const stopSequence in busTimings) {
            if (busTimings[stopSequence]['load'] != 'NA') {
                const load = busTimings[stopSequence]['load']
                return (<span className={colourMap[load]}>{load}</span>)
            }
        }
    }

    function mapWithTiming(item) {
        return (
            <tr scope='row' key={item['busId']} class={item['busTimings'][selectedStop]['isForecasted'] ? 'table-warning' : 'table-success'}>
                <td>{ item['busId'] }</td>
                <td>{ item['busTimings'][selectedStop]['time'] }</td>
                <td>
                    { item['busLocation'] }
                    <br />
                    <small>
                    ({ getBusType(item['busTimings']) }, { getBusLoad(item['busTimings']) } crowd)
                    </small>
                </td>
            </tr>
        )
    }

    function mapWithoutTiming(item) {
        return (
            <tr scope='row' key={item['busId']} class='table-warning'>
                <td>{ item['busId'] }</td>
                <td>-</td>
                <td>
                    { item['busLocation'] }
                    <br />
                    <small>
                    ({ getBusType(item['busTimings']) }, { getBusLoad(item['busTimings']) } crowd)
                    </small>
                </td>
            </tr>
        )
    }

    return (
        <table className='table table-striped table-bordered'>
            <caption>
                Last Updated: { updateTime }
                <br />
                Orange rows are forecasted and may be inaccurate.
            </caption>
            <thead>
                <tr>
                    <th scope='col'>Bus</th>
                    <th scope='col'>Time</th>
                    <th scope='col'>Next Stop</th>
                </tr>
            </thead>
            <tbody>
                {arrivalData
                .map((item) => item['busTimings'][selectedStop] ? mapWithTiming(item) : mapWithoutTiming(item))}
            </tbody>
        </table>
    )
}

export default ArrivalListView
