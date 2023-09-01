function BusButton({ bus, destName, selected, onClick }) {
    return (
        <div className="mb-1">
            <button
            className={selected ? 'btn btn-primary' : 'btn btn-outline-primary'}
            onClick={onClick}>
                {bus} (To {destName})
            </button>
            <br />
        </div>
    )
}

export default BusButton;