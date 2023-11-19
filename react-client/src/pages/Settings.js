import React from 'react';
import MultiSelection from "../components/Settings/MultiSelection";

function Settings({ active, dataTimestamp, downloadData, settings, updateSettings }) {

    function getLastUpdated() {
        if (!dataTimestamp) {
            return 'N/A';
        }

        return new Date(dataTimestamp).toLocaleString();
    }

    async function handleSortByClick(selected) {
        await updateSettings('sortBy', selected);
    }

    async function handleArrivalDisplayClick(selected) {
        await updateSettings('arrivalDisplay', selected);
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
                            onClick={downloadData}
                            className={`list-group-item list-group-item-action`}
                            style={{textAlign: 'left'}}>
                            <strong>Download Data</strong> (Last updated: {getLastUpdated()})
                        </button>
                    </div>
                    <hr />
                    <h4>Bus Countdown</h4>
                    <div className="list-group">
                        <MultiSelection title="Sort by" selections={["Bus number", "Arrival time"]} selected={settings["sortBy"]} handleSelection={handleSortByClick} />
                        <MultiSelection title="Arrival display" selections={["Countdown", "Static"]} selected={settings["arrivalDisplay"]} handleSelection={handleArrivalDisplayClick} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
