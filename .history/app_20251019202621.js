const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

const businesses = [
  { name: 'Coffee Shop A', lat: 51.5, lng: -0.09, type: 'café' },
  { name: 'Pizza Place B', lat: 51.51, lng: -0.1, type: 'restaurant' },
  { name: 'Bookstore C', lat: 51.49, lng: -0.08, type: 'shop' },
  { name: 'Thai Restaurant', lat: 51.505, lng: -0.08, type: 'restaurant' },
  { name: 'Bakery D', lat: 51.495, lng: -0.095, type: 'café' }
];

let userLocation = null;

const iconConfig = {
  'café': { color: '#8B4513', emoji: '☕' },
  'restaurant': { color: '#FF6B6B', emoji: '🍽️' },
  'shop': { color: '#4ECDC4', emoji: '🛍️' }
};

function getIcon(type) {
  const config = iconConfig[type] || { color: '#3388ff', emoji: '📍' };
  return L.divIcon({
    html: `<div style="background-color: ${config.color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${config.emoji}</div>`,
    iconSize: [40, 40],
    className: 'custom-icon'
  });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(2);
}

let markerGroup = L.layerGroup().addTo(map);
let userMarker = null;

function displayMarkers(data) {
  markerGroup.clearLayers();
  
  data.forEach(business => {
    let popupText = `<b>${business.name}</b><br><span style="color: #666;">${business.type}</span>`;
    
    if (userLocation) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, business.lat, business.lng);
      popupText += `<br><span style="color: #007bff;"><strong>${distance} km away</strong></span>`;
    }
    
    const marker = L.marker([business.lat, business.lng], {
      icon: getIcon(business.type)
    }).bindPopup(popupText);
    markerGroup.addLayer(marker);
  });
}

displayMarkers(businesses);

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        userLocation = { lat, lng };
        map.setView([lat, lng], 15);
        
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: '#007bff',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).bindPopup('📍 Your Location').addTo(map);
        
        displayMarkers(businesses);
      },
      (error) => {
        console.log('Location error:', error.message);
      }
    );
  }
}

getUserLocation();

document.getElementById('searchBox').addEventListener('keyup', (e) => {
  const query = e.target.value.toLowerCase();
  
  if (query === '') {
    displayMarkers(businesses);
  } else {
    const filtered = businesses.filter(b => 
      b.name.toLowerCase().includes(query) || 
      b.type.toLowerCase().includes(query)
    );
    displayMarkers(filtered);
  }
});

document.getElementById('locateBtn').addEventListener('click', getUserLocation);
EOF