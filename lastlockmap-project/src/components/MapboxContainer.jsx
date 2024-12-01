import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RoomModal from './RoomModal';
import MapInitialization from './helpers/MapInitialization';
import geoJSONCollection from '../assets/floorMap';
;import locksGeoJSON from '../assets/locks';
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
    const [mapInitialized, setMapInitialized] = useState(false);
    const [showTimeSeries, setShowTimeSeries] = useState(false); // State for time series checkbox
    const [showRoomNames, setShowRoomNames] = useState(false); // State for room names checkbox
    const [time, setTime] = useState(12); // Initial time
    const [floor, setFloor] = useState(0);
    const [selectedFloor,setSelectedFloor] = useState(0)
    //New debugging code
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
        // sets the available floor plans for the specific user
        setBuildings(buildingsArray);
    }, []);

    useEffect(() => {     
        mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGluYmlsZG5lciIsImEiOiJjbTIyM3c0azUwMnllMmxuNzFwY3V0Y204In0.n4K--AHy82A8xh9JxeLUnw';

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: AMERICAN_CENTER,
            zoom: 2.9
        });

        mapRef.current.on('load', () => {
            setMapInitialized(true);
        });

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

    useEffect(() => {
        if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
            console.warn("Map style is not fully loaded 1yet.");
            return;
        }
    
        if (!mapRef.current.getLayer('locks-circles')) {
            mapRef.current.addLayer({
                id: 'locks-circles',
                type: 'circle',
                source: 'locks',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['get', 'intensity'],
                        1, 10,
                        10, 30
                    ],
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'intensity'],
                        1, 'green',
                        5, 'yellow',
                        10, 'red'
                    ],
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1,
                    'circle-opacity': 0.8
                },
                layout: {
                    'visibility': showTimeSeries ? 'visible' : 'none'
                },
                filter: [
                    'all',
                    ['==', ['number', ['get', 'hour']], time],
                    ['==', ['get', 'floor'], selectedFloor]
                ]
            });
        }
    }, [mapRef, mapInitialized, showTimeSeries, time, selectedFloor]); // Dependencies
    
    // handles a floor plan being selected by the user
    function handleFloorSelection(event) {
        const buildingId = event.target.value;
        const selected = buildings.find(building => building.id === buildingId);
        console.log(buildingId)
        
        const selectedFloor = buildingId == 'UNION_SOUTH_I' ? 1: 4;
        setFloor(selectedFloor);
        console.log(selectedFloor) // This will log the correct floor
        
        setSelectedBuilding(selected);
    }
    const handleTimeChange = (event) => {
        const hour = parseInt(event.target.value);
        setTime(hour);
        // console.log('Updating filter for hour:', hour);
        // Update the map filter
        console.log(floor)
        
        mapRef.current.setFilter('locks-heatmap', [
            'all',
            ['==', ['number', ['get', 'hour']], hour],
            ['==', ['get', 'floor'], selectedFloor] // Convert floor to string
          ]);
        console.log('floor ' + locksGeoJSON.features[0].properties.floor)
        // Convert 0-23 hour to AMPM format
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 ? hour % 12 : 12;
    
        // Update text in the UI
        document.getElementById('active-hour').innerText = hour12 + ampm;
      };
    useEffect(() => {
        if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
            console.warn("Map style is not fully loaded yet.");
            return;
        }
    
        if (showTimeSeries) {
            setTime(12); // Example default
            console.log("Time series visualization enabled, setting default hour to 12.");
        }
    
        if (mapRef.current.getLayer('locks-circles')) {
            const visibility = showTimeSeries ? 'visible' : 'none';
            mapRef.current.setLayoutProperty('locks-circles', 'visibility', visibility);
            console.log(`Heatmap visibility set to: ${visibility}`);
        }
    }, [showTimeSeries]);
    // Effect for handling time changes
    useEffect(() => {
        if (mapRef.current && mapRef.current.isStyleLoaded() && mapRef.current.getStyle() && mapRef.current.getLayer('locks-circles')) {
            mapRef.current.setFilter('locks-circles', ['==', ['number', ['get', 'hour']], time]);
            // console.log('Updated filter for hour:', time);
        }
    }, [time]);
    
    return (
        <div className="outer-container">
            <div className='inner-container'>
                <div className="dropdown-container">
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
                    time={time}
                    setTime={setTime}
                />
                <AnimatePresence mode='wait'>
                    {selectedRoom && (
                        
                            <RoomModal
                                room={selectedRoom}
                                onClose={() => setSelectedRoom(null)}
                                originCoords={selectedRoom.clickCoords}
                            />
                        
                    )}
                </AnimatePresence>
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
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={showTimeSeries}
                            onChange={() => setShowTimeSeries(!showTimeSeries)}
                        />
                        Show Time Series
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={showRoomNames}
                            onChange={() => setShowRoomNames(!showRoomNames)}
                        />
                        Show Room Names
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