import { useState } from 'react'

function SearchForm({ busData, stopData, setBusList, setStopList, updateDistanceForStops }) {
    const [text, setText] = useState('')
    const [isNearbyClicked, setIsNearbyClicked] = useState(false);

    function handleSubmit(e, inputText = text) {
        e.preventDefault()
        if (!inputText) return

        const cleanString = (str) => str.replace(/[^\w\s]/gi, '').toUpperCase()

        const filteredStopData = Object.fromEntries(
            Object.entries(stopData).filter(([stopCode, stopValue]) => {
                return (
                    stopCode === inputText ||
                    cleanString(stopValue['name']).includes(cleanString(inputText)) ||
                    stopValue['buses'].some(busNum => [cleanString(busNum), busNum.slice(0, -1)].includes(cleanString(inputText)))
                    )
            })
          );

        updateDistanceForStops()
        if (inputText === 'nearby') {
            setIsNearbyClicked(true)
            var sortedStopList = getStopListSortedByDistance(stopData, 2)
        } else {
            setIsNearbyClicked(false)
            var sortedStopList = getStopListSortedByDistance(filteredStopData)
        }
        setStopList(sortedStopList)

        const filteredBusList = Object.keys(busData).filter(busNum => [cleanString(busNum), busNum.slice(0, -1)].includes(cleanString(inputText)))
        const newBusList = filteredBusList.flatMap(busNum => 
            Object.keys(busData[busNum]).map(direction => ({ 'number': busNum, 'direction': direction }))
          )
        setBusList(newBusList)
    }

    function handleChange(e) {
        let inputValue = e.target.value;
        setText(inputValue);
    }

    function handleNearbyClick(e) {
        setText('nearby')
        handleSubmit(e, 'nearby')
    }

    function getStopListSortedByDistance(data, distanceLimit = Number.MAX_VALUE) {
        // Sort the stopList by distance in ascending order and limit by distance
        return [...Object.keys(data)].sort((a, b) => data[a].distance - data[b].distance).filter((stopCode) => data[stopCode].distance < distanceLimit);
    }

    return (
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <form onSubmit={handleSubmit} className='input-group mb-3'>
                    <input 
                    type='search'
                    className='form-control'
                    placeholder='Bus number, stop name, or code'
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
                className={isNearbyClicked ? 'btn btn-primary' : 'btn btn-outline-primary'}
                onClick={handleNearbyClick}>
                    Nearby
                </button>
            </div>
        </div>
    )
}

export default SearchForm;
