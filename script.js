// ROK City Viewer Application
class ROKCityViewer {
    constructor() {
        this.cities = [];
        this.filteredCities = [];
        this.selectedCity = null;
        this.mapImage = null;
        this.cityMarkers = [];

        this.init();
    }

    async init() {
        await this.loadCitiesData();
        this.setupEventListeners();
        this.renderCitiesList();
        this.setupMapMarkers();
        this.updateDebugInfo();

        // Ensure loading state is handled even if map fails
        setTimeout(() => {
            const mapContainer = document.querySelector('.map-container');
            if (!mapContainer.classList.contains('loaded')) {
                console.warn('Map loading timeout - forcing loaded state');
                mapContainer.classList.add('loaded');
            }
        }, 5000); // 5 second timeout

        this.showToast('ROK City Viewer loaded successfully!', 'success');
    }

    async loadCitiesData() {
        try {
            const response = await fetch('indexed_cities.csv');
            const csvText = await response.text();
            this.cities = this.parseCSV(csvText);
            this.filteredCities = [...this.cities];
            console.log(`Loaded ${this.cities.length} cities`);

            // Debug: Show coordinate ranges
            if (this.cities.length > 0) {
                const xCoords = this.cities.map(c => c.coordinates.x).filter(x => x > 0);
                const yCoords = this.cities.map(c => c.coordinates.y).filter(y => y > 0);
                const xMin = Math.min(...xCoords);
                const xMax = Math.max(...xCoords);
                const yMin = Math.min(...yCoords);
                const yMax = Math.max(...yCoords);

                console.log(`Sample city coordinate ranges:`);
                console.log(`X: ${xMin} to ${xMax} (out of 0-1200)`);
                console.log(`Y: ${yMin} to ${yMax} (out of 0-1200)`);
                console.log(`This represents ${((xMax - xMin) / 1200 * 100).toFixed(1)}% of X range and ${((yMax - yMin) / 1200 * 100).toFixed(1)}% of Y range`);
            }
        } catch (error) {
            console.error('Error loading cities data:', error);
            this.showToast('Error loading cities data', 'error');
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const cities = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length >= 4) {
                const city = {
                    text: values[0].replace(/"/g, ''),
                    confidence: parseFloat(values[1]),
                    image: values[2].replace(/"/g, ''),
                    crop: values[3].replace(/"/g, ''),
                    coordinates: this.extractCoordinates(values[2])
                };
                cities.push(city);
            }
        }

        return cities;
    }

    extractCoordinates(imageName) {
        // Extract coordinates from image name like "map_14_1092.png"
        const match = imageName.match(/map_(\d+)_(\d+)/);
        if (match) {
            return {
                x: parseInt(match[1]),
                y: parseInt(match[2])
            };
        }
        return { x: 0, y: 0 };
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('city-search');
        searchInput.addEventListener('input', (e) => {
            this.filterCities(e.target.value);
        });

        // Close city details panel
        const closePanelBtn = document.getElementById('close-city-panel');
        closePanelBtn.addEventListener('click', () => {
            this.hideCityDetailsPanel();
        });

        // Map click tracking for debugging
        const mapContainer = document.querySelector('.map-container');
        mapContainer.addEventListener('click', (e) => {
            this.handleMapClick(e);
        });

        // Grid toggle
        const toggleGridBtn = document.getElementById('toggle-grid');
        toggleGridBtn.addEventListener('click', () => {
            this.toggleCoordinateGrid();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCityDetailsPanel();
            }
        });
    }

    filterCities(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredCities = [...this.cities];
        } else {
            this.filteredCities = this.cities.filter(city =>
                city.text.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        this.renderCitiesList();
        this.updateMapMarkers();
    }

    renderCitiesList() {
        const citiesList = document.getElementById('cities-list');
        citiesList.innerHTML = '';

        if (this.filteredCities.length === 0) {
            citiesList.innerHTML = '<div class="no-results">No cities found</div>';
            return;
        }

        this.filteredCities.forEach(city => {
            const cityItem = document.createElement('div');
            cityItem.className = 'city-item';
            cityItem.addEventListener('click', () => {
                this.selectCity(city);
            });

            const confidenceClass = this.getConfidenceClass(city.confidence);

            cityItem.innerHTML = `
                <div class="city-name">${city.text}</div>
                <div class="city-confidence ${confidenceClass}">
                    Confidence: ${(city.confidence * 100).toFixed(0)}%
                </div>
            `;

            citiesList.appendChild(cityItem);
        });
    }

    getConfidenceClass(confidence) {
        if (confidence >= 0.7) return 'confidence-high';
        if (confidence >= 0.4) return 'confidence-medium';
        return 'confidence-low';
    }

    setupMapMarkers() {
        this.mapImage = document.getElementById('map-image');
        this.cityMarkers = document.getElementById('city-markers');
        const mapContainer = document.querySelector('.map-container');

        // Wait for map image to load
        this.mapImage.addEventListener('load', () => {
            // Add loaded class for smooth transition
            this.mapImage.classList.add('loaded');
            mapContainer.classList.add('loaded');

            this.updateMapMarkers();
            this.createCoordinateGrid();
        });

        // Handle image load errors
        this.mapImage.addEventListener('error', () => {
            console.error('Failed to load map image');
            mapContainer.classList.add('loaded'); // Remove spinner even on error
        });

        // If image is already loaded (cached), handle it immediately
        if (this.mapImage.complete) {
            this.mapImage.classList.add('loaded');
            mapContainer.classList.add('loaded');
            this.updateMapMarkers();
            this.createCoordinateGrid();
        }
    }

    createCoordinateGrid() {
        const gridContainer = document.getElementById('coordinate-grid');
        gridContainer.innerHTML = '';

        // Create grid lines for major coordinate values in 1200x1200 system
        // Layout: TL(0,1200), BL(0,0), TR(1200,1200), BR(1200,0)
        const gameSize = 1200;

        // X-axis grid lines (every 200 units)
        for (let x = 200; x <= 1000; x += 200) {
            const xPercent = (x / gameSize) * 100;
            const line = document.createElement('div');
            line.className = 'grid-line vertical';
            line.style.left = `${xPercent}%`;
            gridContainer.appendChild(line);

            // Add label
            const label = document.createElement('div');
            label.className = 'grid-label';
            label.textContent = x;
            label.style.left = `${xPercent}%`;
            label.style.top = '5px';
            gridContainer.appendChild(label);
        }

        // Y-axis grid lines (every 200 units) - inverted
        for (let y = 200; y <= 1000; y += 200) {
            // Invert Y coordinate: 0=bottom, 1200=top
            const yPercent = ((gameSize - y) / gameSize) * 100;
            const line = document.createElement('div');
            line.className = 'grid-line horizontal';
            line.style.top = `${yPercent}%`;
            gridContainer.appendChild(line);

            // Add label
            const label = document.createElement('div');
            label.className = 'grid-label';
            label.textContent = y;
            label.style.left = '5px';
            label.style.top = `${yPercent}%`;
            gridContainer.appendChild(label);
        }

        // Add corner labels to show coordinate system
        const corners = [
            { pos: 'top-left', coords: '(0, 1200)', style: { top: '5px', left: '5px' } },
            { pos: 'top-right', coords: '(1200, 1200)', style: { top: '5px', right: '5px' } },
            { pos: 'bottom-left', coords: '(0, 0)', style: { bottom: '5px', left: '5px' } },
            { pos: 'bottom-right', coords: '(1200, 0)', style: { bottom: '5px', right: '5px' } }
        ];

        corners.forEach(corner => {
            const label = document.createElement('div');
            label.className = 'grid-label corner-label';
            label.textContent = corner.coords;
            label.style.position = 'absolute';
            Object.assign(label.style, corner.style);
            gridContainer.appendChild(label);
        });
    }

    updateMapMarkers() {
        this.cityMarkers.innerHTML = '';

        this.filteredCities.forEach(city => {
            if (city.coordinates.x > 0 && city.coordinates.y > 0) {
                this.createCityMarker(city);
            }
        });
    }

    createCityMarker(city) {
        const marker = document.createElement('div');
        marker.className = 'city-marker';
        marker.title = city.text;

        // Add unique identifier and data attributes for easier selection
        marker.setAttribute('data-city-name', city.text);
        marker.setAttribute('data-city-coords', `${city.coordinates.x},${city.coordinates.y}`);
        marker.id = `marker-${city.text.replace(/\s+/g, '-')}`;

        // Calculate position based on coordinates
        const position = this.calculateMarkerPosition(city.coordinates);
        marker.style.left = `${position.x}%`;
        marker.style.top = `${position.y}%`;

        marker.addEventListener('click', () => {
            this.selectCity(city);
        });

        this.cityMarkers.appendChild(marker);

        console.log(`Created marker for city: ${city.text} at position ${position.x}%, ${position.y}% with ID: ${marker.id}`);
    }

    findCityMarker(cityName) {
        // Try multiple methods to find the marker
        let marker = document.querySelector(`[data-city-name="${cityName}"]`);

        if (!marker) {
            // Fallback: try by ID
            const safeId = cityName.replace(/\s+/g, '-');
            marker = document.getElementById(`marker-${safeId}`);
        }

        if (!marker) {
            // Fallback: try by title attribute
            marker = document.querySelector(`[title="${cityName}"]`);
        }

        if (!marker) {
            // Last resort: search all markers by text content
            const allMarkers = document.querySelectorAll('.city-marker');
            marker = Array.from(allMarkers).find(m => m.title === cityName);
        }

        return marker;
    }

    calculateMarkerPosition(coordinates) {
        // Convert game coordinates to percentage positions on the map
        // Game uses full 1200x1200 coordinate system
        // Layout: TL(0,1200), BL(0,0), TR(1200,1200), BR(1200,0)
        const gameSize = 1200;

        // Convert coordinates to percentages (0-100)
        const xPercent = (coordinates.x / gameSize) * 100;
        // Y-axis is inverted: 0=bottom, 1200=top
        const yPercent = ((gameSize - coordinates.y) / gameSize) * 100;

        // Debug logging
        console.log(`City: ${coordinates.x}, ${coordinates.y} -> Position: ${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%`);

        // Ensure markers stay within map boundaries
        return {
            x: Math.max(2, Math.min(98, xPercent)),
            y: Math.max(2, Math.min(98, yPercent))
        };
    }

    selectCity(city) {
        this.selectedCity = city;
        this.showCityDetailsPanel(city);
        this.highlightCityMarker(city);
        this.highlightCityInList(city);
        this.centerMapOnCity(city);
    }

    centerMapOnCity(city) {
        // Calculate the position of the city on the map
        const position = this.calculateMarkerPosition(city.coordinates);

        // Get the map container
        const mapContainer = document.querySelector('.map-container');
        const mapImage = document.getElementById('map-image');

        // Calculate the scroll position to center the city
        const containerRect = mapContainer.getBoundingClientRect();
        const imageRect = mapImage.getBoundingClientRect();

        // If the map is larger than the container, we can scroll to center
        if (imageRect.width > containerRect.width || imageRect.height > containerRect.height) {
            const scrollX = (position.x / 100) * imageRect.width - containerRect.width / 2;
            const scrollY = (position.y / 100) * imageRect.height - containerRect.height / 2;

            // Smooth scroll to center the city
            mapContainer.scrollTo({
                left: Math.max(0, scrollX),
                top: Math.max(0, scrollY),
                behavior: 'smooth'
            });
        }

        console.log(`Centered map on city: ${city.text} at position ${position.x}%, ${position.y}%`);
    }

    showCityDetailsPanel(city) {
        const panel = document.getElementById('city-details-panel');

        // Update panel content
        document.getElementById('panel-city-name').textContent = city.text;
        document.getElementById('panel-confidence').textContent = `${(city.confidence * 100).toFixed(0)}%`;
        document.getElementById('panel-location').textContent = `(${city.coordinates.x}, ${city.coordinates.y})`;

        // Update city image with better path handling
        const cityImage = document.getElementById('panel-city-image');
        const imagePath = `city-images/${city.crop.split('\\').pop()}`;
        cityImage.src = imagePath;
        cityImage.alt = city.text;

        // Debug image loading
        console.log(`Loading city image: ${imagePath}`);

        // Handle image load events
        cityImage.onload = () => {
            console.log(`City image loaded successfully: ${imagePath}`);
        };

        cityImage.onerror = () => {
            console.error(`Failed to load city image: ${imagePath}`);
            cityImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBDMTE2LjU2OSA2MCAxMzAgNzMuNDMxIDEzMCA5MEMxMzAgMTA2LjU2OSAxMTYuNTY5IDEyMCAxMDAgMTIwQzgzLjQzMSAxMjAgNzAgMTA2LjU2OSA3MCA5MEM3MCA3My40MzEgODMuNDMxIDYwIDEwMCA2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSI3MCIgeT0iMTMwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDMwQzEwIDI2LjE0MjEgMTMuMTQyMSAyMyAxNyAyM0g0M0M0Ni44NTc5IDIzIDUwIDI2LjE0MjEgNTAgMzBWMzVDNTAgMzguODU3OSA0Ni44NTc5IDQyIDQzIDQySDE3QzEzLjE0MjEgNDIgMTAgMzguODU3OSAxMCAzNVYzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=';
        };

        // Show panel
        panel.classList.remove('hidden');
    }

    hideCityDetailsPanel() {
        const panel = document.getElementById('city-details-panel');
        panel.classList.add('hidden');

        // Remove highlights
        this.removeHighlights();
    }

    highlightCityMarker(city) {
        // Remove previous highlights
        document.querySelectorAll('.city-marker').forEach(marker => {
            marker.classList.remove('highlighted');
        });

        // Debug: Show available markers
        const availableMarkers = document.querySelectorAll('.city-marker');
        console.log(`Available markers: ${availableMarkers.length}`);
        availableMarkers.forEach(m => {
            console.log(`  - ${m.title} (${m.getAttribute('data-city-name')})`);
        });

        // Add highlight to current city marker using data attributes
        const marker = this.findCityMarker(city.text);

        if (marker) {
            marker.classList.add('highlighted');
            console.log(`Highlighted marker for city: ${city.text}`);

            // Ensure the marker is visible by scrolling to it if needed
            marker.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        } else {
            console.warn(`Could not find marker for city: ${city.text}`);
            console.log(`Looking for city: "${city.text}"`);
            console.log(`Current filtered cities: ${this.filteredCities.length}`);
            console.log(`Total cities: ${this.cities.length}`);

            // If marker not found, it might be filtered out - temporarily show all cities
            this.showAllCitiesForHighlighting(city);
        }
    }

    showAllCitiesForHighlighting(selectedCity) {
        // Temporarily show all cities to ensure the marker exists
        const originalFiltered = [...this.filteredCities];
        this.filteredCities = [...this.cities];
        this.updateMapMarkers();

        // Now try to find and highlight the marker
        setTimeout(() => {
            const marker = this.findCityMarker(selectedCity.text);
            if (marker) {
                marker.classList.add('highlighted');
                console.log(`Successfully highlighted marker for city: ${selectedCity.text} after showing all cities`);

                // Restore the original filter after a short delay
                setTimeout(() => {
                    this.filteredCities = originalFiltered;
                    this.updateMapMarkers();

                    // Re-highlight the selected city marker
                    const currentMarker = this.findCityMarker(selectedCity.text);
                    if (currentMarker) {
                        currentMarker.classList.add('highlighted');
                    }
                }, 1000);
            }
        }, 100);
    }

    highlightCityInList(city) {
        // Remove previous selections
        document.querySelectorAll('.city-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to current city item
        const cityItems = document.querySelectorAll('.city-item');
        cityItems.forEach(item => {
            if (item.querySelector('.city-name').textContent === city.text) {
                item.classList.add('selected');
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    removeHighlights() {
        document.querySelectorAll('.city-marker').forEach(marker => {
            marker.classList.remove('highlighted');
        });

        document.querySelectorAll('.city-item').forEach(item => {
            item.classList.remove('selected');
        });
    }

    showToast(message, type = 'success') {
        // Remove existing toasts
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Utility method to get city by name
    getCityByName(name) {
        return this.cities.find(city => city.text === name);
    }

    // Method to get cities by confidence level
    getCitiesByConfidence(minConfidence) {
        return this.cities.filter(city => city.confidence >= minConfidence);
    }

    // Method to get cities in coordinate range
    getCitiesInRange(xMin, xMax, yMin, yMax) {
        return this.cities.filter(city =>
            city.coordinates.x >= xMin &&
            city.coordinates.x <= xMax &&
            city.coordinates.y >= yMin &&
            city.coordinates.y <= yMax
        );
    }

    handleMapClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // Convert to game coordinates using the full 1200x1200 system
        // Y-axis is inverted: 0=bottom, 1200=top
        const gameSize = 1200;
        const gameX = Math.round((xPercent / 100) * gameSize);
        const gameY = Math.round(((100 - yPercent) / 100) * gameSize);

        document.getElementById('debug-coordinates').textContent =
            `Click: ${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}% | Game: (${gameX}, ${gameY})`;
    }

    updateDebugInfo() {
        document.getElementById('city-count').textContent = this.cities.length;
    }

    toggleCoordinateGrid() {
        const grid = document.getElementById('coordinate-grid');
        const btn = document.getElementById('toggle-grid');

        if (grid.classList.contains('hidden')) {
            grid.classList.remove('hidden');
            btn.textContent = 'Hide Grid';
        } else {
            grid.classList.add('hidden');
            btn.textContent = 'Show Grid';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ROKCityViewer();
});

// Add some additional utility functions
window.ROKUtils = {
    // Export cities data
    exportCitiesData: () => {
        const viewer = window.cityViewer;
        if (viewer) {
            const dataStr = JSON.stringify(viewer.cities, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'rok_cities_data.json';
            link.click();
            URL.revokeObjectURL(url);
        }
    },

    // Get statistics about cities
    getCityStats: () => {
        const viewer = window.cityViewer;
        if (viewer) {
            const totalCities = viewer.cities.length;
            const highConfidence = viewer.getCitiesByConfidence(0.8).length;
            const mediumConfidence = viewer.getCitiesByConfidence(0.5).length;
            const lowConfidence = viewer.getCitiesByConfidence(0.3).length;

            return {
                total: totalCities,
                highConfidence,
                mediumConfidence,
                lowConfidence,
                averageConfidence: viewer.cities.reduce((sum, city) => sum + city.confidence, 0) / totalCities
            };
        }
        return null;
    }
};