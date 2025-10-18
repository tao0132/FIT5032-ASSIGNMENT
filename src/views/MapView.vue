<script setup>
// file: src/views/MapView.vue

import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';

const route = useRoute();

const mapContainer = ref(null);
let map = null;
let userLocation = ref(null);
let userMarker = null;
let coaches = ref([]);
let currentRoute = null;

/**
 * Calculate distance between two points in kilometers using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(2);
}

/**
 * Get directions from user location to coach location
 */
async function getDirections(coachLng, coachLat, coachName) {
  if (!userLocation.value) {
    alert('Please enable location access to get directions');
    return;
  }

  // Remove previous route if exists
  if (currentRoute) {
    if (map.getLayer('route')) map.removeLayer('route');
    if (map.getSource('route')) map.removeSource('route');
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.value.lng},${userLocation.value.lat};${coachLng},${coachLat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distance = (route.distance / 1000).toFixed(2); // Convert to km
      const duration = Math.round(route.duration / 60); // Convert to minutes

      // Add route to map
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0d6efd',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      currentRoute = true;

      // Fit map to show entire route
      const coordinates = route.geometry.coordinates;
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      
      map.fitBounds(bounds, { padding: 50 });

      // Show route info
      alert(`Route to ${coachName}:\n📍 Distance: ${distance} km\n⏱️ Duration: ${duration} minutes`);
    }
  } catch (error) {
    console.error('Error getting directions:', error);
    alert('Failed to get directions. Please try again.');
  }
}

/**
 * Clear the current route from the map
 */
function clearRoute() {
  if (map.getLayer('route')) map.removeLayer('route');
  if (map.getSource('route')) map.removeSource('route');
  currentRoute = null;
}

async function fetchCoachesAndAddMarkers() {
  const coachesCollection = collection(db, 'coaches');
  try {
    const snapshot = await getDocs(coachesCollection);
    coaches.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    coaches.value.forEach(coach => {
      if (coach.location?.latitude && coach.location?.longitude) {
        const coachLng = coach.location.longitude;
        const coachLat = coach.location.latitude;
        
        // Calculate distance if user location is available
        let distanceText = '';
        if (userLocation.value) {
          const distance = calculateDistance(
            userLocation.value.lat,
            userLocation.value.lng,
            coachLat,
            coachLng
          );
          distanceText = `<p><strong>📍 Distance:</strong> ${distance} km away</p>`;
        }

        // Create popup with coach info and Get Directions button
        const popupHTML = `
          <div style="min-width: 200px;">
            <h3 style="margin-bottom: 10px;">${coach.name}</h3>
            <p style="margin-bottom: 8px;"><strong>Specializations:</strong><br>${coach.specializations.join(', ')}</p>
            ${distanceText}
            <button 
              onclick="window.getDirectionsToCoach(${coachLng}, ${coachLat}, '${coach.name}')"
              class="btn btn-primary btn-sm mt-2"
              style="width: 100%;"
            >
              🧭 Get Directions
            </button>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(popupHTML);

        // Create custom marker
        const el = document.createElement('div');
        el.className = 'coach-marker';
        el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
        el.style.width = '30px';
        el.style.height = '40px';
        el.style.backgroundSize = '100%';
        el.style.cursor = 'pointer';

        new mapboxgl.Marker(el)
          .setLngLat([coachLng, coachLat])
          .setPopup(popup)
          .addTo(map);
      }
    });

  } catch (error) {
    console.error("Error fetching coaches for map:", error);
  }
}

/**
 * Get user's current location and center map
 */
function getUserLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        userLocation.value = { lat: latitude, lng: longitude };

        // Remove old user marker if exists
        if (userMarker) {
          userMarker.remove();
        }

        // Create custom user marker
        const el = document.createElement('div');
        el.className = 'user-marker';
        el.innerHTML = '📍';
        el.style.fontSize = '30px';
        el.style.cursor = 'pointer';

        // Add user location marker
        userMarker = new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML('<h4>📍 Your Location</h4><p>You are here!</p>')
          )
          .addTo(map);

        // Fly to user location
        map.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 2000
        });

        // Refresh markers with distance info
        fetchCoachesAndAddMarkers();
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location access in your browser settings.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

onMounted(() => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136], // Melbourne default
    zoom: 13,
    language: 'en' // Set map language to English
  });

  // Add navigation controls (zoom in/out)
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // Add geolocate control
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  });
  map.addControl(geolocateControl, 'top-right');

  // Create geocoder instance
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    placeholder: 'Search for places...',
    language: 'en' // Set language to English
  });

  // Add geocoder control to the map
  map.addControl(geocoder);

  // Expose getDirections function to window for popup buttons
  window.getDirectionsToCoach = getDirections;

  map.on('load', () => {
    fetchCoachesAndAddMarkers();
    
    // Automatically try to get user location
    getUserLocation();
    
    // Check if navigating to a specific coach location from query params
    if (route.query.coachLat && route.query.coachLng) {
      const coachLat = parseFloat(route.query.coachLat);
      const coachLng = parseFloat(route.query.coachLng);
      const coachName = route.query.coachName || 'Coach';
      const coachAddress = route.query.coachAddress || '';
      
      // Wait a bit for user location to load, then navigate
      setTimeout(() => {
        // Center map on coach location
        map.flyTo({
          center: [coachLng, coachLat],
          zoom: 15,
          duration: 2000
        });
        
        // Add a highlight marker for the target coach
        const el = document.createElement('div');
        el.innerHTML = '📍';
        el.style.fontSize = '40px';
        el.style.animation = 'pulse 2s infinite';
        
        new mapboxgl.Marker(el)
          .setLngLat([coachLng, coachLat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="min-width: 200px;">
                  <h3 style="color: #0d6efd; margin-bottom: 10px;">${coachName}</h3>
                  <p style="margin-bottom: 8px;"><strong>📍 Address:</strong><br>${coachAddress}</p>
                  <button 
                    onclick="window.getDirectionsToCoach(${coachLng}, ${coachLat}, '${coachName}')"
                    class="btn btn-primary btn-sm"
                    style="width: 100%; margin-top: 10px;"
                  >
                    🧭 Get Directions
                  </button>
                </div>
              `)
          )
          .addTo(map)
          .togglePopup(); // Open popup automatically
        
        // Automatically get directions if user location is available
        setTimeout(() => {
          if (userLocation.value) {
            getDirections(coachLng, coachLat, coachName);
          }
        }, 1500);
      }, 1000);
    }
  });
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
  // Clean up window function
  delete window.getDirectionsToCoach;
});
</script>

<template>
  <div class="map-wrapper">
    <!-- Control Panel -->
    <div class="control-panel">
      <h4>🗺️ Map Controls</h4>
      <button @click="getUserLocation" class="btn btn-primary btn-sm mb-2">
        📍 Find My Location
      </button>
      <button @click="clearRoute" class="btn btn-secondary btn-sm mb-2" v-if="currentRoute">
        🗑️ Clear Route
      </button>
      <div class="info-box mt-3" v-if="userLocation">
        <small>
          <strong>Your Location:</strong><br>
          Lat: {{ userLocation.lat.toFixed(4) }}<br>
          Lng: {{ userLocation.lng.toFixed(4) }}
        </small>
      </div>
    </div>

    <!-- Map Container -->
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
}

.map-container {
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 200px;
}

.control-panel h4 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.control-panel button {
  width: 100%;
}

.info-box {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #0d6efd;
}

/* User marker animation */
.user-marker {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Coach marker hover effect */
.coach-marker:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}
</style>

<style>
/* Global styles for Mapbox components */
.mapboxgl-ctrl-geocoder {
  min-width: 300px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.mapboxgl-popup-content {
  padding: 15px;
  border-radius: 8px;
}

.mapboxgl-popup-content h3 {
  color: #0d6efd;
  font-size: 18px;
  margin-bottom: 10px;
}

.mapboxgl-popup-content button {
  margin-top: 10px;
}
</style>