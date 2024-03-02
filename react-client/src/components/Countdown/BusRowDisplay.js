import BusArrivalCellDisplay from "./BusArrivalCellDisplay";

function BusRowDisplay({busNum, arrival1, arrival2, arrival3, currentTime, stopLatLon, onBusRowClick, settings, getDirection, destinationInfo}) {
    return (
        <tr>
            <td className="align-middle text-center">
                <button className='btn btn-outline-primary' onClick={() => onBusRowClick(busNum, arrival1['destination_code'])}>{ busNum }</button>
                {destinationInfo &&
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <small>{destinationInfo}</small>
                    </div>}
            </td>
            <BusArrivalCellDisplay time={arrival1['time']} type={arrival1['type']} load={arrival1['load']}
                                   currentTime={currentTime} stopLatLon={stopLatLon}
                                   busLatLon={[arrival1['lat'], arrival1['lng']]} settings={settings} getDirection={getDirection} />
            {arrival2 && <BusArrivalCellDisplay time={arrival2['time']} type={arrival2['type']} load={arrival2['load']} prevBusTime={arrival1['time']} currentTime={currentTime} stopLatLon={stopLatLon} busLatLon={[arrival2['lat'], arrival2['lng']]} settings={settings} getDirection={getDirection} />}
            {arrival3 && <BusArrivalCellDisplay time={arrival3['time']} type={arrival3['type']} load={arrival3['load']} prevBusTime={arrival2['time']} currentTime={currentTime} stopLatLon={stopLatLon} busLatLon={[arrival3['lat'], arrival3['lng']]} settings={settings} getDirection={getDirection} />}
        </tr>
    )
}

export default BusRowDisplay;