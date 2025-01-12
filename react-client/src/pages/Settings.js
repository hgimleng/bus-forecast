import React from 'react';
import MultiSelection from "../components/Settings/MultiSelection";
import InputSelection from "../components/Settings/InputSelection";

function Settings({ active, lastCheckedTimestamp, lastUpdatedTimestamp, updateData, getPosition, isGeolocationEnabled, settings, updateSettings }) {
    const privacyPolicyLink = "https://github.com/hgimleng/bus-forecast/blob/main/PRIVACY.md"

    function getLastUpdated(timestamp) {
        if (!timestamp) {
            return 'N/A';
        }

        return new Date(timestamp).toLocaleString();
    }

    async function handleForecastDisplayToggle() {
        // Determine the new value based on the current value
        const newForecastDisplayValue = !settings.forecastDisplay;

        // Call updateSettings with the new value
        await updateSettings('forecastDisplay', newForecastDisplayValue);
    }

    async function handleHomePageClick(selected) {
        await updateSettings('homePage', selected);
    }

    async function handleSortByClick(selected) {
        await updateSettings('sortBy', selected);
    }

    async function handleArrivalDisplayClick(selected) {
        await updateSettings('arrivalDisplay', selected);
    }

    async function handleNextRoadClick(selected) {
        await updateSettings('nextStopRoadName', selected);
    }

    async function handleDefaultSearchInput(input) {
        await updateSettings('defaultSearch', input);
    }

    return (
        <div className={`container mt-4 mb-4 ${active ? '' : 'd-none'}`}>
            <h1>Settings</h1>
            <hr />
            <div className="row mb-3">
                <div className="col">
                    <h4>General</h4>
                    <div className="list-group">
                        <button
                            onClick={updateData}
                            className={`list-group-item list-group-item-action`}
                            style={{textAlign: 'left'}}>
                            <strong>Update Data</strong> (Last checked: {getLastUpdated(lastCheckedTimestamp)}, Last
                            updated: {getLastUpdated(lastUpdatedTimestamp)})
                        </button>
                        <MultiSelection title="Home Page" selections={["countdown", "map", "forecast"]}
                                        selected={settings["homePage"]} handleSelection={handleHomePageClick}/>
                        {!isGeolocationEnabled &&
                            <button
                                onClick={getPosition}
                                className={`list-group-item list-group-item-action`}
                                style={{textAlign: 'left'}}>
                                <strong>Allow location permission</strong>
                            </button>}
                    </div>
                    <hr/>
                    <h4>Bus Forecast (Beta)</h4>
                    <div className="form-check form-switch">
                        <input className="form-check-input"
                               type="checkbox"
                               role="switch"
                               id="forecastDisplaySwitch"
                               checked={settings.forecastDisplay}
                               onChange={handleForecastDisplayToggle}/>
                        <label className="form-check-label" htmlFor="forecastDisplaySwitch">Show forecast tab</label>
                    </div>
                    <hr/>
                    <h4>Bus Countdown</h4>
                    <div className="list-group">
                        <MultiSelection title="Sort by" selections={["Bus number", "Arrival time"]}
                                        selected={settings["sortBy"]} handleSelection={handleSortByClick}/>
                        <MultiSelection title="Arrival display" selections={["Countdown", "Static"]}
                                        selected={settings["arrivalDisplay"]}
                                        handleSelection={handleArrivalDisplayClick}/>
                        <MultiSelection title="Next bus stop road name" selections={["Show", "Hide"]}
                                        selected={settings["nextStopRoadName"]}
                                        handleSelection={handleNextRoadClick}/>
                        <InputSelection title="Default search" input={settings["defaultSearch"]}
                                        handleInput={handleDefaultSearchInput}/>
                    </div>
                    <hr/>
                    <h4>Privacy Policy</h4>
                    <div className="container row mb-4">
                        <a href={privacyPolicyLink} target="_blank" className="mb-4">{privacyPolicyLink}</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
