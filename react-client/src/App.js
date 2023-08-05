import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Forecast from './pages/Forecast';
import Countdown from './pages/Countdown';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Forecast />} />
        <Route path="/countdown" element={<Countdown />} />
      </Routes>
    </Router>
  );
}

export default App;
