import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import NewPage from './newPage';

const INITIAL_CENTER = [-89.40811, 43.07189];

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGluYmlsZG5lciIsImEiOiJjbTIyM3c0azUwMnllMmxuNzFwY3V0Y204In0.n4K--AHy82A8xh9JxeLUnw';
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: INITIAL_CENTER,
      zoom: 18.2,
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <>
      <div id='map-container' ref={mapContainerRef} />
      <Router>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/new-page">New Page</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-page" element={<NewPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;