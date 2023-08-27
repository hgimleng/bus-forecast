import { useState } from 'react'

function SearchForm({ busData, stopData, setStopList, updateDistanceForStops }) {
    const [text, setText] = useState('')

    function handleSubmit(e) {
        e.preventDefault()

        const cleanString = (str) => str.replace(/[^\w\s]/gi, '').toUpperCase()

        const filteredStopData = Object.fromEntries(
            Object.entries(stopData).filter(([stopCode, stopValue]) => stopCode === text || cleanString(stopValue['name']).includes(cleanString(text)))
          );

        updateDistanceForStops()
        const sortedStopList = getStopListSortedByDistance(filteredStopData)
        setStopList(sortedStopList)
    }

    function handleChange(e) {
        let inputValue = e.target.value;
        setText(inputValue);
    }

    function handleNearbyClick(e) {
        updateDistanceForStops()
        const sortedStopList = getStopListSortedByDistance(stopData)
        setStopList(sortedStopList)
    }

    function getStopListSortedByDistance(data) {
        // Sort the stopList by distance in ascending order and limit to 100 stops
        return [...Object.keys(data)].sort((a, b) => data[a].distance - data[b].distance).slice(0, 100)
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
