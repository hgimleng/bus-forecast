import StopButton from "./StopButton";

function StopSelector({ stopData, stopList, setSelectedStop }) {
    // Sort the stopList by distance in ascending order and limit to 100 stops
    const sortedStopList = [...stopList].sort((a, b) => stopData[a].distance - stopData[b].distance).slice(0, 100)

    return (
    <>
        <hr />
        <div className='row justify-content-center mb-3'>
            <div className='col text-center'>
                <h4>Bus Stops</h4>
                <div className='list-group overflow-scroll mx-auto'
                style={{'maxHeight': '300px'}}>
                    {sortedStopList.map((stopCode) => {
                        return (
                            <StopButton
                            key={stopCode}
                            code={stopCode}
                            name={stopData[stopCode]['name']}
                            road={stopData[stopCode]['road']}
                            distance={stopData[stopCode]['distance']}
                            onClick={() => setSelectedStop(stopCode)}
                            selected={false}
                            isLoading={false}
                            />
                        )
                        })}
                </div>
            </div>
        </div>
    </>
    )
}

export default StopSelector;