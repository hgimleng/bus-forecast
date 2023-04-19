import DirectionSelector from "./components/DirectionSelector";
import SearchForm from "./components/SearchForm";

function App() {
  return (
    <div className='container' style={{'margin-top': '60px'}}>
      <SearchForm />
      <DirectionSelector directions={['To BT PANJANG INT', 'To Choa Chu Kang Int']}/>
    </div>
  );
}

export default App;
