import BusArrivalDisplay from "./components/BusArrivalDisplay";
import BusStopSelector from "./components/BusStopSelector";
import DirectionSelector from "./components/DirectionSelector";
import ErrorMessage from "./components/ErrorMessage";
import SearchForm from "./components/SearchForm";

function App() {
  return (
    <div className='container' style={{'margin-top': '60px'}}>
      <SearchForm />
      <ErrorMessage message={'Bus 0 not found'} />
      <DirectionSelector directions={['To BT PANJANG INT', 'To Choa Chu Kang Int']} />
      <BusStopSelector stops={[{'name': 'Blk 352'}, {'name': 'Bef South View Stn'}, {'name': 'Blk 239'}]} />
      <BusArrivalDisplay arrivalData={['Bus 0: 10:37:46', 'Bus 1: 10:47:58', 'Bus 2: 11:02:55']} />
    </div>
  );
}

export default App;
