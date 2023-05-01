import React, { useState } from 'react'
import ArrivalListView from './ArrivalListView'
import ArrivalTableView from './ArrivalTableView'

function BusArrivalDisplay({ arrivalData, updateTime, refreshData, selectedStop, stops, busDiff }) {
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
          }, 1000)
    }

    return (
        <div className='row justify-content-center'>
            <hr />
            <div className='col-auto text-center mb-1'>
                <h5>Arrivals for <u>{ stops.filter(s => s['stopSequence'] === selectedStop)[0]['name'] }</u></h5>
                {listView 
                    ? <ArrivalListView arrivalData={arrivalData} updateTime={updateTime} selectedStop={selectedStop} busDiff={busDiff} /> 
                    : <ArrivalTableView arrivalData={arrivalData} updateTime={updateTime} selectedStop={selectedStop} stops={stops} /> }
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
                    Refresh{refreshCountdown > 0 ? ` (${refreshCountdown}s)` : ''}
                </button>
            </div>
        </div>
    )
}

export default BusArrivalDisplay