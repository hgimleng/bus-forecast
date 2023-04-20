function BusStopSelector({ stops }) {
    return (
    <>
        <hr />
        <div className='row justify-content-center'>
            <div className='col text-center'>
                <h5>Select Bus Stop:</h5>
                <div className='list-group'
                style={{'max-height': '300px', 'overflow-y': 'auto', 'width': '300px', 'margin': '0 auto'}}>
                    {stops.map(stop => (
                        <button
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