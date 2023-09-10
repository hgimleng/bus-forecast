import BusArrivalCellDisplay from "./BusArrivalCellDisplay";

function BusRowDisplay({busNum, arrival1, arrival2, arrival3, currentTime, stopLatLon, onBusRowClick}) {
    return (
        <tr>
            <td className="align-middle"><button className='btn btn-outline-primary' onClick={() => onBusRowClick(busNum, arrival1['destination_code'])}>{ busNum }</button></td>
            <BusArrivalCellDisplay time={arrival1['time']} type={arrival1['type']} load={arrival1['load']} currentTime={currentTime} stopLatLon={stopLatLon} busLatLon={[arrival1['lat'], arrival1['lng']]} />
            {arrival2 && <BusArrivalCellDisplay time={arrival2['time']} type={arrival2['type']} load={arrival2['load']} prevBusTime={arrival1['time']} currentTime={currentTime} stopLatLon={stopLatLon} busLatLon={[arrival2['lat'], arrival2['lng']]} />}
            {arrival3 && <BusArrivalCellDisplay time={arrival3['time']} type={arrival3['type']} load={arrival3['load']} prevBusTime={arrival2['time']} currentTime={currentTime} stopLatLon={stopLatLon} busLatLon={[arrival3['lat'], arrival3['lng']]} />}
        </tr>
    )
}

export default BusRowDisplay;