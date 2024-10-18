import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapboxContainer from './components/MapboxContainer';
import NewMapPage from './pages/NewMapPage';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<MapboxContainer />} />
        <Route path="/new-map-page" element={<NewMapPage />} />
      </Routes>
    </Router>
  );
}

export default App;