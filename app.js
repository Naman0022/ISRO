document.addEventListener("DOMContentLoaded", function() {
    // Initialize Leaflet map
    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    // Web Speech API setup
    const startButton = document.getElementById('startListening');
    const statusDisplay = document.getElementById('status');

    // Check for browser support
    if (!('webkitSpeechRecognition' in window)) {
        alert("Web Speech API is not supported in this browser.");
        return;
    }

    // Initialize the speech recognition object
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // Start recognition
    startButton.addEventListener('click', () => {
        recognition.start();
        statusDisplay.textContent = "Listening...";
    });

    // Handle recognition results
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        statusDisplay.textContent = `Heard: "${transcript}"`;
        processCommand(transcript);
    };

    // Handle errors
    recognition.onerror = function(event) {
        statusDisplay.textContent = `Error: ${event.error}`;
    };

    recognition.onend = function() {
        statusDisplay.textContent = "Click the button to start listening...";
    };

    // Process recognized commands
    function processCommand(command) {
        if (command.includes('zoom in')) {
            map.zoomIn();
        } else if (command.includes('zoom out')) {
            map.zoomOut();
        } else if (command.includes('find')) {
            const place = command.replace('find', '').trim();
            findLocation(place);
        } else {
            statusDisplay.textContent = 'Command not recognized.';
        }
    }

    // Find and center map on the location
    function findLocation(place) {
        const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
        
        fetch(geocodingUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    map.setView([lat, lon], 13);
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
});
