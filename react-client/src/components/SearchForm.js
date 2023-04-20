import { useState } from 'react'

function SearchForm({ onFind }) {
    const [text, setText] = useState('')

    return (
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <div className='input-group mb-3'>
                    <input 
                    type='text'
                    className='form-control'
                    placeholder='Bus no.'
                    maxLength='4'
                    style={{'width': '80px'}}
                    onChange={(e) => setText(e.target.value)}
                    />
                    <button
                    className='btn btn-success'
                    onClick={() => onFind(text)}>
                        Find
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SearchForm