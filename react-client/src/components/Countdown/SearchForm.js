import {useEffect, useState} from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

function SearchForm({ busData, setBusList, isNearbyClicked, handleSearch, getFilteredStopDataLength, locationEnabled, requestLocationPermission, defaultSearch }) {
    const [text, setText] = useState('')

    useEffect(() => {
        setText(defaultSearch)
        handleSubmit({ preventDefault: () => {} }, defaultSearch)
    }, []);

    function cleanString(str) {
        return str.replace(/[^\w\s]/gi, '').toUpperCase()
    }

    function handleSubmit(e, inputText = text) {
        e.preventDefault()

        if (!inputText || !cleanString(inputText)) return

        const newBusList = Object.keys(busData).filter(busNum => [cleanString(busNum), busNum.slice(0, -1)].includes(cleanString(inputText)))
        setBusList(newBusList)
        handleSearch(inputText)
    }

    function handleChange(e) {
        let inputValue = e.target.value;
        setText(inputValue);
        if (cleanString(inputValue).length > 2 && getFilteredStopDataLength(inputValue) < 100) {
            handleSubmit(e, inputValue);
        }
    }

    async function handleNearbyClick(e) {
        e.preventDefault();

        if (!locationEnabled) {
            const { success } = await requestLocationPermission();

            if (!success) {
                return;
            }
        }

        setText('nearby');
        handleSubmit(e, 'nearby');
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
