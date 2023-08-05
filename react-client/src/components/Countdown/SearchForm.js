import { useState } from 'react'

function SearchForm({ onFind }) {
    const [text, setText] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        onFind(text.toUpperCase())
    }

    const handleChange = (e) => {
        let inputValue = e.target.value;
        setText(inputValue);
    }

    return (
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <form onSubmit={handleSubmit} className='input-group mb-3'>
                    <input 
                    type='search'
                    className='form-control'
                    placeholder='Bus stop code'
                    maxLength='5'
                    style={{'width': '150px'}}
                    onChange={handleChange}
                    value={text}
                    />
                    <button
                    className='btn btn-success'
                    type='submit'>
                        Find
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SearchForm;
