import React, { useEffect, useState } from 'react';
import Forecast from './pages/Forecast';
import Countdown from './pages/Countdown';
import Settings from './pages/Settings';

import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAppData from "./utilities/useAppData";
import {useGeolocated} from "react-geolocated";

function App() {
  const { data, getDataLastUpdated, downloadData, settings, updateSettings, updateLastChecked } = useAppData()
  const [selectedTab, setSelectedTab] = useState(null);
  const [compassDirection, setCompassDirection] = useState(null);
  const { coords, getPosition, isGeolocationEnabled } =
      useGeolocated({
          positionOptions: {
              enableHighAccuracy: false,
            },
          userDecisionTimeout: 10000,
          watchPosition: true
      });

    useEffect(() => {
        const handleOrientationChange = (event) => {
            // Android only
            let alpha = event.alpha;
            alpha = alpha ? Math.round(360 - alpha) : null;
            setCompassDirection(alpha);
        };

        if (window.DeviceOrientationEvent) {
            console.log('Listening for device orientation');
            window.addEventListener('deviceorientationabsolute', handleOrientationChange);
        } else {
            console.log('Device orientation not supported');
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientationChange);
        };
    }, []);

  async function updateData() {
      let lastUpdated = await getDataLastUpdated();
      if (data.lastUpdatedTimestamp < lastUpdated)  {
          await downloadData();
      } else {
          await updateLastChecked();
      }
  }

  function getActiveTab() {
      return selectedTab === null ? settings.homePage : selectedTab;
  }

  return (
    <div className="container d-flex flex-column">
        <div className="flex-grow-1 overflow-auto">
            <Countdown active={getActiveTab() === 'countdown' || getActiveTab() === 'map'}
                       data={data} settings={settings}
                       compassDirection={compassDirection}
                       coords={coords}
                       getPosition={getPosition}
                       isGeolocationEnabled={isGeolocationEnabled}
                       mapMode={getActiveTab() === 'map'} />
            <Forecast active={getActiveTab() === 'forecast'} />
            <Settings active={getActiveTab() === 'settings'}
                      lastCheckedTimestamp={data.lastCheckedTimestamp}
                      lastUpdatedTimestamp={data.lastUpdatedTimestamp}
                      updateData={updateData}
                      getPosition={getPosition}
                      isGeolocationEnabled={isGeolocationEnabled}
                      settings={settings}
                      updateSettings={updateSettings} />
        </div>

        <div className="container-fluid position-fixed bg-light shadow-sm p-2 border-top" style={{ bottom: 0, left: 0, right: 0 }}>
            <div className="row m-0">
                <div className="col p-0">
                    <button className={`btn w-100 ${getActiveTab() === 'countdown' ? '' : 'text-muted'}`} onClick={() => setSelectedTab('countdown')}>
                        <i className={`fa fa-clock-o fa-lg ${getActiveTab() === 'countdown' ? 'text-primary' : 'text-secondary'}`}></i>
                    </button>
                </div>
                <div className="col p-0">
                    <button className={`btn w-100 ${getActiveTab() === 'map' ? '' : 'text-muted'}`} onClick={() => setSelectedTab('map')}>
                        <i className={`fa fa-map fa-lg ${getActiveTab() === 'map' ? 'text-primary' : 'text-secondary'}`}></i>
                    </button>
                </div>
                {settings['forecastDisplay'] && <div className="col p-0">
                    <button className={`btn w-100 ${getActiveTab() === 'forecast' ? '' : 'text-muted'}`}
                            onClick={() => setSelectedTab('forecast')}>
                        <i className={`fa fa-cloud fa-lg ${getActiveTab() === 'forecast' ? 'text-primary' : 'text-secondary'}`}></i>
                    </button>
                </div>}
                <div className="col p-0">
                    <button className={`btn w-100 ${getActiveTab() === 'settings' ? '' : 'text-muted'}`} onClick={() => setSelectedTab('settings')}>
                        <i className={`fa fa-cogs fa-lg ${getActiveTab() === 'settings' ? 'text-primary' : 'text-secondary'}`}></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}

export default App;
