import BusSelectionRow from "./BusSelectionRow";

function BusSelector({ busData, busList, selectedBus, selectedDirection, handleBusSelect }) {
    const sortedBusList = [...busList].sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);

        if (numA < numB) return -1;
        if (numA > numB) return 1;

        const letterA = a.replace(numA, '') || '';
        const letterB = b.replace(numB, '') || '';

        if (letterA < letterB) return -1;
        if (letterA > letterB) return 1;

        return 0;
    });

    return (
    <>
        <hr />
        <div className='row mb-3'>
            <div className='col'>
                <h4>Buses</h4>
                <div className='list-group overflow-scroll mx-auto'
                     style={{'maxHeight': '300px'}}>
                    {sortedBusList.map(busNum => {
                        return (
                            <BusSelectionRow
                                key={busNum}
                                bus={busNum}
                                busData={busData[busNum]}
                                selectedBus={selectedBus}
                                selectedDirection={selectedDirection}
                                handleBusSelect={handleBusSelect}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    </>
    )
}

export default BusSelector;