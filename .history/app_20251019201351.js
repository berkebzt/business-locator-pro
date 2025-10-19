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

// Create marker layer group
let markerGroup = L.layerGroup().addTo(map);

// Function to display markers
function displayMarkers(data) {
  markerGroup.clearLayers();
  
  data.forEach(business => {
    const marker = L.marker([business.lat, business.lng])
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
EOF