import { getDistanceFromLatLonInKm } from "../../utilities/utils";

function BusStopSelector({ stops, selectStop, selectedStop, isLoading, userLocation }) {
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
                        let distanceDisplay = "";
                        let stopNameWidth = "100%";

                        // If userLocation is provided, calculate and display the distance
                        if (userLocation && userLocation.latitude && userLocation.longitude) {
                            const distance = getDistanceFromLatLonInKm(
                                userLocation.latitude,
                                userLocation.longitude,
                                stop.latitude,
                                stop.longitude
                            );
                            distanceDisplay = ` (${distance.toFixed(1)} km)`;
                            stopNameWidth = "70%";
                        }
                        
                        return (
                            <button
                            key={stop.stopSequence}
                            onClick={() => selectStop(stop.stopSequence)}
                            className={`list-group-item ${isSelected ? 'active disabled' : ''} list-group-item-action text-center`}>
                                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                    <div style={{width: stopNameWidth, textAlign: "center"}}>
                                        {stop.name}
                                        { showSpinner && <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> } 
                                    </div>
                                    <div style={{ color: 'grey' }}>{distanceDisplay}</div>
                                </div>
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