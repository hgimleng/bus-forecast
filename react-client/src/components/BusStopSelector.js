// Distance calculation function
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

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