function InputSelection({ title, input, handleInput }) {
    return (
        <div className='row g-0 mb-5' style={{ display: 'flex', alignItems: 'stretch' }}>
            <div className='col-2' style={{ display: 'flex', alignItems: 'center' }}>
                <strong>{title}</strong>
            </div>
            <div className='col-10'>
                <div className="input-group mb-3">
                    <input type="search" className="form-control"
                           onChange={(e) => handleInput(e.target.value)}
                           value={input} />
                </div>
            </div>
        </div>
    )
}

export default InputSelection;