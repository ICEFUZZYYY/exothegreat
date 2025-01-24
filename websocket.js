const WebSocket = require("ws");
const config = require("./config.js"); // Stellen Sie sicher, dass config.js die richtige User-ID enthält

// Twitch WebSocket-Endpunkt
const ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

// WebSocket-Ereignisse
ws.on("open", () => {
    console.log("WebSocket verbunden mit Twitch EventSub!");
});

ws.on("message", (data) => {
    const message = JSON.parse(data);
    console.log("Nachricht empfangen:", message);

    if (message.metadata.message_type === "session_welcome") {
        console.log("Willkommen bei Twitch EventSub!");
        
        const sessionId = message.payload.session.id;
        console.log("Session-ID:", sessionId);

        // Event abonnieren
        ws.send(
            JSON.stringify({
                type: "SUBSCRIBE",
                data: {
                    session_id: sessionId,
                    event_type: "channel.follow",
                    condition: {
                        broadcaster_user_id: config.TWITCH_USER_ID, // Ihre Twitch-User-ID
                    },
                },
            })
        );
        console.log("Abonnement für 'channel.follow' gesendet.");
    } else if (message.metadata.message_type === "session_subscribed") {
        console.log("Event erfolgreich abonniert:", message.payload);
    } else if (message.metadata.message_type === "notification") {
        const event = message.payload.event;
        console.log("Neue Benachrichtigung:", event);

        if (event.event_type === "channel.follow") {
            const followerElement = document.getElementById("follower-number");
            if (followerElement) {
                followerElement.textContent = parseInt(followerElement.textContent || "0") + 1;
            }
            console.log(`Neuer Follower: ${event.user_name}`);
        }
    }
});

ws.on("close", () => {
    console.log("WebSocket-Verbindung geschlossen.");
});

ws.on("error", (err) => {
    console.error("WebSocket-Fehler:", err);
}); 