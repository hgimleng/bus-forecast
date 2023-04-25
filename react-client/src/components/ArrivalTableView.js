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

    return (
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
                    </tr>
                  ))
            }
            </tbody>
        </table>
    )
}

export default ArrivalTableView