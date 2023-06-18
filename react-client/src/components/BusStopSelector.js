function BusStopSelector({ stops, selectStop, selectedStop, isLoading }) {
    return (
    <>
        <hr />
        <div className='row justify-content-center mb-3'>
            <div className='col text-center'>
                <h5>Select Bus Stop:</h5>
                <div className='list-group overflow-scroll mx-auto col-md-3'
                style={{'maxHeight': '300px'}}>
                    {stops.map((stop) => {
                        const isSelected = stop.stopSequence === selectedStop
                        const showSpinner = isSelected && isLoading
                        
                        return (
                            <button
                            key={stop.stopSequence}
                            onClick={() => selectStop(stop.stopSequence)}
                            className={`list-group-item ${isSelected ? 'active disabled' : ''} list-group-item-action text-center`}>
                                {/* { !showSpinner && <>{stop.name}</> } */}
                                {stop.name}
                                { showSpinner && <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> }
                                
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    </>
    )
}

export default BusStopSelector