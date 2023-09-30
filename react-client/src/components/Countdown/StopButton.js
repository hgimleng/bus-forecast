function StopButton({ code, name, road, distance, onClick, selected, isLoading }) {
    return (
        <button
        onClick={onClick}
        className={`list-group-item ${selected ? 'active disabled' : ''} list-group-item-action`}
        style={{textAlign: 'left'}}>
            <div>
                <strong>{name}</strong>
                { selected && isLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> }
                <br />
                <small>
                    {road} | {code}{distance && ` | ${distance.toFixed(1)}`} km
                </small>
            </div>
        </button>
    )
}

export default StopButton;