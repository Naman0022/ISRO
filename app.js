document.addEventListener("DOMContentLoaded", function() {
    // Initialize Leaflet map
    const map = L.map('map', {
        center: [51.505, -0.09],
        zoom: 13,
        minZoom: 3,
        maxZoom: 18
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    const startButton = document.getElementById('startListening');
    const statusDisplay = document.getElementById('status');
    const detectedSentenceDisplay = document.getElementById('detectedSentence');
    const header = document.getElementById('header'); // Assuming you have an element with id 'header'

    let currentLayer = null; // To store the current layer to clear it later
    let currentZoom = map.getZoom(); // Store the current zoom level
    let lastBounds = null; // To store bounds for zooming in and out

    startButton.addEventListener('click', () => {
        startListening();
    });

    function startListening() {
        statusDisplay.textContent = "Listening...";
        
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.trim().toLowerCase();
            statusDisplay.textContent = `Heard: "${transcript}"`;
            detectedSentenceDisplay.textContent = `Detected sentence: "${transcript}"`;
            processCommand(transcript);
        };

        recognition.onerror = function(event) {
            statusDisplay.textContent = `Error: ${event.error}`;
        };

        recognition.onend = function() {
            statusDisplay.textContent = "Click the button to start listening...";
        };

        recognition.start();
    }

    function processCommand(command) {
        if (command.includes('find') || command.includes('search') || command.includes('zoom to') || command.includes('show me')) {
            const place = command.replace(/find|search|zoom to|show me/i, '').trim();
            findLocation(place);
        } else if (command.includes('zoom in')) {
            zoomIn();
        } else if (command.includes('zoom out')) {
            zoomOut();
        } else {
            statusDisplay.textContent = 'Command not recognized.';
        }
    }

    function findLocation(place) {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&addressdetails=1&limit=1`;

        fetch(nominatimUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const location = data[0];
                    const lat = location.lat;
                    const lon = location.lon;
                    const bounds = location.boundingbox;
                    const displayName = location.display_name;
                    const stateOrProvince = location.address.state || location.address.province || location.address.county || location.address.region || '';
                    const country = location.address.country || '';

                    // Clear previous layer if it exists
                    if (currentLayer) {
                        map.removeLayer(currentLayer);
                    }

                    if (bounds) {
                        const [north, south, east, west] = bounds.map(Number);
                        lastBounds = L.latLngBounds([
                            [south, west],
                            [north, east]
                        ]);

                        // Set the view to fit the bounds and add a marker
                        map.fitBounds(lastBounds);
                        currentZoom = map.getZoom(); // Update current zoom level
                        const popupContent = `<b>${place}</b><br>${stateOrProvince ? `<i>${stateOrProvince}, ${country}</i>` : `<i>${country}</i>`}`;
                        const marker = L.marker([lat, lon]).addTo(map).bindPopup(popupContent).openPopup();

                        statusDisplay.textContent = `Found location: ${place}`;
                        header.textContent = `Country: ${country}`;
                    } else {
                        statusDisplay.textContent = 'No boundary information available.';
                    }
                } else {
                    statusDisplay.textContent = 'Location not found.';
                }
            })
            .catch(error => {
                console.error('Geocoding error:', error);
                statusDisplay.textContent = 'Error finding location.';
            });
    }

    function zoomIn() {
        if (lastBounds) {
            currentZoom = Math.min(currentZoom + 1, map.getMaxZoom());
            map.setZoom(currentZoom);
        }
    }

    function zoomOut() {
        if (lastBounds) {
            currentZoom = Math.max(currentZoom - 1, map.getMinZoom());
            map.setZoom(currentZoom);
        }
    }
});
