document.addEventListener("DOMContentLoaded", function() {
    // Initialize Leaflet map
    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    const startButton = document.getElementById('startListening');
    const statusDisplay = document.getElementById('status');
    const detectedSentenceDisplay = document.getElementById('detectedSentence');

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
        const keywords = ['find', 'search'];
        for (const keyword of keywords) {
            if (command.includes(keyword)) {
                const place = command.replace(keyword, '').trim();
                findLocation(place);
                return;
            }
        }
        statusDisplay.textContent = 'Command not recognized.';
    }

    function findLocation(place) {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;

        fetch(nominatimUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const location = data[0];
                    const lat = location.lat;
                    const lon = location.lon;

                    // Using bounding box to determine the zoom level and center
                    const bounds = location.boundingbox;
                    const zoomLevel = calculateZoomLevel(bounds);

                    map.setView([lat, lon], zoomLevel);
                    L.marker([lat, lon]).addTo(map).bindPopup(`<b>${place}</b>`).openPopup();
                    statusDisplay.textContent = `Found location: ${place}`;
                } else {
                    statusDisplay.textContent = 'Location not found.';
                }
            })
            .catch(error => {
                console.error('Geocoding error:', error);
                statusDisplay.textContent = 'Error finding location.';
            });
    }

    function calculateZoomLevel(bounds) {
        if (!bounds) return 13;  // Default zoom level if bounds are not available

        // Example logic based on bounding box
        const [north, south, east, west] = bounds.map(Number);
        const latDiff = north - south;
        const lonDiff = east - west;

        // Adjust zoom level based on the area
        if (latDiff > 10 || lonDiff > 10) return 6; // Country
        if (latDiff > 1 || lonDiff > 1) return 10; // State
        return 13; // City
    }
});
