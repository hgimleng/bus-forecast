import { useEffect } from "react";
import StopButton from "./StopButton";

function StopSelector({ stopData, stopList, setSelectedStop }) {

    // If there is only 1 stop in the list, select it
    useEffect(() => {
        if (stopList.length == 1) {
            setSelectedStop(stopList[0])
        }
    }, [stopList])

    return (
    <>
        <hr />
        <div className='row justify-content-center mb-3'>
            <div className='col text-center'>
                <h4>Bus Stops</h4>
                <div className='list-group overflow-scroll mx-auto'
                style={{'maxHeight': '300px'}}>
                    {stopList.map((stopCode) => {
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