import BusRowDisplay from "./BusRowDisplay";

function TimingDisplay({ busInfo, lastSearchTime, currentTime }) {
    return (
        <div className='col-auto text-center mb-1'>
            <table className='table table-striped table-bordered'>
                <caption>
                    Last Updated: { lastSearchTime }
                </caption>
                <thead>
                    <tr>
                        <th scope='col'>Bus no.</th>
                        <th scope='col'>Bus 1</th>
                        <th scope='col'>Bus 2</th>
                        <th scope='col'>Bus 3</th>
                    </tr>
                </thead>
                <tbody>
                    {busInfo['services']
                    .map((bus) => <BusRowDisplay busNum={bus['no']} arrival1={bus['next']} arrival2={bus['next2']} arrival3={bus['next3']} currentTime={currentTime} />)}
                </tbody>
            </table>
        </div>
    )
}

export default TimingDisplay;