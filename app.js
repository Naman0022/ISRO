document.addEventListener("DOMContentLoaded", function() {
    // Initialize Leaflet map
    const map = L.map('map', {
        center: [51.505, -0.09],
        zoom: 13,
        minZoom: 3, // Minimum zoom level to prevent zooming out too much
        maxZoom: 18 // Maximum zoom level for closer view
    });

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
                    const bounds = location.boundingbox;
                    const zoomLevel = calculateZoomLevel(bounds);

                    // Set the view to the calculated location and zoom level
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

            function calculateZoomLevel(bounds) {
                if (!bounds) return 13;  // Default zoom level if bounds are not available
        
                const [north, south, east, west] = bounds.map(Number);
                const latDiff = north - south;
                const lonDiff = east - west;
        
                const latZoom = Math.abs(160 / latDiff);
                const lonZoom = Math.abs(360 / lonDiff);
                console.log(latZoom,", ",lonZoom);
                const zoom = Math.min(latZoom, lonZoom);
                
                console.log(zoom);

                return zoom;           
            }
    }


});





// function calculateZoomLevel(bounds) {
//     if (!bounds) return 13;  // Default zoom level if bounds are not available

//     // Example logic based on bounding box
//     const [north, south, east, west] = bounds.map(Number);
//     const latDiff = north - south;
//     const lonDiff = east - west;

    // const latZoom = Math.log2(360 / latDiff);
    // const lonZoom = Math.log2(360 / lonDiff);
    // const zoom = Math.min(latZoom, lonZoom)

    // return Math.min(Math.abs(zoom, 13));
// }
