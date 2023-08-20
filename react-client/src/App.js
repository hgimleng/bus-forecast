import React, { useState } from 'react';
import Forecast from './pages/Forecast';
import Countdown from './pages/Countdown';
import Settings from './pages/Settings';

import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [activeTab, setActiveTab] = useState('countdown');

  return (
    <div className="container d-flex flex-column">
        <div className="flex-grow-1 overflow-auto">
            <Countdown active={activeTab === 'countdown'} />
            <Forecast active={activeTab === 'forecast'} />
            <Settings active={activeTab === 'settings'} />
        </div>

        <div className="container-fluid position-fixed bg-light shadow-sm p-2 border-top" style={{ bottom: 0, left: 0, right: 0 }}>
            <div className="row m-0">
                <div className="col p-0">
                    <button className={`btn w-100 ${activeTab === 'countdown' ? '' : 'text-muted'}`} onClick={() => setActiveTab('countdown')}>
                        <i className={`fa fa-clock-o fa-lg ${activeTab === 'countdown' ? 'text-primary' : 'text-secondary'}`}></i>
                    </button>
                </div>
                <div className="col p-0">
                    <button className={`btn w-100 ${activeTab === 'forecast' ? '' : 'text-muted'}`} onClick={() => setActiveTab('forecast')}>
                        <i className={`fa fa-cloud fa-lg ${activeTab === 'forecast' ? 'text-primary' : 'text-secondary'}`}></i>
                    </button>
                </div>
                <div className="col p-0">
                    <button className={`btn w-100 ${activeTab === 'settings' ? '' : 'text-muted'}`} onClick={() => setActiveTab('settings')}>
                        <i className={`fa fa-cogs fa-lg ${activeTab === 'settings' ? 'text-primary' : 'text-secondary'}`}></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
