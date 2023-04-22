import React, { useState } from 'react'

function BusArrivalDisplay({ arrivalData, stopName, updateTime, refreshData }) {
    const [listView, setListView] = useState(true)
    const [refreshCountdown, setRefreshCountdown] = useState(0)

    function handleRefresh() {
        refreshData()
        setRefreshCountdown(15)

        const countdown = setInterval(() => {
            setRefreshCountdown((prevSeconds) => {
              if (prevSeconds === 1) {
                clearInterval(countdown);
                return 0;
              }
              return prevSeconds - 1;
            });
          }, 1000);
    }

    return (
        <div className='row justify-content-center'>
            <hr />
            <div className='col-auto text-center'>
                <h5>Arrivals for <u>{ stopName }</u></h5>
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
                        {arrivalData.map((item, index) => (
                        <tr scope='row' class={item['isOriginal'] ? 'table-success' : 'table-warning'}>
                            <td>{ item['bus'] }</td>
                            <td>{ item['time'] }</td>
                            <td>{ item['currentLoc'] }</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                <button
                className={`btn ${listView ? 'btn-primary active' : 'btn-outline-primary'} me-2`}
                onClick={() => setListView(true)}>
                List View
                </button>
                <button
                className={`btn ${listView ? 'btn-outline-primary' : 'btn-primary active'} me-2`}
                onClick={() => setListView(false)}>
                Table View
                </button>
                <button
                className='btn btn-success'
                onClick={handleRefresh}
                disabled={refreshCountdown > 0}>
                    Refresh{refreshCountdown > 0 ? `(${refreshCountdown}s)` : ''}
                </button>
            </div>
        </div>
    )
}

export default BusArrivalDisplay