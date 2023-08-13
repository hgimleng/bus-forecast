import { useState } from 'react'

function SearchForm({ busData, stopData, setStopList }) {
    const [text, setText] = useState('')

    function handleSubmit(e) {
        e.preventDefault()

        const searchStopsByCode = () => {
            return text in stopData ? [text] : []
        }

        const searchStopsByName = () => {
            // Remove punctuations and convert to uppercase
            const cleanString = (str) => 
                str.replace(/[^\w\s]/gi, '').toUpperCase()

            let stopList = []
            for (let stopCode in stopData) {
                if (cleanString(stopData[stopCode]['name']).includes(cleanString(text))) {
                    stopList.push(stopCode)
                }
            }
            return stopList
        }

        setStopList([...searchStopsByCode(), ...searchStopsByName()])
    }

    function handleChange(e) {
        let inputValue = e.target.value;
        setText(inputValue);
    }

    function handleNearbyClick(e) {
        // Set stopList as the list of 100 stops sorted by distance of stopData
        const sortedStopList = [...Object.keys(stopData)].sort((a, b) => stopData[a].distance - stopData[b].distance).slice(0, 100)
        setStopList(sortedStopList)
    }

    return (
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <form onSubmit={handleSubmit} className='input-group mb-3'>
                    <input 
                    type='search'
                    className='form-control'
                    placeholder='Bus stop code'
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
                <button
                className='btn btn-info'
                onClick={handleNearbyClick}>
                    Nearby
                </button>
            </div>
        </div>
    )
}

export default SearchForm;
