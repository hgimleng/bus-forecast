function DisclaimerMessage({ message }) {
    return (
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <div className='alert alert-warning' role='alert'>
                { message }
                </div>
            </div>
        </div>
    )
}

export default DisclaimerMessage