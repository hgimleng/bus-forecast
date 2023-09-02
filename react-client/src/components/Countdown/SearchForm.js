import { useState } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css';

function SearchForm({ busData, stopData, setBusList, setStopList, updateDistanceForStops, isNearbyClicked, handleSearch }) {
    const [text, setText] = useState('')

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
        let sortedStopList
        if (inputText === 'nearby') {
            sortedStopList = getStopListSortedByDistance(stopData, 2)
        } else {
            sortedStopList = getStopListSortedByDistance(filteredStopData)
        }
        setStopList(sortedStopList)

        const filteredBusList = Object.keys(busData).filter(busNum => [cleanString(busNum), busNum.slice(0, -1)].includes(cleanString(inputText)))
        const newBusList = filteredBusList.flatMap(busNum => 
            Object.keys(busData[busNum]).map(direction => ({ 'number': busNum, 'direction': direction }))
          )
        setBusList(newBusList)
        handleSearch(inputText)
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
        <div className='row text-center'>
            <div className='col-12'>
                <form onSubmit={handleSubmit}>
                    <div className="input-group mb-3">
                        <input
                            type="search"
                            className="form-control"
                            placeholder="Bus number, stop name, or code"
                            onChange={handleChange}
                            value={text}
                        />
                        <div className="input-group-append">
                            <span className="input-group-text" onClick={handleSubmit} style={{cursor: 'pointer'}}>
                                <i className="bi bi-search"></i>
                            </span>
                        </div>
                    </div>
                    <button
                    className={isNearbyClicked ? 'btn btn-primary' : 'btn btn-outline-primary'}
                    onClick={handleNearbyClick}
                    type="button">
                        Nearby
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SearchForm;
