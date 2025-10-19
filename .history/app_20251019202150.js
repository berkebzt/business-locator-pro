cat > app.js << 'EOF'
// Initialize map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Sample business data
const businesses = [
  { name: 'Coffee Shop A', lat: 51.5, lng: -0.09, type: 'café' },
  { name: 'Pizza Place B', lat: 51.51, lng: -0.1, type: 'restaurant' },
  { name: 'Bookstore C', lat: 51.49, lng: -0.08, type: 'shop' },
  { name: 'Thai Restaurant', lat: 51.505, lng: -0.08, type: 'restaurant' },
  { name: 'Bakery D', lat: 51.495, lng: -0.095, type: 'café' }
];

// User location
let userLocation = null;

// Create custom icons for different types
const iconConfig = {
  'café': {
    color: '#8B4513',
    emoji: '☕'
  },
  'restaurant': {
    color: '#FF6B6B',
    emoji: '🍽️'
  },
  'shop': {
    color: '#4ECDC4',
    emoji: '🛍️'
  }
};

// Function to create custom icons
function getIcon(type) {
  const config = iconConfig[type] || { color: '#3388ff', emoji: '📍' };
  
  return L.divIcon({
    html: `<div style="background-color: ${config.color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${config.emoji}</div>`,
    iconSize: [40, 40],
    className: 'custom-icon'
  });
}

// Function to calculate distance (km)
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

// Create marker layer group
let markerGroup = L.layerGroup().addTo(map);
let userMarker = null;

// Function to display markers with distance
function displayMarkers(data) {
  markerGroup.clearLayers();
  
  data.forEach(business => {
    let popupText = `<b>${business.name}</b><br><span style="color: #666;">${business.type}</span>`;
    
    // Add distance if user location is available
    if (userLocation) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, business.lat, business.lng);
      popupText += `<br><span style="color: #007bff;"><strong>${distance} km away</strong></span>`;
    }
    
    const marker = L.marker([business.lat, business.lng], {
      icon: getIcon(business.type)
    })
      .bindPopup(popupText);
    markerGroup.addLayer(marker);
  });
}

// Display all businesses on load
displayMarkers(businesses);

// Get user's location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        userLocation = { lat, lng };
        
        // Center map on user
        map.setView([lat, lng], 15);
        
        // Add user marker
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: '#007bff',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        })
        .bindPopup('📍 Your Location')
        .addTo(map);
        
        // Refresh markers to show distances
        displayMarkers(businesses);
      },
      (error) => {
        console.log('Geolocation error:', error.message);
        alert('Unable to get your location. Using default location.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

// Get user location on page load
getUserLocation();

// Search functionality
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
EOF