import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RoomModal from './RoomModal';
import MapInitialization from './helpers/MapInitialization';
import geoJSONCollection from '../assets/floorMap';
import locksGeoJSON from '../assets/locks';

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
    const [showTimeSeries, setShowTimeSeries] = useState(false); // State for checkbox
    const [time, setTime] = useState(12); // Initial time
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
            // Add the GeoJSON source
            mapRef.current.addSource('floor-data', {
                type: 'geojson',
                data: selectedBuilding.geoJSON
            });
    
            // Add a layer to render the GeoJSON data
            mapRef.current.addLayer({
                id: 'floor-layer',
                type: 'fill',
                source: 'floor-data',
                paint: {
                    'fill-color': '#252525', // Light gray
                    'fill-opacity': 1
                }
            });
    
            // Add an outline layer
            mapRef.current.addLayer({
                id: 'floor-outline',
                type: 'line',
                source: 'floor-data',
                paint: {
                    'line-color': '#f8f8f8',
                    'line-width': 1
                }
            });

            // Initialize the highlight source with an empty feature collection
            mapRef.current.addSource('highlighted-room', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            // Add a layer for the highlighted room
            mapRef.current.addLayer({
                id: 'highlight-layer',
                type: 'fill',
                source: 'highlighted-room',
                paint: {
                    'fill-color': '#4a4a4a', // Dark gray color for highlight
                    'fill-opacity': 0.6
                }
            });

            // Function to update highlight layer source
            function updateHighlight(feature) {
                mapRef.current.getSource('highlighted-room').setData({
                    type: 'FeatureCollection',
                    features: [feature]
                });
            }

            // Reset highlight when no room is selected or hovered
            function clearHighlight() {
                mapRef.current.getSource('highlighted-room').setData({
                    type: 'FeatureCollection',
                    features: []
                });
            }

            // Add clickable name for each room
            selectedBuilding.geoJSON.features.forEach((feature, index) => {
                if (feature.geometry.type === 'Polygon') {
                    const coordinates = feature.geometry.coordinates[0];
                    const center = coordinates.reduce((acc, coord) => {
                        return [acc[0] + coord[0], acc[1] + coord[1]];
                    }, [0, 0]).map(sum => sum / coordinates.length);

                    // Create a div element for the room name box
                    const el = document.createElement('div');
                    el.className = 'room-box';
                    
                    // Edit colors based on renting conditions
                    if (feature.properties.Rentable) {
                        if (feature.properties.Rented) {
                            el.style.backgroundColor = '#ff0000';
                            el.style.color = '#ffffff';
                        } else if (feature.properties.Approval_Needed) {
                            el.style.backgroundColor = '#FFD966';
                            el.style.color = '#000000';
                        } else {
                            el.style.backgroundColor = '#28a745';
                            el.style.color = '#ffffff';
                        }
                    } else {
                        el.style.backgroundColor = '#007bff';
                        el.style.color = '#ffffff';
                    }

                    el.style.padding = '5px 10px';
                    el.style.borderRadius = '8px';
                    el.style.cursor = 'pointer';
                    el.style.textAlign = 'center';
                    el.style.fontSize = '12px';
                    el.textContent = feature.properties.Name || `Room ${index + 1}`;

                    // Add hover and click event listeners to the element
                    el.addEventListener('mouseenter', () => updateHighlight(feature));
                    el.addEventListener('mouseleave', clearHighlight);

                    el.addEventListener('click', () => {
                        setSelectedRoom({
                            name: feature.properties.Name || `Room ${index + 1}`,
                            hours: feature.properties.Hours || 'Not specified',
                            lastEntry: feature.properties.LastEntry || 'No recent entries',
                            lockBattery: feature.properties.LockBattery || 'Unknown'
                        });
                        updateHighlight(feature); // Keep the highlight on click
                    });

                    new mapboxgl.Marker(el)
                        .setLngLat(center)
                        .addTo(mapRef.current);
                }
            });


            

            // Add clickable points for each room -- will eventually be a part of the geoJSON
            // selectedBuilding.geoJSON.features.forEach((feature, index) => {
            //     if (feature.geometry.type === 'Polygon') {
            //         const coordinates = feature.geometry.coordinates[0];
            //         const center = coordinates.reduce((acc, coord) => {
            //             return [acc[0] + coord[0], acc[1] + coord[1]];
            //         }, [0, 0]).map(sum => sum / coordinates.length);



            //         const el = document.createElement('div'); // creating the dots for each room
            //         el.className = 'room-marker';
            //         el.style.backgroundColor = '#007bff';
            //         el.style.width = '12px';
            //         el.style.height = '12px';
            //         el.style.borderRadius = '50%';
            //         el.style.cursor = 'pointer';

            //         // handles click on each room
            //         el.addEventListener('click', () => {
            //             setSelectedRoom({
            //                 name: feature.properties.Name || `Room ${index + 1}`,
            //                 hours: feature.properties.Hours || 'Not specified',
            //                 lastEntry: feature.properties.LastEntry || 'No recent entries',
            //                 lockBattery: feature.properties.LockBattery || 'Unknown'
            //             });
            //         });

            //         new mapboxgl.Marker(el)
            //             .setLngLat(center)
            //             .addTo(mapRef.current);
            //     }
            // });

            // Set max bounds with padding
            // const maxBounds = bounds.toArray();
            // const sw = mapRef.current.project(maxBounds[0]);
            // const ne = mapRef.current.project(maxBounds[1]);
            // const paddedSw = mapRef.current.unproject([sw.x - PADDING, sw.y + PADDING]);
            // const paddedNe = mapRef.current.unproject([ne.x + PADDING, ne.y - PADDING]);
            // mapRef.current.setMaxBounds(new mapboxgl.LngLatBounds(paddedSw, paddedNe));

            // Set max bounds based on the initial viewport
            const initialBounds = mapRef.current.getBounds();
            mapRef.current.setMaxBounds(initialBounds);

            // Set minimum zoom level
            const initialZoom = mapRef.current.getZoom();
            mapRef.current.setMinZoom(initialZoom - 0.5); // Allow slight zoom out

            // Update debug info
            setDebugInfo({
                startingZoom: mapRef.current.getZoom(),
                startingFitBounds: initialBounds.toString(),
                startingMinZoom: mapRef.current.getMinZoom(),
                currentMaxBounds: mapRef.current.getMaxBounds().toString(),
                currentMinZoom: mapRef.current.getMinZoom(),
                currentZoom: mapRef.current.getZoom(),
            });

            // Add move event listener to update current zoom
            mapRef.current.on('move', () => {
                setDebugInfo(prevInfo => ({
                    ...prevInfo,
                    currentZoom: mapRef.current.getZoom(),
                    currentMaxBounds: mapRef.current.getMaxBounds().toString(),
                    currentMinZoom: mapRef.current.getMinZoom(),
                }));
            });

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


    // handles a floor plan being selected by the user
    function handleFloorSelection(event) {
        const buildingId = event.target.value;
        const selected = buildings.find(building => building.id === buildingId);
        setSelectedBuilding(selected);
    }
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
                    time={time}
                    setTime={setTime}
                />
                {selectedRoom && (
                    <RoomModal
                        room={selectedRoom}
                        onClose={() => setSelectedRoom(null)}
                        originCoords={selectedRoom.clickCoords}
                    />
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
                
          <label>
            <input
              type="checkbox"
              checked={showTimeSeries}
              onChange={() => setShowTimeSeries(!showTimeSeries)}
            />
            Show Time Series
          </label>
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