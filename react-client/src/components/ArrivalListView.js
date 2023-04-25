function ArrivalListView({ arrivalData, updateTime, selectedStop }) {
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
                    <th scope='col'>Current Location</th>
                </tr>
            </thead>
            <tbody>
                {arrivalData
                .filter((item) => item['busTimings'][selectedStop])
                .map((item) => (
                <tr scope='row' key={item['busId']} class={item['busTimings'][selectedStop]['isForecasted'] ? 'table-warning' : 'table-success'}>
                    <td>{ item['busId'] }</td>
                    <td>{ item['busTimings'][selectedStop]['time'] }</td>
                    <td>{ item['busLocation'] }</td>
                </tr>
                ))}
            </tbody>
        </table>
    )
}

export default ArrivalListView
