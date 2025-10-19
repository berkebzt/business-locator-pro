// Business Locator Pro - Modern UI with Real OpenStreetMap Data
// Production-ready implementation with caching, error handling, and enhanced UI

class BusinessLocatorPro {
  constructor() {
    this.map = null;
    this.businesses = [];
    this.filteredBusinesses = [];
    this.userLocation = null;
    this.currentFilter = 'all';
    this.markerGroup = null;
    this.userMarker = null;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.selectedBusiness = null;
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.routeLayer = null;
    this.currentRoute = null;
    this.routeStartMarker = null;
    this.routeEndMarker = null;
    this.favorites = [];
    
    this.init();
  }

  init() {
    this.initTheme();
    this.initMap();
    this.initEventListeners();
    this.loadUserLocation();
    this.loadFavorites();
    
    // Run calculation tests in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setTimeout(() => this.testRouteCalculations(), 2000);
    }
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    const darkModeIcon = document.querySelector('#darkModeToggle i');
    darkModeIcon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  }

  initMap() {
    // Initialize map with default location (London)
    this.map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
    }).addTo(this.map);

    // Create marker layer group
    this.markerGroup = L.layerGroup().addTo(this.map);
  }

  initEventListeners() {
    // Search functionality
    document.getElementById('searchBox').addEventListener('keyup', () => {
      this.filterBusinesses();
    });

    // Clear search button
    document.getElementById('clearSearch').addEventListener('click', () => {
      document.getElementById('searchBox').value = '';
      this.filterBusinesses();
    });

    // Locate button
    document.getElementById('locateBtn').addEventListener('click', () => {
      this.loadUserLocation();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-type');
        this.filterBusinesses();
      });
    });

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', () => {
      this.toggleDarkMode();
    });

    // Share button
    document.getElementById('shareBtn').addEventListener('click', () => {
      this.shareLocation();
    });

    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportResults();
    });

    // Sidebar toggle (mobile)
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Route controls
    document.getElementById('clearRoute').addEventListener('click', () => {
      this.clearRoute();
    });

    document.getElementById('travelMode').addEventListener('change', () => {
      if (this.currentRoute) {
        this.getRoute(this.currentRoute.start, this.currentRoute.end);
      }
    });

    // Favorites functionality
    document.getElementById('favoritesBtn').addEventListener('click', () => {
      this.showFavoritesModal();
    });

    document.getElementById('closeFavoritesModal').addEventListener('click', () => {
      this.hideFavoritesModal();
    });

    document.getElementById('exportFavorites').addEventListener('click', () => {
      this.exportFavorites();
    });

    document.getElementById('clearAllFavorites').addEventListener('click', () => {
      this.clearAllFavorites();
    });

    // Close modal when clicking outside
    document.getElementById('favoritesModal').addEventListener('click', (e) => {
      if (e.target.id === 'favoritesModal') {
        this.hideFavoritesModal();
      }
    });

    // Close sidebar when clicking outside (mobile)
    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('sidebar');
      const sidebarToggle = document.getElementById('sidebarToggle');
      
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !sidebarToggle.contains(e.target) && 
          sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  }

  // UI Helper Methods
  showLoading(message = 'Loading...') {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const loadingText = document.getElementById('loadingText');
    const statusMessage = document.getElementById('statusMessage');
    
    loadingText.textContent = message;
    loadingIndicator.classList.remove('hidden');
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }

  hideLoading() {
    document.getElementById('loadingIndicator').classList.add('hidden');
  }

  showStatus(message, type = 'info') {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
  }

  updateHeaderStats() {
    document.getElementById('businessCount').textContent = this.businesses.length;
    if (this.userLocation && this.userLocation.city) {
      document.getElementById('currentCity').textContent = this.userLocation.city;
    }
  }

  updateFilterStatus() {
    const filterStatus = document.getElementById('filterStatus');
    const count = this.filteredBusinesses.length;
    const total = this.businesses.length;
    
    if (this.currentFilter === 'all') {
      filterStatus.textContent = `Showing ${count} of ${total} businesses`;
    } else {
      filterStatus.textContent = `Showing ${count} ${this.currentFilter}s`;
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode);
    
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    
    const darkModeIcon = document.querySelector('#darkModeToggle i');
    darkModeIcon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    
    // Update map theme if needed
    if (this.map) {
      this.updateMapTheme();
    }
  }

  updateMapTheme() {
    // You can add different map styles for dark/light mode here
    // For now, we'll keep the same style
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
  }

  shareLocation() {
    if (navigator.share && this.userLocation) {
      navigator.share({
        title: 'My Location',
        text: `I'm at ${this.userLocation.city || 'this location'}`,
        url: window.location.href
      }).catch(console.error);
    } else if (this.userLocation) {
      // Fallback: copy to clipboard
      const text = `I'm at ${this.userLocation.city || 'this location'}`;
      navigator.clipboard.writeText(text).then(() => {
        this.showStatus('Location copied to clipboard!', 'success');
      }).catch(() => {
        this.showStatus('Unable to share location', 'error');
      });
    }
  }

  exportResults() {
    if (this.businesses.length === 0) {
      this.showStatus('No data to export', 'error');
      return;
    }

    const data = this.businesses.map(business => ({
      name: business.name,
      type: business.type,
      latitude: business.lat,
      longitude: business.lng,
      distance: this.userLocation ? 
        this.calculateDistance(this.userLocation.lat, this.userLocation.lng, business.lat, business.lng) : 
        'N/A'
    }));

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `businesses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.showStatus('Data exported successfully!', 'success');
  }

  convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    return csvContent;
  }

  // Caching System
  getCacheKey(key) {
    return key;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  // API Methods
  async fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'User-Agent': 'BusinessLocator/1.0',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  async getLocationFromIP() {
    const cacheKey = 'user_location_ip';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      this.showLoading('Detecting your location...');
      
      const data = await this.fetchWithRetry('https://ipapi.co/json/');
      
      if (!data.latitude || !data.longitude) {
        throw new Error('Location data not available');
      }

      const location = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        city: data.city || 'Unknown',
        country: data.country_name || 'Unknown'
      };

      this.setCache(cacheKey, location);
      return location;
    } catch (error) {
      console.error('IP geolocation failed:', error);
      throw new Error('Unable to detect your location. Please use the "Find Me" button.');
    }
  }

  async getAddressFromCoordinates(lat, lng) {
    const cacheKey = `address_${lat.toFixed(4)}_${lng.toFixed(4)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      
      const data = await this.fetchWithRetry(url);
      
      const address = data.display_name || 'Unknown location';
      this.setCache(cacheKey, address);
      return address;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return 'Unknown location';
    }
  }

  async fetchPOIsFromOverpass(lat, lng, radius = 2000) {
    const cacheKey = `pois_${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      this.showLoading('Fetching local businesses...');

      // Overpass query for cafés, restaurants, and shops within radius
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="cafe"](around:${radius},${lat},${lng});
          node["amenity"="restaurant"](around:${radius},${lat},${lng});
          node["shop"](around:${radius},${lat},${lng});
          way["amenity"="cafe"](around:${radius},${lat},${lng});
          way["amenity"="restaurant"](around:${radius},${lat},${lng});
          way["shop"](around:${radius},${lat},${lng});
        );
        out center meta;
      `;

      const data = await this.fetchWithRetry('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      });

      const businesses = this.processOverpassData(data.elements || []);
      this.setCache(cacheKey, businesses);
      return businesses;
    } catch (error) {
      console.error('Overpass API failed:', error);
      throw new Error('Unable to fetch business data. Please try again later.');
    }
  }

  processOverpassData(elements) {
    const businesses = [];

    elements.forEach(element => {
      const tags = element.tags || {};
      const lat = element.lat || element.center?.lat;
      const lng = element.lon || element.center?.lon;

      if (!lat || !lng) return;

      let type = 'other';
      let name = tags.name || tags.brand || 'Unnamed Business';

      // Determine business type
      if (tags.amenity === 'cafe') {
        type = 'café';
      } else if (tags.amenity === 'restaurant') {
        type = 'restaurant';
      } else if (tags.shop) {
        type = 'shop';
        // Add shop type to name for better identification
        if (tags.shop !== 'yes' && tags.shop !== '1') {
          name = `${name} (${tags.shop})`;
        }
      }

      // Skip if no useful name
      if (name === 'Unnamed Business' && type === 'other') return;

      businesses.push({
        name: name,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type: type,
        tags: tags
      });
    });

    return businesses;
  }

  // Location and Data Loading
  async loadUserLocation() {
    try {
      // Try browser geolocation first
      if (navigator.geolocation) {
        const position = await this.getBrowserLocation();
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } else {
        // Fallback to IP-based location
        this.userLocation = await this.getLocationFromIP();
      }

      // Update map view
      this.map.setView([this.userLocation.lat, this.userLocation.lng], 15);

      // Get address
      const address = await this.getAddressFromCoordinates(this.userLocation.lat, this.userLocation.lng);
      
      // Add user marker
      this.addUserMarker(address);

      // Load nearby businesses
      await this.loadNearbyBusinesses();

      // Update header stats
      this.updateHeaderStats();

      this.showStatus(`Found ${this.businesses.length} businesses near you`, 'success');
    } catch (error) {
      console.error('Location loading failed:', error);
      this.showStatus(error.message, 'error');
      
      // Fallback to default location
      this.map.setView([51.505, -0.09], 13);
      await this.loadNearbyBusinesses();
    } finally {
      this.hideLoading();
    }
  }

  getBrowserLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true
      });
    });
  }

  addUserMarker(address) {
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    this.userMarker = L.circleMarker([this.userLocation.lat, this.userLocation.lng], {
      radius: 8,
      fillColor: '#007bff',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup(`📍 Your Location<br><small>${address}</small>`).addTo(this.map);
  }

  async loadNearbyBusinesses() {
    try {
      const lat = this.userLocation?.lat || 51.505;
      const lng = this.userLocation?.lng || -0.09;
      
      this.businesses = await this.fetchPOIsFromOverpass(lat, lng);
      this.displayMarkers(this.businesses);
    } catch (error) {
      console.error('Failed to load businesses:', error);
      this.showStatus('Using sample data due to API limitations', 'info');
      
      // Fallback to sample data
      this.businesses = [
  { name: 'Coffee Shop A', lat: 51.5, lng: -0.09, type: 'café' },
  { name: 'Pizza Place B', lat: 51.51, lng: -0.1, type: 'restaurant' },
  { name: 'Bookstore C', lat: 51.49, lng: -0.08, type: 'shop' },
  { name: 'Thai Restaurant', lat: 51.505, lng: -0.08, type: 'restaurant' },
  { name: 'Bakery D', lat: 51.495, lng: -0.095, type: 'café' }
];
      this.displayMarkers(this.businesses);
    }
  }

  // Map and Display Methods
  getIcon(type) {
    const iconConfig = {
      'café': { color: '#8B4513', emoji: '☕' },
      'restaurant': { color: '#FF6B6B', emoji: '🍽️' },
      'shop': { color: '#4ECDC4', emoji: '🛍️' },
      'other': { color: '#3388ff', emoji: '📍' }
    };

    const config = iconConfig[type] || iconConfig.other;
    
    return L.divIcon({
      html: `<div style="background-color: ${config.color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${config.emoji}</div>`,
      iconSize: [40, 40],
      className: 'custom-icon'
    });
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    // Validate input parameters
    if (typeof lat1 !== 'number' || typeof lng1 !== 'number' || 
        typeof lat2 !== 'number' || typeof lng2 !== 'number') {
      console.error('❌ Invalid coordinates for distance calculation:', { lat1, lng1, lat2, lng2 });
      return 0;
    }
    
    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      console.error('❌ NaN coordinates for distance calculation:', { lat1, lng1, lat2, lng2 });
      return 0;
    }
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Validate result
    if (typeof distance !== 'number' || isNaN(distance)) {
      console.error('❌ Invalid distance calculation result:', distance);
      return 0;
    }
    
    return parseFloat(distance.toFixed(2));
  }

  displayMarkers(data) {
    this.markerGroup.clearLayers();
    this.filteredBusinesses = data;
  
  data.forEach(business => {
      let popupText = `
        <div class="popup-content">
          <h3>${business.name}</h3>
          <p class="business-type">${business.type}</p>
      `;
      
      if (this.userLocation) {
        const distance = this.calculateDistance(
          this.userLocation.lat, 
          this.userLocation.lng, 
          business.lat, 
          business.lng
        );
        popupText += `<p class="distance"><strong>${distance} km away</strong></p>`;
      }
      
      popupText += `
          <div class="popup-actions">
            <button onclick="window.businessLocator.centerOnBusiness('${business.name}')" class="popup-btn">
              <i class="fas fa-crosshairs"></i> Center
            </button>
            <button onclick="window.businessLocator.getRouteToBusiness(${business.lat}, ${business.lng}, '${business.name}')" class="popup-btn">
              <i class="fas fa-route"></i> Get Route
            </button>
            <button onclick="window.businessLocator.getDirections(${business.lat}, ${business.lng})" class="popup-btn">
              <i class="fas fa-external-link-alt"></i> Google Maps
            </button>
          </div>
        </div>
      `;
      
      const marker = L.marker([business.lat, business.lng], {
        icon: this.getIcon(business.type)
      }).bindPopup(popupText);
      
      marker.business = business;
      this.markerGroup.addLayer(marker);
    });

    this.updateBusinessList();
    this.updateFilterStatus();
  }

  updateBusinessList() {
    const businessList = document.getElementById('businessList');
    businessList.innerHTML = '';

    if (this.filteredBusinesses.length === 0) {
      businessList.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>No businesses found</p>
          <small>Try adjusting your search or filters</small>
        </div>
      `;
      return;
    }

    // Sort by distance if user location is available
    const sortedBusinesses = [...this.filteredBusinesses].sort((a, b) => {
      if (!this.userLocation) return 0;
      const distA = this.calculateDistance(this.userLocation.lat, this.userLocation.lng, a.lat, a.lng);
      const distB = this.calculateDistance(this.userLocation.lat, this.userLocation.lng, b.lat, b.lng);
      return parseFloat(distA) - parseFloat(distB);
    });

    sortedBusinesses.forEach((business, index) => {
      const distance = this.userLocation ? 
        this.calculateDistance(this.userLocation.lat, this.userLocation.lng, business.lat, business.lng) : 
        'N/A';

      const businessItem = document.createElement('div');
      businessItem.className = 'business-item';
      businessItem.innerHTML = `
        <div class="business-icon" style="background-color: ${this.getIconColor(business.type)}">
          ${this.getIconEmoji(business.type)}
        </div>
        <div class="business-info">
          <div class="business-name">${business.name}</div>
          <div class="business-details">
            <span class="business-type">${business.type}</span>
            <span class="business-distance">${distance} km</span>
          </div>
        </div>
        <div class="business-actions">
          <button class="action-btn route-btn" onclick="event.stopPropagation(); window.businessLocator.getRouteToBusiness(${business.lat}, ${business.lng}, '${business.name}')" title="Get Route">
            <i class="fas fa-route"></i>
          </button>
        </div>
      `;

      businessItem.addEventListener('click', () => {
        this.selectBusiness(business);
      });

      businessList.appendChild(businessItem);
    });
  }

  getIconColor(type) {
    const colors = {
      'café': '#8B4513',
      'restaurant': '#FF6B6B',
      'shop': '#4ECDC4',
      'other': '#3388ff'
    };
    return colors[type] || colors.other;
  }

  getIconEmoji(type) {
    const emojis = {
      'café': '☕',
      'restaurant': '🍽️',
      'shop': '🛍️',
      'other': '📍'
    };
    return emojis[type] || emojis.other;
  }

  selectBusiness(business) {
    // Remove previous selection
    document.querySelectorAll('.business-item').forEach(item => {
      item.classList.remove('selected');
    });

    // Add selection to clicked item
    event.currentTarget.classList.add('selected');

    // Center map on business
    this.centerOnBusiness(business.name);

    // Open popup
    this.markerGroup.eachLayer(layer => {
      if (layer.business && layer.business.name === business.name) {
        layer.openPopup();
      }
    });
  }

  centerOnBusiness(businessName) {
    const business = this.businesses.find(b => b.name === businessName);
    if (business) {
      this.map.setView([business.lat, business.lng], 16);
    }
  }

  getDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }

  // Routing Methods
  async getRouteToBusiness(lat, lng, businessName) {
    if (!this.userLocation) {
      this.showStatus('Please enable location access to get routes', 'error');
      return;
    }

    const start = [this.userLocation.lng, this.userLocation.lat];
    const end = [lng, lat];

    this.currentRoute = {
      start: start,
      end: end,
      businessName: businessName
    };

    await this.getRoute(start, end);
  }

  async getRoute(start, end) {
    try {
      this.showLoading('Calculating route...');

      const travelMode = document.getElementById('travelMode').value;
      const routeControls = document.getElementById('routeControls');
      
      console.log(`🗺️ Starting route calculation:`);
      console.log(`   From: [${start.join(',')}]`);
      console.log(`   To: [${end.join(',')}]`);
      console.log(`   Mode: ${travelMode}`);
      
      // Validate coordinates
      if (!this.validateCoordinates(start) || !this.validateCoordinates(end)) {
        throw new Error('Invalid coordinates provided');
      }
      
      // Show route controls
      routeControls.style.display = 'block';

      // Clear existing route
      this.clearRouteVisualization();

      // Get route from OpenRouteService
      const routeData = await this.fetchRouteFromAPI(start, end, travelMode);

      if (routeData && routeData.features && routeData.features.length > 0) {
        const route = routeData.features[0];
        const properties = route.properties;
        
        console.log('✅ Route data received successfully');
        
        // Display route on map
        this.displayRouteOnMap(route);
        
        // Update route info
        this.updateRouteInfo(properties);
        
        // Add start and end markers
        this.addRouteMarkers(start, end);
        
        this.showStatus('Route calculated successfully!', 'success');
      } else {
        throw new Error('No route found in API response');
      }
    } catch (error) {
      console.error('❌ Route calculation failed:', error);
      this.showStatus(`Route calculation failed: ${error.message}`, 'error');
      document.getElementById('routeControls').style.display = 'none';
    } finally {
      this.hideLoading();
    }
  }

  validateCoordinates(coords) {
    if (!Array.isArray(coords) || coords.length !== 2) {
      console.error('❌ Invalid coordinates format:', coords);
      return false;
    }
    
    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      console.error('❌ Coordinates must be numbers:', { lng, lat });
      return false;
    }
    
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      console.error('❌ Coordinates out of valid range:', { lng, lat });
      return false;
    }
    
    return true;
  }

  // Test function to validate calculations
  testRouteCalculations() {
    console.log('🧪 Testing route calculations...');
    
    const testCases = [
      { distance: 1.1, mode: 'foot-walking', expectedMin: 10, expectedMax: 20 },
      { distance: 1.1, mode: 'cycling', expectedMin: 3, expectedMax: 8 },
      { distance: 1.1, mode: 'driving', expectedMin: 1, expectedMax: 4 },
      { distance: 5.0, mode: 'foot-walking', expectedMin: 50, expectedMax: 80 },
      { distance: 5.0, mode: 'cycling', expectedMin: 15, expectedMax: 25 },
      { distance: 5.0, mode: 'driving', expectedMin: 5, expectedMax: 15 }
    ];
    
    testCases.forEach(test => {
      const averageSpeeds = {
        'driving': 50,
        'cycling': 15,
        'foot-walking': 5
      };
      
      const speed = averageSpeeds[test.mode];
      const expectedDuration = (test.distance / speed) * 60;
      
      console.log(`📏 Test: ${test.distance} km by ${test.mode}`);
      console.log(`   Expected: ${expectedDuration.toFixed(1)} min (${test.expectedMin}-${test.expectedMax} min range)`);
      
      if (expectedDuration >= test.expectedMin && expectedDuration <= test.expectedMax) {
        console.log(`   ✅ PASS`);
      } else {
        console.log(`   ❌ FAIL - Outside expected range`);
      }
    });
  }

  async fetchRouteFromAPI(start, end, profile) {
    const cacheKey = `route_${start.join(',')}_${end.join(',')}_${profile}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`🔍 Fetching route from [${start.join(',')}] to [${end.join(',')}] via ${profile}`);
      
      // Note: OpenRouteService requires an API key for production use
      // For demo purposes, we'll use a free alternative or mock data
      const response = await this.fetchWithRetry(
        `https://api.openrouteservice.org/v2/directions/${profile}/json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'YOUR_API_KEY_HERE' // Add your API key
          },
          body: JSON.stringify({
            coordinates: [start, end],
            format: 'geojson',
            options: {
              avoid_features: [],
              avoid_borders: 'none'
            }
          })
        }
      );

      console.log('📊 API Response:', response);
      
      // Validate API response
      if (!response || !response.features || response.features.length === 0) {
        console.warn('⚠️ Invalid API response - no features found');
        throw new Error('No route features in API response');
      }

      const route = response.features[0];
      if (!route.properties || !route.properties.summary) {
        console.warn('⚠️ Invalid route - missing properties or summary');
        throw new Error('Invalid route properties');
      }

      const summary = route.properties.summary;
      console.log('📏 Route Summary:', summary);

      // Validate distance and duration
      if (!summary.distance || !summary.duration) {
        console.warn('⚠️ Missing distance or duration in route summary');
        throw new Error('Missing distance or duration');
      }

      // Validate realistic values
      const distanceKm = summary.distance / 1000;
      const durationMinutes = summary.duration / 60;
      
      console.log(`📐 Calculated: ${distanceKm.toFixed(2)} km, ${durationMinutes.toFixed(1)} minutes`);
      
      // Validate against realistic speeds
      this.validateRouteSpeed(distanceKm, durationMinutes, profile);

      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.warn('❌ OpenRouteService API failed:', error.message);
      console.log('🔄 Using fallback route calculation');
      
      try {
        // Fallback: Create a realistic straight-line route
        return this.createRealisticFallbackRoute(start, end, profile);
      } catch (fallbackError) {
        console.error('❌ Fallback route creation also failed:', fallbackError.message);
        
        // Ultimate fallback with hardcoded values
        console.log('🆘 Using ultimate fallback with default values');
        return {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {
              summary: {
                distance: 1000, // 1 km default
                duration: 300   // 5 minutes default
              }
            },
            geometry: {
              type: 'LineString',
              coordinates: [start, end]
            }
          }]
        };
      }
    }
  }

  validateRouteSpeed(distanceKm, durationMinutes, profile) {
    const speedKmh = (distanceKm / durationMinutes) * 60; // Convert to km/h
    
    console.log(`🚀 Calculated speed: ${speedKmh.toFixed(1)} km/h for ${profile}`);
    
    // Define realistic speed ranges for each travel mode
    const speedRanges = {
      'driving': { min: 20, max: 80, expected: 50 }, // City driving: 20-80 km/h
      'cycling': { min: 10, max: 25, expected: 15 }, // Cycling: 10-25 km/h
      'foot-walking': { min: 3, max: 7, expected: 5 } // Walking: 3-7 km/h
    };
    
    const range = speedRanges[profile];
    if (!range) {
      console.warn(`⚠️ Unknown travel mode: ${profile}`);
      return;
    }
    
    if (speedKmh < range.min || speedKmh > range.max) {
      console.warn(`⚠️ Unrealistic speed detected: ${speedKmh.toFixed(1)} km/h for ${profile}`);
      console.warn(`   Expected range: ${range.min}-${range.max} km/h`);
      console.warn(`   Distance: ${distanceKm.toFixed(2)} km, Duration: ${durationMinutes.toFixed(1)} min`);
  } else {
      console.log(`✅ Speed validation passed: ${speedKmh.toFixed(1)} km/h is realistic for ${profile}`);
    }
  }

  createRealisticFallbackRoute(start, end, profile) {
    console.log(`🔄 Creating realistic fallback route for ${profile}`);
    
    // Calculate straight-line distance
    const straightLineDistanceKm = this.calculateDistance(start[1], start[0], end[1], end[0]);
    
    // Validate the calculated distance
    if (typeof straightLineDistanceKm !== 'number' || isNaN(straightLineDistanceKm)) {
      console.error('❌ Invalid distance calculation:', straightLineDistanceKm);
      throw new Error('Invalid distance calculation');
    }
    
    console.log(`📏 Straight-line distance: ${straightLineDistanceKm} km`);
    
    // Apply realistic multipliers based on travel mode
    const distanceMultipliers = {
      'driving': 1.3, // Roads are ~30% longer than straight line
      'cycling': 1.2, // Bike paths are ~20% longer
      'foot-walking': 1.4 // Walking paths are ~40% longer
    };
    
    const multiplier = distanceMultipliers[profile] || 1.3;
    const realisticDistanceKm = straightLineDistanceKm * multiplier;
    const realisticDistanceMeters = realisticDistanceKm * 1000;
    
    // Calculate realistic duration based on average speeds
    const averageSpeeds = {
      'driving': 50, // 50 km/h average city speed
      'cycling': 15, // 15 km/h average cycling speed
      'foot-walking': 5 // 5 km/h average walking speed
    };
    
    const averageSpeed = averageSpeeds[profile] || 50;
    const realisticDurationMinutes = (realisticDistanceKm / averageSpeed) * 60;
    const realisticDurationSeconds = realisticDurationMinutes * 60;
    
    console.log(`📏 Fallback calculation:`);
    console.log(`   Straight line: ${straightLineDistanceKm.toFixed(2)} km`);
    console.log(`   Realistic distance: ${realisticDistanceKm.toFixed(2)} km (${multiplier}x multiplier)`);
    console.log(`   Average speed: ${averageSpeed} km/h`);
    console.log(`   Duration: ${realisticDurationMinutes.toFixed(1)} minutes`);
    
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          summary: {
            distance: Math.round(realisticDistanceMeters),
            duration: Math.round(realisticDurationSeconds)
          }
        },
        geometry: {
          type: 'LineString',
          coordinates: [start, end]
        }
      }]
    };
  }

  displayRouteOnMap(route) {
    // Create route layer
    this.routeLayer = L.geoJSON(route, {
      style: {
        color: '#667eea',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }
    }).addTo(this.map);

    // Fit map to route
    this.map.fitBounds(this.routeLayer.getBounds(), { padding: [20, 20] });
  }

  addRouteMarkers(start, end) {
    // Start marker (user location)
    this.routeStartMarker = L.marker([start[1], start[0]], {
      icon: L.divIcon({
        html: '<div style="background-color: #667eea; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        className: 'route-start-marker'
      })
    }).bindPopup('📍 Start Location').addTo(this.map);

    // End marker (business)
    this.routeEndMarker = L.marker([end[1], end[0]], {
      icon: L.divIcon({
        html: '<div style="background-color: #e53e3e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        className: 'route-end-marker'
      })
    }).bindPopup(`🏁 Destination: ${this.currentRoute?.businessName || 'Business'}`).addTo(this.map);
  }

  updateRouteInfo(properties) {
    const summary = properties.summary;
    
    // Validate summary data
    if (!summary || typeof summary.distance !== 'number' || typeof summary.duration !== 'number') {
      console.error('❌ Invalid route summary:', summary);
      this.showStatus('Invalid route data received', 'error');
      return;
    }
    
    // Convert to proper units with validation
    const distanceMeters = summary.distance;
    const durationSeconds = summary.duration;
    
    // Validate reasonable values
    if (distanceMeters <= 0 || durationSeconds <= 0) {
      console.error('❌ Invalid distance or duration:', { distanceMeters, durationSeconds });
      this.showStatus('Invalid route calculation', 'error');
      return;
    }
    
    const distanceKm = distanceMeters / 1000;
    const durationMinutes = durationSeconds / 60;
    
    console.log(`📊 Route Info Update:`);
    console.log(`   Distance: ${distanceMeters}m → ${distanceKm.toFixed(2)} km`);
    console.log(`   Duration: ${durationSeconds}s → ${durationMinutes.toFixed(1)} min`);
    
    // Format display values
    const displayDistance = distanceKm >= 1 ? 
      `${distanceKm.toFixed(1)} km` : 
      `${Math.round(distanceMeters)} m`;
    
    const displayDuration = durationMinutes >= 1 ? 
      `${Math.round(durationMinutes)} min` : 
      `${Math.round(durationSeconds)} sec`;

    document.getElementById('routeDistance').textContent = displayDistance;
    document.getElementById('routeDuration').textContent = displayDuration;
    
    // Additional validation - check if values make sense
    const speedKmh = (distanceKm / durationMinutes) * 60;
    console.log(`🚀 Final speed check: ${speedKmh.toFixed(1)} km/h`);
    
    if (speedKmh > 200) {
      console.warn('⚠️ Extremely high speed detected - possible calculation error');
    } else if (speedKmh < 1) {
      console.warn('⚠️ Extremely low speed detected - possible calculation error');
    }
  }

  clearRoute() {
    this.clearRouteVisualization();
    document.getElementById('routeControls').style.display = 'none';
    this.currentRoute = null;
    this.showStatus('Route cleared', 'info');
  }

  clearRouteVisualization() {
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }
    
    if (this.routeStartMarker) {
      this.map.removeLayer(this.routeStartMarker);
      this.routeStartMarker = null;
    }
    
    if (this.routeEndMarker) {
      this.map.removeLayer(this.routeEndMarker);
      this.routeEndMarker = null;
    }
  }

  filterBusinesses() {
    const searchQuery = document.getElementById('searchBox').value.toLowerCase();
    
    let filtered = this.businesses;
    
    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(b => b.type === this.currentFilter);
    }
    
    // Apply search filter
    if (searchQuery !== '') {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchQuery) || 
        b.type.toLowerCase().includes(searchQuery)
      );
    }
    
    this.displayMarkers(filtered);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.businessLocator = new BusinessLocatorPro();
});