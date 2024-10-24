import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RoomModal from './RoomModal';
import geoJSONCollection from '../assets/floorMap';

const AMERICAN_CENTER = [-100, 40];

function MapboxContainer() {
    const mapRef = useRef();
    const mapContainerRef = useRef();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [buildings, setBuildings] = useState([]);

    useEffect(() => {
        // Parse geoJSONCollection to create the buildings array
        const buildingsArray = Object.entries(geoJSONCollection).map(([id, data]) => ({
          id,
          name: data.name,
          coordinates: JSON.parse(data.map_coordinates),
          geoJSON: data
        }));
        setBuildings(buildingsArray);
    }, []);

    useEffect(() => {     
        mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGluYmlsZG5lciIsImEiOiJjbTIyM3c0azUwMnllMmxuNzFwY3V0Y204In0.n4K--AHy82A8xh9JxeLUnw';

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: selectedBuilding ? selectedBuilding.coordinates : AMERICAN_CENTER,
            zoom: selectedBuilding ? 18.2 : 2.9
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

            // Add clickable points for each room -- will eventually be a part of the geoJSON
            selectedBuilding.geoJSON.features.forEach((feature, index) => {
                if (feature.geometry.type === 'Polygon') {
                    const coordinates = feature.geometry.coordinates[0];
                    const center = coordinates.reduce((acc, coord) => {
                        return [acc[0] + coord[0], acc[1] + coord[1]];
                    }, [0, 0]).map(sum => sum / coordinates.length);

                    const el = document.createElement('div'); // creating the dots for each room
                    el.className = 'room-marker';
                    el.style.backgroundColor = '#007bff';
                    el.style.width = '12px';
                    el.style.height = '12px';
                    el.style.borderRadius = '50%';
                    el.style.cursor = 'pointer';

                    // handles click on each room
                    el.addEventListener('click', () => {
                        setSelectedRoom({
                            name: feature.properties.Name || `Room ${index + 1}`,
                            hours: feature.properties.Hours || 'Not specified',
                            lastEntry: feature.properties.LastEntry || 'No recent entries',
                            lockBattery: feature.properties.LockBattery || 'Unknown'
                        });
                    });

                    new mapboxgl.Marker(el)
                        .setLngLat(center)
                        .addTo(mapRef.current);
                }
            });
        });
        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, [selectedBuilding]);

    function handleFloorSelection(event) {
        const buildingId = event.target.value;
        const selected = buildings.find(building => building.id === buildingId);
        setSelectedBuilding(selected);
    }

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
                {selectedRoom && (
                    <RoomModal
                        room={selectedRoom}
                        onClose={() => setSelectedRoom(null)}
                    />
                )}
            </div>
        </div>
    );}

export default MapboxContainer;