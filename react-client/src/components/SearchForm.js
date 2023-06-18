import { useState } from 'react'

function SearchForm({ onFind }) {
    const [text, setText] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        onFind(text.toUpperCase())
    }

    return (
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <form onSubmit={handleSubmit} className='input-group mb-3'>
                    <input 
                    type='search'
                    className='form-control'
                    placeholder='Bus no.'
                    maxLength='4'
                    style={{'width': '80px'}}
                    onChange={(e) => setText(e.target.value)}
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

export default SearchForm