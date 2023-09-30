import React from 'react';

function Settings({ active, dataTimestamp, downloadData }) {
    function getLastUpdated() {
        if (!dataTimestamp) {
            return 'N/A';
        }

        return new Date(dataTimestamp).toLocaleString();
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
                </div>
            </div>
        </div>
    );
}

export default Settings;
