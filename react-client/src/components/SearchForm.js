function SearchForm() {
    return (
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <div className='input-group mb-3'>
                    <input 
                    type='text'
                    className='form-control'
                    placeholder='Bus no.'
                    maxlength='4'
                    style={{'width': '80px'}}
                    />
                    <button
                    className='btn btn-success'>
                        Find
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SearchForm