import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const PADDING = 50;
const ANIM_DUR = 3000;

const MapInitialization = ({ mapRef, selectedBuilding, mapInitialized, markersRef, setSelectedRoom, setDebugInfo }) => {
  
    // clears markers when new floor plan is selected  
    const clearMarkers = () => {
        if (markersRef.current) {
          markersRef.current.forEach(marker => marker.remove());
          markersRef.current = [];
        } 
    };

    // resets to initial world view when no floor plan is selected
    const resetToInitialView = () => {
        clearMarkers();

        // Remove existing layers and sources
        ['floor-layer', 'floor-outline'].forEach(layer => {
            if (mapRef.current.getLayer(layer)) {
                mapRef.current.removeLayer(layer);
            }
        });

        if (mapRef.current.getSource('floor-data')) {
            mapRef.current.removeSource('floor-data');
        }

        // Reset bounds and zoom
        mapRef.current.setMaxBounds(null);
        mapRef.current.setMinZoom(null);

        mapRef.current.flyTo({
            center: [-100, 40],
            zoom: 2.9,
            duration: ANIM_DUR,
            essential: true
        });
    };

    // adds layers to the map view to create floor plans and features
    const addMapLayers = () => {
        // adds basic geoJSON structure
        mapRef.current.addSource('floor-data', {
            type: 'geojson',
            data: selectedBuilding.geoJSON
        });

        // adds a layer for the specific floor
        mapRef.current.addLayer({
            id: 'floor-layer',
            type: 'fill',
            source: 'floor-data',
            paint: {
              'fill-color': '#252525',
              'fill-opacity': 1
            }
        });

        // adds a layer of lines representing the walls of the floor
        mapRef.current.addLayer({
            id: 'floor-outline',
            type: 'line',
            source: 'floor-data',
            paint: {
              'line-color': '#f8f8f8',
              'line-width': 1
            }
        });
    };

    // adds a clickable marker for each room
    const addRoomMarkers = () => {
        selectedBuilding.geoJSON.features.forEach((feature, index) => {
            if (feature.geometry.type === 'Polygon') {
                const coordinates = feature.geometry.coordinates[0];
                const center = coordinates.reduce(
                (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
                [0, 0]
            ).map(sum => sum / coordinates.length);

            const el = document.createElement('div');
            el.className = 'room-marker';
            el.style.cssText = `
                background-color: #007bff;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                cursor: pointer;
            `;

            el.addEventListener('click', (event) => {
                const rect = event.target.getBoundingClientRect();
                setSelectedRoom({
                    name: feature.properties.Name || `Room ${index + 1}`,
                    hours: feature.properties.Hours || 'Not specified',
                    lastEntry: feature.properties.LastEntry || 'No recent entries',
                    lockBattery: feature.properties.LockBattery || 'Unknown',
                    clickCoords: {
                        x: rect.x,
                        y: rect.y
                    }
                });
            });

            const marker = new mapboxgl.Marker(el)
                .setLngLat(center)
                .addTo(mapRef.current);

            markersRef.current.push(marker);
          }
        });
    };

    useEffect(() => {
        if (!mapInitialized) return;

        if (!selectedBuilding) {
            resetToInitialView();
            return;
        }

        // Calculate bounds
        const bounds = new mapboxgl.LngLatBounds();
        selectedBuilding.geoJSON.features.forEach(feature => {
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates[0].forEach(coord => {
                    bounds.extend(coord);
                });
            }
        });

        clearMarkers();

        // Remove existing layers and sources
        ['floor-layer', 'floor-outline'].forEach(layer => {
            if (mapRef.current.getLayer(layer)) {
                mapRef.current.removeLayer(layer);
            }
        });
        
        if (mapRef.current.getSource('floor-data')) {
            mapRef.current.removeSource('floor-data');
        }

        // Animate to new bounds
        mapRef.current.fitBounds(bounds, {
            padding: PADDING,
            duration: ANIM_DUR,
            essential: true
        });

        // Add layers and markers after animation
        setTimeout(() => {
            addMapLayers();
            addRoomMarkers();

            // Set bounds and zoom constraints
            const initialBounds = mapRef.current.getBounds();
            mapRef.current.setMaxBounds(initialBounds);

            const initialZoom = mapRef.current.getZoom();
            mapRef.current.setMinZoom(initialZoom - 0.5);

            // Update debug info
            setDebugInfo({
                startingZoom: mapRef.current.getZoom(),
                startingFitBounds: initialBounds.toString(),
                startingMinZoom: mapRef.current.getMinZoom(),
                currentMaxBounds: mapRef.current.getMaxBounds().toString(),
                currentMinZoom: mapRef.current.getMinZoom(),
                currentZoom: mapRef.current.getZoom(),
            });
        }, ANIM_DUR / 2);

    }, [selectedBuilding, mapInitialized]);

    return null;
};

export default MapInitialization;