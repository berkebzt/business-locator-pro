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

// Create marker layer group
let markerGroup = L.layerGroup().addTo(map);

// Function to display markers
function displayMarkers(data) {
  markerGroup.clearLayers();
  
  data.forEach(business => {
    const marker = L.marker([business.lat, business.lng], {
      icon: getIcon(business.type)
    })
      .bindPopup(`<b>${business.name}</b><br><span style="color: #666;">${business.type}</span>`);
    markerGroup.addLayer(marker);
  });
}

// Display all businesses on load
displayMarkers(businesses);

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
