function DirectionSelector({ directions, onClick, selectedDirection }) {
    return (
    <>
        <hr />
        <div className='row justify-content-center'>
            <div className='col text-center'>
                <h5>Select Direction:</h5>
                <div className='btn-group' role='group'>
                    {Object.entries(directions).map(([key, direction]) => (
                        <button
                        key={key}
                        className={`btn btn-primary${selectedDirection === key ? ' active' : ''}`}
                        onClick={() => onClick(key)}
                        >
                            {direction}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </>
    )
}

export default DirectionSelector