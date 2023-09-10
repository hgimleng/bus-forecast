import BusButton from "./BusButton";

function BusSelector({ busData, busList, selectedBus, selectedDirection, handleBusSelect }) {
    return (
    <>
        <hr />
        <div className='row mb-3'>
            <h4>Buses</h4>
            <div className='col d-grid gap-1'>
                {busList.map(bus => {
                    const number = bus['number']
                    const direction = bus['direction']
                    return (
                        <BusButton
                            key={`${number}-${direction}`}
                            bus={number}
                            destName={busData[number][direction]['dest_name']}
                            selected={number===selectedBus && direction===selectedDirection}
                            onClick={() => handleBusSelect(number, direction)}
                        />
                    )
                })}
            </div>
        </div>
    </>
    )
}

export default BusSelector;