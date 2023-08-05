import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Forecast from './pages/Forecast';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Forecast />} />
      </Routes>
    </Router>
  );
}

export default App;
