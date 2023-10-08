import BusButton from "./BusButton";

function BusSelectionRow({ bus, busData, selectedBus, selectedDirection, handleBusSelect }) {
    return (
        <div className='row g-0' style={{ display: 'flex', alignItems: 'stretch' }}>
            <div className='col-2' style={{ display: 'flex', alignItems: 'center' }}>
                <strong>{bus}</strong>
            </div>
            <div className='col-10'>
            {Object.keys(busData).map(direction => {
                const description = busData[direction]['loop_desc'] ? `Loop at ${busData[direction]['loop_desc']}` : `To ${busData[direction]['dest_name']}`;
                return (
                    <BusButton
                        key={direction}
                        bus={bus}
                        direction={direction}
                        isSelected={selectedBus === bus && selectedDirection === direction}
                        description={description}
                        handleBusSelect={handleBusSelect}
                    />
                )
            })}
            </div>
        </div>
    )
}

export default BusSelectionRow;