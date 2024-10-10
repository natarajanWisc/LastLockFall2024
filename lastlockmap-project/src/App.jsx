import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';

import './App.css'

const INITIAL_CENTER = [-87.661557, 41.893748]

function App() {

  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoianVudHJlY2h0IiwiYSI6ImNtMjB0NzA4ZjA5dGwyam9idnAzOTAzODgifQ.MyToh_hqaaNi0QxPSyKyjw'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/juntrecht/cm23mkkhu00c501p3c51u41c4',
      center: INITIAL_CENTER,
      zoom: 10.7,
      minZoom: 10.7,
      maxZoom: 20
    });

    // Define bounds for Chicago area (roughly around the city)
    const bounds = [
      [-87.9400, 41.6445], // Southwest corner [longitude, latitude] (near Midway Airport)
      [-87.5237, 42.0231]  // Northeast corner [longitude, latitude] (near Evanston)
    ];

    // Set the bounds to limit movement
    mapRef.current.setMaxBounds(bounds);

    // Disable all map interactions
   //mapRef.current.scrollZoom.disable(); // Disable scroll zoom
    mapRef.current.boxZoom.disable();    // Disable box zoom
    //mapRef.current.dragPan.disable();     // Disable map dragging
    mapRef.current.dragRotate.disable();  // Disable map rotation
    mapRef.current.keyboard.disable();    // Disable keyboard controls
    mapRef.current.doubleClickZoom.disable(); // Disable double-click zoom
    mapRef.current.touchZoomRotate.disable(); // Disable touch zoom/rotation

    mapRef.current.on('click', (event) => {
      // If the user clicked on one of your markers, get its information.
      const features = map.queryRenderedFeatures(event.point, {
        layers: ['chicago-parks'] // replace with your layer name
      });
      if (!features.length) {
        return;
      }
      const feature = features[0];
    
            /*
          Create a popup, specify its options
          and properties, and add it to the map.
        */
      const popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
      )
      .addTo(mapRef.current);
    });

    return () => {
      mapRef.current.remove()
    }
  }, [])
  
  return (
    <>
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}

export default App