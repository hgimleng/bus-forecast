function InputSelection({ title, input, handleInput }) {
    const inputValue = input === undefined ? '' : input;
    return (
        <div className='row g-0 mb-2' style={{ display: 'flex', alignItems: 'stretch' }}>
            <div className='col-2' style={{ display: 'flex', alignItems: 'center' }}>
                <strong>{title}</strong>
            </div>
            <div className='col-10'>
                <div className="input-group mb-3">
                    <input type="search" className="form-control"
                           onChange={(e) => handleInput(e.target.value)}
                           value={inputValue} />
                </div>
            </div>
        </div>
    )
}

export default InputSelection;