<script setup>
// file: src/views/MapView.vue

import { ref, onMounted, onUnmounted } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// 1. Import the Geocoder plugin and its CSS
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';

const mapContainer = ref(null);
let map = null;

async function fetchCoachesAndAddMarkers() {
  const coachesCollection = collection(db, 'coaches');
  try {
    const snapshot = await getDocs(coachesCollection);
    const coaches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    coaches.forEach(coach => {
      if (coach.location?.latitude && coach.location?.longitude) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3>${coach.name}</h3><p>${coach.specializations.join(', ')}</p>`);

        new mapboxgl.Marker()
          .setLngLat([coach.location.longitude, coach.location.latitude])
          .setPopup(popup)
          .addTo(map);
      }
    });

  } catch (error) {
    console.error("Error fetching coaches for map:", error);
  }
}

onMounted(() => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136],
    zoom: 13
  });

  // 2. Create a new Geocoder instance
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false // Do not place a new marker for the search result
  });

  // 3. Add the Geocoder control to the map
  map.addControl(geocoder);

  map.on('load', () => {
    fetchCoachesAndAddMarkers();
  });
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style>
/* Use a global style tag here so we can override the Mapbox CSS */
.mapboxgl-ctrl-geocoder {
  /* Make the search bar wider */
  min-width: 300px;
}
</style>