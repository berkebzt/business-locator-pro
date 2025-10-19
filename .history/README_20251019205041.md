# 🗺️ Business Locator Pro

A modern, feature-rich web application for discovering local businesses using real-time data from OpenStreetMap. Built with Leaflet.js and featuring advanced clustering, routing, and favorites functionality.

![Business Locator Pro](https://img.shields.io/badge/Version-2.0-blue)
![Leaflet.js](https://img.shields.io/badge/Leaflet.js-1.9.4-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Business Discovery** - Find restaurants, cafés, shops, and more
- **Interactive Map** - Powered by Leaflet.js with OpenStreetMap tiles
- **Smart Clustering** - Groups nearby markers for better performance
- **Distance Calculation** - Shows distance from your location
- **Advanced Filtering** - Filter by business type and search by name

### 🚀 Advanced Features
- **Route Planning** - Get directions with OpenRouteService API
- **Favorites System** - Save and manage your favorite businesses
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Export Functionality** - Export favorites and search results

### 🎨 User Experience
- **Modern UI** - Professional gradient design with smooth animations
- **Real-time Updates** - Live status messages and loading indicators
- **Accessibility** - ARIA labels and keyboard navigation support
- **Performance Optimized** - Caching and efficient data handling

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js with MarkerCluster plugin
- **APIs**: 
  - OpenStreetMap Nominatim (reverse geocoding)
  - Overpass API (business data)
  - OpenRouteService (routing)
  - ipapi.co (geolocation)
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Icons**: Font Awesome 6

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/business-locator-pro.git
   cd business-locator-pro
   ```

2. **Start the development server**
   ```bash
   python3 -m http.server 3000
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

### Alternative Setup
You can also open `index.html` directly in your browser, but some features may be limited due to CORS restrictions.

## 📖 Usage

### Basic Usage
1. **Allow Location Access** - The app will detect your location automatically
2. **Browse Businesses** - View clustered markers on the map
3. **Filter Results** - Use the sidebar filters to narrow down results
4. **Search** - Type in the search box to find specific businesses
5. **View Details** - Click on markers to see business information

### Advanced Features
- **Add to Favorites** - Click the heart icon in business popups
- **Get Directions** - Use the route button for navigation
- **Export Data** - Download your favorites as JSON
- **Toggle Dark Mode** - Use the theme toggle in the header

## 🗂️ Project Structure

```
business-locator-pro/
├── index.html          # Main HTML file
├── style.css           # All styling and responsive design
├── app.js              # Main application logic
├── README.md           # Project documentation
└── .gitignore          # Git ignore file
```

## 🔧 Configuration

### API Keys (Optional)
For enhanced functionality, you can add API keys:

1. **OpenRouteService** (for routing):
   - Get a free API key from [OpenRouteService](https://openrouteservice.org/)
   - Add it to the `fetchRouteFromAPI` method in `app.js`

2. **Custom Styling**:
   - Modify CSS variables in `style.css` for custom colors
   - Adjust cluster settings in `initializeMarkerCluster()` method

## 🌟 Key Features Explained

### Marker Clustering
- Groups nearby markers for better performance
- Custom styling with size-based colors
- Smooth animations and hover effects
- Automatic unclustering at high zoom levels

### Favorites System
- Persistent storage using localStorage
- Export functionality for backup
- Real-time count updates
- Modal interface for management

### Routing Integration
- Multiple travel modes (driving, cycling, walking)
- Realistic time and distance calculations
- Fallback system for API failures
- Visual route display on map

## 🎨 Customization

### Colors and Themes
Modify CSS variables in `style.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
  /* ... more variables */
}
```

### Clustering Options
Adjust clustering behavior in `app.js`:
```javascript
this.markerClusterGroup = L.markerClusterGroup({
  maxClusterRadius: 80,           // Adjust cluster radius
  disableClusteringAtZoom: 17,    // Change uncluster zoom level
  // ... more options
});
```

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- [Nominatim](https://nominatim.org/) for geocoding
- [Overpass API](https://overpass-api.de/) for business data
- [OpenRouteService](https://openrouteservice.org/) for routing
- [Leaflet.js](https://leafletjs.com/) for mapping functionality
- [Font Awesome](https://fontawesome.com/) for icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/business-locator-pro/issues) page
2. Create a new issue with detailed information
3. Include browser version and error messages

## 🚀 Future Enhancements

- [ ] Offline mode support
- [ ] User reviews and ratings
- [ ] Business hours display
- [ ] Photo galleries
- [ ] Social sharing
- [ ] Multi-language support
- [ ] Progressive Web App (PWA) features

---

**Made with ❤️ using modern web technologies**
