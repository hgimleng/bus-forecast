function DirectionSelector({ directions }) {
    return (
        <div class="row justify-content-center">
            <hr />
            <div class="col text-center">
                <h5>Select Direction:</h5>
                <div class="btn-group" role="group">
                    {directions.map(direction => (
                        <button
                        className='btn btn-primary'
                        >
                            {direction}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default DirectionSelector