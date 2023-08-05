import { useState } from 'react'

function SearchForm({ onFind, setUserLocation }) {
    const [text, setText] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            });
          }
        onFind(text.toUpperCase())
    }

    const handleChange = (e) => {
        let inputValue = e.target.value;
        // RegEx to remove non-alphanumeric characters
        const alphanumeric = inputValue.replace(/[^a-zA-Z0-9]/g, '');
        setText(alphanumeric);
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

export default SearchForm