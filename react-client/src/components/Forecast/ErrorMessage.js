function ErrorMessage({ message }) {
    return (
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <div className='alert alert-danger' role='alert'>
                { message }
                </div>
            </div>
        </div>
    )
}

export default ErrorMessage