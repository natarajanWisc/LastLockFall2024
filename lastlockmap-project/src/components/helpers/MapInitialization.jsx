import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import locksGeoJSON from '../../assets/locks';

const PADDING = 50;
const ANIM_DUR = 3000;

const MapInitialization = ({ mapRef, selectedBuilding, mapInitialized, markersRef, setSelectedRoom, setDebugInfo, showTimeSeries, showRoomNames, showConferenceRooms, time, setTime, setSelectedRoomHover }) => {

    // clears markers when new floor plan is selected  
    const clearMarkers = () => {
        if (markersRef.current) {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
        }
    };

    // resets to initial world view when no floor plan is selected
    const resetToInitialView = () => {
        if (!mapRef.current) return;

        clearMarkers();

        // Remove existing layers and sources
        const layersToRemove = ['floor-layer', 'floor-outline', 'locks-circles'];
        layersToRemove.forEach(layer => {
            if (mapRef.current.getStyle() && mapRef.current.getLayer(layer)) {
                mapRef.current.removeLayer(layer);
            }
        });

        const sourcesToRemove = ['floor-data', 'locks'];
        sourcesToRemove.forEach(source => {
            if (mapRef.current.getStyle() && mapRef.current.getSource(source)) {
                mapRef.current.removeSource(source);
            }
        });

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
        if (!mapRef.current || !mapRef.current.getStyle()) return;

        // Add floor data source if it doesn't exist
        if (!mapRef.current.getSource('floor-data')) {
            mapRef.current.addSource('floor-data', {
                type: 'geojson',
                data: selectedBuilding.geoJSON
            });
        }

        // Add floor layers if they don't exist
        if (!mapRef.current.getLayer('floor-layer')) {
            mapRef.current.addLayer({
                id: 'floor-layer',
                type: 'fill',
                source: 'floor-data',
                paint: {
                    'fill-color': '#252525', //light gray
                    'fill-opacity': 1
                }
            });
        }

        if (!mapRef.current.getLayer('floor-outline')) {
            mapRef.current.addLayer({
                id: 'floor-outline',
                type: 'line',
                source: 'floor-data',
                paint: {
                    'line-color': '#f8f8f8',
                    'line-width': 1
                }
            });

        }


        // Remove the highlight layer before the source, if they exist
        if (mapRef.current.getLayer('highlight-layer')) {
            mapRef.current.removeLayer('highlight-layer');
        }
        if (mapRef.current.getSource('highlighted-room')) {
            mapRef.current.removeSource('highlighted-room');
        }

        // Add the highlight source for room highlighting
        mapRef.current.addSource('highlighted-room', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        // Add the highlight layer for room highlighting
        mapRef.current.addLayer({
            id: 'highlight-layer',
            type: 'fill',
            source: 'highlighted-room',
            paint: {
                'fill-color': '#4a4a4a', // Dark gray color for highlight
                'fill-opacity': 0.6
            }
        });



        // Add locks data if it doesn't exist
        if (!mapRef.current.getSource('locks')) {
            mapRef.current.addSource('locks', {
                type: 'geojson',
                data: locksGeoJSON
            });
        }

        // // Verify the presence of the 'hour' property in the GeoJSON data
        // locksGeoJSON.features.forEach(feature => {
        //     if (typeof feature.properties.hour !== 'number') {
        //     console.error('Invalid or missing "hour" property in feature:', feature);
        //     }
        // });

        // Add locks visualization if it doesn't exist
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
                filter: ['==', ['number', ['get', 'hour']], time]
            });
        }
        if (selectedBuilding){
            const currentFloorId = selectedBuilding.id
            const isUnionSouthI = currentFloorId === 'UNION_SOUTH_I';
            if (!isUnionSouthI){
                clearLocksCirclesLayer();
            }else{
                addLocksCirclesLayer();
            }
        }
    };

    // adds a clickable marker for each room
    const addRoomMarkers = async () => {
        const currentTime = new Date('2024-10-30T09:00:00Z');
        if (!mapRef.current || !selectedBuilding) return;

        try {
            const bookingsResponse = await fetch('/api/bookings');
            const accessLogsResponse = await fetch('/api/room-access-logs');
            if (!bookingsResponse.ok || !accessLogsResponse.ok) {
                throw new Error('Failed to fetch data');//+
            }

            const { mockBookings } = await bookingsResponse.json();
            const { mockRoomAccessLogs } = await accessLogsResponse.json();



        selectedBuilding.geoJSON.features.forEach((feature, index) => {
            // If showConferenceRooms is true, skip non-rentable rooms
            if (showConferenceRooms && !feature.properties.Rentable) {
                return; // Skip this feature
            }
            if (feature.geometry.type === 'Polygon') {
                const coordinates = feature.geometry.coordinates[0];
                const center = coordinates.reduce(
                    (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
                    [0, 0]
                ).map(sum => sum / coordinates.length);


                if (showRoomNames) {
                    const el = document.createElement('div');
                    el.className = 'room-box';

                    // Edit conference room colors based on mock data:
                    if (feature.properties.Rentable) {
                        const roomId = feature.properties.RoomID;
                        const booking = mockBookings.find(
                            (b) => b.roomId === roomId &&
                            new Date(b.startTime) <= currentTime &&
                            new Date(b.endTime) > currentTime
                        );
                        const accessLog = mockRoomAccessLogs.find(
                            (log) => log.roomId === roomId &&
                              new Date(log.accessAttemptTime).getTime() === currentTime.getTime()
                        );
                        //Default to green (available for at least 30 minutes)
                        el.style.backgroundColor = '#28a745';
                        el.style.color = '#000000';
                        if (booking) {
                            if (accessLog) {
                                // Red: Booked for this time and has been accessed
                                el.style.backgroundColor = '#FF0000';
                                el.style.color = '#000000';
                            } else {
                                // Yellow: Booked but not accessed yet
                                el.style.backgroundColor = '#FFD966';
                                el.style.color = '#000000';
                            }       
                        } else if (accessLog) {
                            // Orange: Not booked, but accessed (unauthorized access)
                            el.style.backgroundColor = '#FFA500';
                            el.style.color = '#000000';
                        } else {
                            // Check if available for at least 30 minutes
                            const nextBooking = mockBookings.find(
                                (b) => b.roomId === roomId && new Date(b.startTime) > currentTime
                            );
                            // Yellow: Booked within the next 30 minutes
                            if (nextBooking && new Date(nextBooking.startTime) <= new Date(currentTime.getTime() + 30 * 60 * 1000)) {
                                el.style.backgroundColor = '#FFD966';
                                el.style.color = '#000000';
                            }
                        }
                    } else {
                        //blue if unrentable
                        el.style.backgroundColor = '#007bff';
                        el.style.color = '#ffffff';
                    }

                    el.style.padding = '5px 10px';
                    el.style.borderRadius = '8px';
                    el.style.cursor = 'pointer';
                    el.style.textAlign = 'center';
                    el.style.fontSize = '12px';
                    el.textContent = feature.properties.Name || `Room ${index + 1}`;

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

                    // Add hover and click event listeners to the element
                    // el.addEventListener('mouseenter', () => updateHighlight(feature));
                    // el.addEventListener('mouseleave', clearHighlight);
                    el.addEventListener('mouseover', () => {
                        updateHighlight(feature);
                        const markerPosition = mapRef.current.project(center);
                        setSelectedRoomHover({
                            name: feature.properties.Name || `Room ${index + 1}`,
                            hours: feature.properties.Hours || 'Not specified',
                            lastEntry: feature.properties.LastEntry || 'No recent entries',
                            lockBattery: feature.properties.LockBattery || 'Unknown',
                            x: markerPosition.x,
                            y: markerPosition.y,
                            color: el.style.backgroundColor
                        });
                    });
        
                    // handle mouse leave to remove hover
                    el.addEventListener('mouseleave', () => {
                        setTimeout(() => {
                            setSelectedRoomHover(null);
                            clearHighlight();
                        }, 200); 
                    });

                    const marker = new mapboxgl.Marker(el)
                        .setLngLat(center)
                        .addTo(mapRef.current);

                    markersRef.current.push(marker);
                } else {
                    const el = document.createElement('div');
                    el.className = 'room-marker';
                    el.style.cssText = `
                    background-color: #007bff;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    cursor: pointer;
                `;
                    // Edit colors based on renting conditions: JUST BTW: These conditional IFS should be changed after Justin's work with renting room is done
                    if (feature.properties.Rentable) {
                        const roomId = feature.properties.RoomID;
                        const booking = mockBookings.find(
                            (b) => b.roomId === roomId &&
                            new Date(b.startTime) <= currentTime &&
                            new Date(b.endTime) > currentTime
                        );
                        const accessLog = mockRoomAccessLogs.find(
                            (log) => log.roomId === roomId &&
                              new Date(log.accessAttemptTime).getTime() === currentTime.getTime()
                        );
                        //Default to green (available for at least 30 minutes)
                        el.style.backgroundColor = '#28a745';
                        el.style.color = '#000000';
                        if (booking) {
                            if (accessLog) {
                                // Red: Booked for this time and has been accessed
                                el.style.backgroundColor = '#ff0000';
                                el.style.color = '#000000';
                            } else {
                                // Yellow: Booked but not accessed yet
                                el.style.backgroundColor = '#FFD966';
                                el.style.color = '#000000';
                            }       
                        } else if (accessLog) {
                            // Orange: Not booked, but accessed (unauthorized access)
                            el.style.backgroundColor = 'FFA500';
                            el.style.color = '#000000';
                        } else {
                            // Check if available for at least 30 minutes
                            const nextBooking = mockBookings.find(
                                (b) => b.roomId === roomId && new Date(b.startTime) > currentTime
                            );
                            // Yellow: Booked within the next 30 minutes
                            if (nextBooking && new Date(nextBooking.startTime) <= new Date(currentTime.getTime() + 30 * 60 * 1000)) {
                                el.style.backgroundColor = '#FFD966';
                                el.style.color = '#000000';
                            }
                        }
                    } else {
                        //blue if unrentable
                        el.style.backgroundColor = '#007bff';
                        el.style.color = '#ffffff';
                    }
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
                            },
                        color: el.style.backgroundColor
                        });
                    });

                    // Add hover and click event listeners to the element
                    // el.addEventListener('mouseenter', () => updateHighlight(feature));
                    // el.addEventListener('mouseleave', clearHighlight);
                el.addEventListener('mouseover', () => {
                    updateHighlight(feature);
                    const markerPosition = mapRef.current.project(center);
                    setSelectedRoomHover({
                        name: feature.properties.Name || `Room ${index + 1}`,
                        hours: feature.properties.Hours || 'Not specified',
                        lastEntry: feature.properties.LastEntry || 'No recent entries',
                        lockBattery: feature.properties.LockBattery || 'Unknown',
                        x: markerPosition.x,
                        y: markerPosition.y,
                        color: el.style.backgroundColor
                    });
                });
    
                // handle mouse leave to remove hover
                el.addEventListener('mouseleave', () => {
                    setTimeout(() => {               
                        // Clear hover state if not interacting with modal or marker
                        setSelectedRoomHover(null);
                        clearHighlight();
                    }, 200); // Delay for smoother transitions
                });

                    const marker = new mapboxgl.Marker(el)
                        .setLngLat(center)
                        .addTo(mapRef.current);

                    markersRef.current.push(marker);
                }



            }
        });
    } catch (error) {
        console.error('Error fetching bookings or access logs:', error);
    }
    };

//   // Function to determine the room color based on bookings and access logs
//   function getRoomColor(roomId) {
//     const booking = rooms.find(room => room.roomId === roomId);
//     const accessLog = accessLogs.find(log => log.roomId === roomId);

//     if (accessLog) {
//       const accessAttemptTime = new Date(accessLog.accessAttemptTime).getTime();

//       if (!booking) {
//         // Unauthorized access if no booking exists for the current time
//         return 'orange';
//       } else {
//         const bookingStartTime = new Date(booking.startTime).getTime();
//         const bookingEndTime = new Date(booking.endTime).getTime();

//         if (accessAttemptTime < bookingStartTime && bookingStartTime > currentTime) {
//           // Unauthorized access if accessed before booking start time or currently not booked
//           return 'orange';
//         }

//         if (bookingStartTime <= currentTime && bookingEndTime > currentTime) {
//           // The room is currently booked
//           if (accessAttemptTime >= bookingStartTime) {
//             // Normal authorized access
//             return 'red';
//           } else {
//             // Booked but not yet accessed
//             return 'yellow';
//           }
//         }
//       }
//     }

//     if (booking) {
//       const bookingStartTime = new Date(booking.startTime).getTime();

//       if (bookingStartTime > currentTime && bookingStartTime <= currentTime + 30 * 60 * 1000) {
//         // The room is booked within the next 30 minutes
//         return 'yellow';
//       }
//     }

//     // The room is available for at least the next 30 minutes
//     return 'green';
//   }



    // Functions for updating and clearing highlight
    const updateHighlight = (feature) => {
        mapRef.current.getSource('highlighted-room').setData({
            type: 'FeatureCollection',
            features: [feature]
        });
    };

    const clearHighlight = () => {
        mapRef.current.getSource('highlighted-room').setData({
            type: 'FeatureCollection',
            features: []
        });
    };


    // Effect for handling building selection changes
    useEffect(() => {
        if (!mapInitialized || !mapRef.current) return;

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
        const layersToRemove = ['floor-layer', 'floor-outline', 'locks-circles']; //might need to chnage
        layersToRemove.forEach(layer => {
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
            if (!mapRef.current) return;

            addMapLayers();
            addRoomMarkers();

            // Set bounds and zoom constraints
            const initialBounds = mapRef.current.getBounds();
            mapRef.current.setMaxBounds(initialBounds);

            const initialZoom = mapRef.current.getZoom();
            mapRef.current.setMinZoom(initialZoom - 0.5);
        }, ANIM_DUR / 2);

    }, [selectedBuilding, mapInitialized]);

    // Function to clear or hide the locks-circles layer
    const clearLocksCirclesLayer = () => {
        if (mapRef.current) {
            // Check if the layer exists before removing it
            if (mapRef.current.getLayer('locks-circles')) {
                mapRef.current.removeLayer('locks-circles');
                console.log('Removed locks-circles layer');
            }
        }
    };

    const addLocksCirclesLayer = () => {
        if (mapRef.current){
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
                    filter: ['==', ['number', ['get', 'hour']], time]
                });
            }
        }
    }

    // Effect for handling time changes
    useEffect(() => {
        if (mapRef.current && mapRef.current.getStyle() && mapRef.current.getLayer('locks-circles')) {
            mapRef.current.setFilter('locks-circles', ['==', ['number', ['get', 'hour']], time]);
            // console.log('Updated filter for hour:', time);
            if (selectedBuilding){
                const currentFloorId = selectedBuilding.id
                const isUnionSouthI = currentFloorId === 'UNION_SOUTH_I';
                if (!isUnionSouthI){
                    clearLocksCirclesLayer();
                }else{
                    addLocksCirclesLayer();
                }
            }
        }
    }, [time]);

    // Effect for handling time series visibility
    useEffect(() => {
        if (!mapRef.current || !mapRef.current.getStyle()) return;

        // Check if the current floor is UNION_SOUTH_IV
        if (selectedBuilding){
            const currentFloorId = selectedBuilding.id
            const isUnionSouthI = currentFloorId === 'UNION_SOUTH_I';
            console.log(selectedBuilding)

            if (showTimeSeries && isUnionSouthI) {
                addLocksCirclesLayer();
                setTime(12); // Set default hour to 12
                // console.log('Time series visualization enabled, setting default hour to 12');
                // // Update the map filter
                // if (mapRef.current && mapRef.current.getLayer('locks-heatmap')) {
                //     mapRef.current.setFilter('locks-heatmap', ['==', ['number', ['get', 'hour']], 12]);
                // }
            }else {
                clearLocksCirclesLayer();
            }

            if (mapRef.current.getLayer('locks-circles')) {
                const visibility = showTimeSeries && isUnionSouthI ? 'visible' : 'none';
                mapRef.current.setLayoutProperty('locks-circles', 'visibility', visibility);
                console.log(`Heatmap visibility set to: ${visibility}`);
            }
        }
        
    }, [showTimeSeries]);

    useEffect(() => {
        if (!mapRef.current || !mapRef.current.getStyle()) return;
        clearMarkers();
        addRoomMarkers();

    }, [showRoomNames, showConferenceRooms]);

    return null;
};

export default MapInitialization;