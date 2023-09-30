function TimingErrorAlert({ showAlert, setShowAlert }) {
    return (
        <>{showAlert &&
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
            Error fetching bus timings. Please try again.
            <button type="button" onClick={() => setShowAlert(false)} className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        }</>
    )
}

export default TimingErrorAlert;