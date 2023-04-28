function BusStopSelector({ stops, selectStop, selectedStop }) {
    return (
    <>
        <hr />
        <div className='row justify-content-center mb-3'>
            <div className='col text-center'>
                <h5>Select Bus Stop:</h5>
                <div className='list-group overflow-scroll mx-auto col-md-3'
                style={{'maxHeight': '300px'}}>
                    {stops.map(stop => (
                        <button
                        key={stop.stopSequence}
                        onClick={() => selectStop(stop.stopSequence)}
                        className={`list-group-item ${stop.stopSequence === selectedStop ? 'active' : ''} list-group-item-action text-center`}>
                            { stop.name }
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </>
    )
}

export default BusStopSelector