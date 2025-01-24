const WebSocket = require("ws");

// Twitch WebSocket-Endpunkt
const ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

// WebSocket-Ereignisse
ws.on("open", () => {
    console.log("WebSocket verbunden mit Twitch EventSub!");
});

ws.on("message", (data) => {
    const message = JSON.parse(data);
    console.log("Nachricht empfangen:", message);

    // Handle Twitch EventSub Nachricht
    if (message.metadata.message_type === "session_welcome") {
        console.log("Willkommen bei Twitch EventSub!");
        // Hier könntest du weitere Abonnements hinzufügen
    } else if (message.metadata.message_type === "notification") {
        console.log("Benachrichtigung erhalten:", message.payload);
    }
});

ws.on("close", () => {
    console.log("WebSocket-Verbindung geschlossen.");
});

ws.on("error", (err) => {
    console.error("WebSocket-Fehler:", err);
}); 