import {useEffect} from "react";
import StopButton from "./StopButton";

function StopSelector({ stopData, stopList, setSelectedStop, selectedStop, getDistance, getDirection }) {
    useEffect(() => {
        // If there is only 1 stop in the list, select it
        if (stopList.length === 1) {
            setSelectedStop(stopList[0])
        }
    }, [stopList])

    return (
    <>
        <hr />
        <div className='row mb-3'>
            <div className='col'>
                <h4>Bus Stops</h4>
                <div className='list-group overflow-scroll mx-auto'
                style={{'maxHeight': '300px'}}>
                    {stopList.map((stopCode, index) => {
                        return (
                            <StopButton
                            key={`${stopCode}-${index}`}
                            code={stopCode}
                            name={stopData[stopCode]['name']}
                            road={stopData[stopCode]['road']}
                            distance={getDistance(stopData[stopCode]['lat'], stopData[stopCode]['lng'])}
                            direction={getDirection(stopData[stopCode]['lat'], stopData[stopCode]['lng'])}
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