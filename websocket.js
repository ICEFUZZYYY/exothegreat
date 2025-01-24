const WebSocket = require("ws");
const config = require("./config.js"); // Stellen Sie sicher, dass config.js die richtige User-ID enthält

// Twitch WebSocket-Endpunkt
const ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

// WebSocket-Ereignisse
ws.on("open", () => {
    console.log("WebSocket verbunden mit Twitch EventSub!");

    // Event abonnieren
    ws.send(
        JSON.stringify({
            type: "SUBSCRIBE",
            data: {
                session_id: "AgoQtQdttmASS4Cjk8mMd7BQFRIGY2VsbC1j", // Ersetzen Sie dies durch die tatsächliche Session-ID
                event_type: "channel.follow",
                condition: {
                    broadcaster_user_id: config.TWITCH_USER_ID, // Ihre Twitch-User-ID
                },
            },
        })
    );
    console.log("Abonnement für 'channel.follow' gesendet.");
});

ws.on("message", (data) => {
    const message = JSON.parse(data);
    console.log("Nachricht empfangen:", message);

    if (message.metadata.message_type === "session_welcome") {
        console.log("Willkommen bei Twitch EventSub!");
        // Hier können Sie die Session-ID speichern und das Abonnement senden
    } else if (message.metadata.message_type === "session_subscribed") {
        console.log("Event erfolgreich abonniert:", message.payload);
    } else if (message.metadata.message_type === "notification" && message.payload.event.event_type === "channel.follow") {
        const followerElement = document.getElementById("follower-number");
        if (followerElement) {
            followerElement.textContent = parseInt(followerElement.textContent || "0") + 1;
        }
        console.log(`Neuer Follower: ${message.payload.event.user_name}`);
    }
});

ws.on("close", () => {
    console.log("WebSocket-Verbindung geschlossen.");
});

ws.on("error", (err) => {
    console.error("WebSocket-Fehler:", err);
}); 