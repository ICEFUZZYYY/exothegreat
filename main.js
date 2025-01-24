import config from './config.js';

// Am Anfang Ihrer Hauptdatei
function validateConfig() {
    const required = ['TWITCH_USER_ID', 'TWITCH_CLIENT_ID', 'TWITCH_ACCESS_TOKEN'];
    for (const key of required) {
        if (!config[key]) {
            throw new Error(`Fehlende Konfiguration: ${key}`);
        }
    }
}

// Vor der ersten Verwendung aufrufen
validateConfig();

// Funktion: Followeranzahl abrufen
async function fetchFollowerCount() {
    try {
        const response = await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${config.TWITCH_USER_ID}`, {
            headers: {
                "Authorization": `Bearer ${config.TWITCH_ACCESS_TOKEN}`,
                "Client-ID": config.TWITCH_CLIENT_ID
            }
        });

        if (response.status === 410) {
            throw new Error("Access Token oder Anfrage ungültig. Bitte aktualisiere dein Token.");
        }

        if (!response.ok) {
            throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.total;
    } catch (error) {
        console.error("Fehler bei der API-Anfrage:", error);
        return null;
    }
}

// HTML aktualisieren
async function updateFollowerCount() {
    const followerElement = document.getElementById("follower-number");
    const statusElement = document.getElementById("status");
    
    try {
        statusElement.textContent = "Aktualisiere...";
        statusElement.classList.remove("error");
        
        const count = await fetchFollowerCount();
        
        if (count !== null) {
            followerElement.textContent = count;
            statusElement.textContent = `Zuletzt aktualisiert: ${new Date().toLocaleTimeString()}`;
        } else {
            throw new Error("Followeranzahl konnte nicht abgerufen werden");
        }
    } catch (error) {
        followerElement.textContent = "Error";
        statusElement.textContent = error.message;
        statusElement.classList.add("error");
    }
}

// Start des Skripts
try {
    validateConfig();
    
    // Erste Aktualisierung
    updateFollowerCount();
    
    // Automatische Aktualisierung alle 10 Sekunden
    setInterval(updateFollowerCount, 10000);
    
} catch (error) {
    console.error("Initialisierungsfehler:", error);
    document.getElementById("follower-number").textContent = "Config Error";
    document.getElementById("status").textContent = error.message;
    document.getElementById("status").classList.add("error");
}

const clientSocket = new WebSocket("ws://localhost:8080");

clientSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "new_follower") {
        const followerElement = document.getElementById("follower-number");
        const statusElement = document.getElementById("status");

        if (followerElement) {
            const currentCount = parseInt(followerElement.textContent) || 0;
            followerElement.textContent = currentCount + 1;
        }

        if (statusElement) {
            statusElement.textContent = `Neuer Follower: ${data.user_name}`;
        }
    }
}; 