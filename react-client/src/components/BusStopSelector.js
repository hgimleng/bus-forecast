function BusStopSelector({ stops, selectStop }) {
    return (
    <>
        <hr />
        <div className='row justify-content-center'>
            <div className='col text-center'>
                <h5>Select Bus Stop:</h5>
                <div className='list-group'
                style={{'maxHeight': '300px', 'overflowY': 'auto', 'width': '300px', 'margin': '0 auto'}}>
                    {stops.map(stop => (
                        <button
                        key={stop.stopSequence}
                        onClick={() => selectStop(stop.stopSequence)}
                        className="list-group-item list-group-item-action text-center">
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