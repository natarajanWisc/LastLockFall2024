import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RoomModal from './RoomModal';
import MapInitialization from './helpers/MapInitialization';
import geoJSONCollection from '../assets/floorMap';
import locksGeoJSON from '../assets/locks';
import HoverRoomModal from './HoverRoomModal';
import { motion, AnimatePresence } from 'framer-motion';

const AMERICAN_CENTER = [-100, 40];

//floor ids are UNION_SOUTH_IV and UNION_SOUTH_I
function MapboxContainer({username}) {
    const mapRef = useRef();
    const mapContainerRef = useRef();
    const markersRef = useRef([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBuilding, setSelectedBuilding] = useState(null); // selected floor plan
    const [buildings, setBuildings] = useState([]); // set of all floor plans
    const [mapInitialized, setMapInitialized] = useState(false); // State for map being initialized
    const [showTimeSeries, setShowTimeSeries] = useState(false); // State for time series checkbox
    const [showRoomNames, setShowRoomNames] = useState(false); // State for room names checkbox
    const [showConferenceRooms, setShowConferenceRooms] = useState(false); // State for showing conference rooms only
    const [time, setTime] = useState(12); // Initial time for time series
    const [selectedRoomHover, setSelectedRoomHover] = useState(null); // State for which room is being hovered over

    // Debugging code if necessary
    const [debugInfo, setDebugInfo] = useState({
        startingZoom: null,
        startingFitBounds: null,
        startingMinZoom: null,
        currentMaxBounds: null,
        currentMinZoom: null,
        currentZoom: null,
    });

    useEffect(() => {
        // Parse geoJSONCollection to create the buildings array
        let buildingsArray = Object.entries(geoJSONCollection).map(([id, data]) => ({
          id,
          name: data.name,
          coordinates: JSON.parse(data.map_coordinates),
          geoJSON: data
        }));

        // Filter buildings based on the logged-in user's username
        if (username === 'admin') {
            buildingsArray = buildingsArray.filter(building => ['UNION_SOUTH_IV', 'UNION_SOUTH_I'].includes(building.id));
        } else if (username === 'joeuntrecht') {
            buildingsArray = buildingsArray.filter(building => building.id === 'UNION_SOUTH_IV');
        } else if (username === 'eligauger') {
            buildingsArray = buildingsArray.filter(building => building.id === 'UNION_SOUTH_I');
        }
        // Sets the available floor plans for the specific user
        setBuildings(buildingsArray);
    }, []);

    // Sets up the Mapbox map with specific configuration when component mounts:
    useEffect(() => {     
        // Sets the Mapbox access token for authentication
        mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGluYmlsZG5lciIsImEiOiJjbTIyM3c0azUwMnllMmxuNzFwY3V0Y204In0.n4K--AHy82A8xh9JxeLUnw';

        // Create a new Mapbox map instance
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current, // Use the referenced container element
            style: 'mapbox://styles/mapbox/dark-v11', // Use dark theme map style
            center: AMERICAN_CENTER, // Center the map over the American continent
            zoom: 2.9 // Initial zoom level to show the entire continent
        });

        // Set map initialization state to true when the map finishes loading
        mapRef.current.on('load', () => {
            setMapInitialized(true);
        });

        // Cleanup function to remove map and markers when component unmounts
        return () => {
            // clean up markers
            if (markersRef.current) {
                markersRef.current.forEach(marker => marker.remove());
                markersRef.current = [];
            }
            // clean up maps
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, []);


    // Handles a floor plan being selected by the user
    function handleFloorSelection(event) {
        const buildingId = event.target.value;
        const selected = buildings.find(building => building.id === buildingId);
        setSelectedBuilding(selected);
    }

    // Handles a time change for heatmap
    const handleTimeChange = (event) => {
        const hour = parseInt(event.target.value);
        setTime(hour);
        // console.log('Updating filter for hour:', hour);
        // Update the map filter
        if (mapRef.current.getLayer('locks-heatmap')) {
          mapRef.current.setFilter('locks-heatmap', ['==', ['number', ['get', 'hour']], hour]);
        }
    
        // Convert 0-23 hour to AMPM format
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 ? hour % 12 : 12;
    
        // Update text in the UI
        document.getElementById('active-hour').innerText = hour12 + ampm;
      };

    return (
        <div className="outer-container">
            <div className='inner-container'>
                <div className="dropdown-container">
                    {/* Drop down menu for all available floor plans */}
                    <select
                        value={selectedBuilding ? selectedBuilding.id : ""}
                        className='dropdown-menu'
                        onChange={handleFloorSelection}
                    >
                        <option value="">Select a Floor Plan</option>
                        {buildings.map((building) => (
                            <option key={building.id} value={building.id}>
                                {building.name}
                            </option>
                        ))} 
                    </select>
                </div>
                {/* Map Container */}
                <div ref={mapContainerRef} className="mapbox-container" />
                <MapInitialization
                    mapRef={mapRef}
                    selectedBuilding={selectedBuilding}
                    mapInitialized={mapInitialized}
                    markersRef={markersRef}
                    setSelectedRoom={setSelectedRoom}
                    setDebugInfo={setDebugInfo}
                    showTimeSeries={showTimeSeries}
                    showRoomNames={showRoomNames}
                    showConferenceRooms={showConferenceRooms}
                    time={time}
                    setTime={setTime}
                    setSelectedRoomHover={setSelectedRoomHover}

                />
                <AnimatePresence mode='wait'>
                    {selectedRoom && ( // show modal if there is a selected room
                            <RoomModal
                                room={selectedRoom}
                                onClose={() => setSelectedRoom(null)}
                                originCoords={selectedRoom.clickCoords}
                            />
                        
                    )}
                </AnimatePresence>
                {selectedRoomHover && (
                    <HoverRoomModal room={selectedRoomHover} style={{
                        position: 'absolute',
                        left: `${selectedRoomHover.x}px`,
                        top: `${selectedRoomHover.y}px`,
                        transform: 'translate(-50%, -100%)', // Adjust to position above the marker like a chat bubble
                    }} />
                )}
                <div className="debug-overlay" style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    maxWidth: '300px',
                    zIndex: 1000,
                }}>
                {/* Top left selection menu for handling time series, displaying full room names, and displaying only conference rooms */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Show Time Series */}
                    <label>
                        <input
                            type="checkbox"
                            checked={showTimeSeries}
                            onChange={() => setShowTimeSeries(!showTimeSeries)}
                        />
                        Show Time Series
                    </label>
                    {/* Show Room Names */}
                    <label>
                        <input
                            type="checkbox"
                            checked={showRoomNames}
                            onChange={() => setShowRoomNames(!showRoomNames)}
                        />
                        Show Room Names
                    </label>
                    {/* Show Conference Rooms */}
                    <label>
                        <input
                            type="checkbox"
                            checked={showConferenceRooms}
                            onChange={() => setShowConferenceRooms(!showConferenceRooms)}
                        />
                        Show Conference Rooms Only
                    </label>
                </div>


          {showTimeSeries && (
            <div className="session" id="sliderbar">
              <h2>Hour: <label id="active-hour">12PM</label></h2>
              <input
                id="slider"
                className="row"
                type="range"
                min="0"
                max="23"
                step="1"
                value={time}
                onChange={handleTimeChange}
              />
            </div>
          )}
                </div>
            </div>
        </div>
    );}

export default MapboxContainer;