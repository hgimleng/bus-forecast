function BusArrivalDisplay({ arrivalData }) {
    return (
        <div className='row justify-content-center'>
            <hr />
            <div className='col-auto'>
                <h5>Bus Arrival Timing:</h5>
                {arrivalData.map(timing => (
                    <li>{ timing }</li>
                ))}
            </div>
        </div>
    )
}

export default BusArrivalDisplay