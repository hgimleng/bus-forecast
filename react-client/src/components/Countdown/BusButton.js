function BusButton({ bus, direction, isSelected, description, handleBusSelect }) {
    return (
        <button
            className={`list-group-item list-group-item-action ${isSelected ? 'active disabled' : ''}`}
            style={{textAlign: 'left'}}
            onClick={() => handleBusSelect(bus, direction)}>
            <div>
                <small>
                    {description}
                </small>
            </div>
        </button>
    )
}

export default BusButton;