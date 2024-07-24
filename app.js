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

    // Dummy function to find location
    function findLocation(place) {
        // Placeholder for finding a location and centering the map
        alert(`Finding location: ${place}`);
        // Implement geocoding and map centering logic here
    }
});
