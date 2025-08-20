# 🗺️ ROK City Viewer

An interactive web application for exploring cities across the Rise of Kingdoms map. View city locations, search through the database, and examine detailed city information with images.

## ✨ Features

- **Interactive Map**: Click on city markers to view details
- **City Search**: Searchable list of all discovered cities
- **City Details**: View city images, confidence scores, and coordinates
- **Coordinate System**: 1200x1200 game coordinate mapping
- **Responsive Design**: Works on desktop and mobile devices
- **Debug Tools**: Coordinate grid overlay and click tracking

## 🚀 Live Demo

Visit: [https://yourusername.github.io/rok-city-viewer](https://yourusername.github.io/rok-city-viewer)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Glassmorphism, responsive grid layout
- **Data**: CSV parsing for city information
- **Hosting**: GitHub Pages

## 📁 Project Structure

```
rok-city-viewer/
├── index.html          # Main application page
├── styles.css          # Application styling
├── script.js           # Core application logic
├── map1_upscaled.png  # Main map image
├── indexed_cities.csv  # City data (coordinates, names, images)
├── city-images/        # Individual city images
│   ├── map_14_1092_2_Myyn_Iyie.png
│   ├── map_70_1022_2_DedjAllanaRyu.png
│   └── [more city images...]
└── README.md           # This file
```

## 🎯 How It Works

1. **Data Loading**: Parses CSV file containing city coordinates and metadata
2. **Map Rendering**: Displays the ROK map with interactive city markers
3. **Coordinate Mapping**: Converts game coordinates (0-1200) to map positions
4. **City Selection**: Click markers or list items to view detailed information
5. **Search & Filter**: Real-time search through city database

## 🎮 Coordinate System

The application uses the game's 1200x1200 coordinate system:
- **Top-Left**: (0, 1200)
- **Top-Right**: (1200, 1200)  
- **Bottom-Left**: (0, 0)
- **Bottom-Right**: (1200, 0)

Y-axis is inverted (0 = bottom, 1200 = top) to match the game's coordinate system.

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/rok-city-viewer.git
   cd rok-city-viewer
   ```

2. **Open in browser**:
   - Double-click `index.html`, or
   - Use a local server: `python -m http.server 8000`

3. **Deploy to GitHub Pages**:
   - Push to GitHub
   - Enable Pages in repository settings
   - Select source branch (main/master)

## 🔧 Development

### Local Development Server
```bash
# Python 3
python -m http.server 8000

# Node.js (if you have it)
npx serve .

# PHP (if you have it)
php -S localhost:8000
```

### File Structure Notes
- **CSV Format**: `city_name,confidence,map_image,city_image`
- **Image Naming**: `map_X_Y_Description.png` (coordinates extracted from filename)
- **City Images**: Stored in `city-images/` subdirectory

## 📱 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Internet Explorer (limited support)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- [ ] City clustering for dense areas
- [ ] Export city data to various formats
- [ ] Advanced filtering (by region, confidence level)
- [ ] Mobile app version
- [ ] Real-time coordinate updates

## 📞 Support

If you encounter any issues or have questions:
- Create an issue on GitHub
- Check the browser console for error messages
- Verify all image files are present in `city-images/`

---

**Built with ❤️ for the Rise of Kingdoms community**
