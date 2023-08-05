import BusArrivalCellDisplay from "./BusArrivalCellDisplay";

function BusRowDisplay({busNum, arrival1, arrival2, arrival3, currentTime}) {
    return (
        <tr scope='row' key={busNum}>
            <td>{ busNum }</td>
            <BusArrivalCellDisplay time={arrival1['time']} type={arrival1['type']} load={arrival1['load']} currentTime={currentTime} />
            {arrival2 && <BusArrivalCellDisplay time={arrival2['time']} type={arrival2['type']} load={arrival2['load']} prevBusTime={arrival1['time']} currentTime={currentTime} />}
            {arrival3 && <BusArrivalCellDisplay time={arrival3['time']} type={arrival3['type']} load={arrival3['load']} prevBusTime={arrival2['time']} currentTime={currentTime} />}
        </tr>
    )
}

export default BusRowDisplay;