import React, { useState } from 'react'
import ArrivalListView from './ArrivalListView'
import ArrivalTableView from './ArrivalTableView'
import DisclaimerMessage from './DisclaimerMessage'

function BusArrivalDisplay({ arrivalData, updateTime, refreshData, selectedStop, stops, busDiff, isLoading }) {
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

    function isConsistent(arrivalData, busDiff) {
        for (const timeDiff of Object.values(busDiff)) {
            if (Math.max(...timeDiff) - Math.min(...timeDiff) > 240) {
                return false
            }
        }
        for (const bus of Object.values(arrivalData)) {
            // Check if all non forecasted timings have the same bus type and special departure status
            const actualTimings = Object.values(bus['busTimings']).filter(t => !t['isForecasted'])
            const busType = new Set(actualTimings.map(t => t['busType']))
            const isSpecial = new Set(actualTimings.map(t => t['isSpecial']))
            if (busType.size > 1 || isSpecial.size > 1) {
                return false
            }
        }
        return true
    }

    return (
        <div className='row justify-content-center'>
            <hr />
            <div className='col-auto text-center mb-1'>
                <h5>Arrivals for <u>{ stops.filter(s => s['stopSequence'] === selectedStop)[0]['name'] }</u></h5>
                {!isConsistent(arrivalData, busDiff) && <DisclaimerMessage message='Forecast may be inconsistent and refresh is recommended.' />}
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
                    {isLoading && <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                    Refresh{refreshCountdown > 0 ? ` (${refreshCountdown}s)` : ''}
                </button>
            </div>
        </div>
    )
}

export default BusArrivalDisplay