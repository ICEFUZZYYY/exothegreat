import { config } from './config.js';
const WebSocket = require("ws");

function initializeWebSocket() {
    const ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

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

            // Abonnieren des Events
            const subscribeMessage = {
                type: "SUBSCRIBE",
                data: {
                    session_id: sessionId,
                    event_type: "channel.follow",
                    condition: {
                        broadcaster_user_id: config.TWITCH_USER_ID,
                    },
                },
            };

            console.log("Gesendete Nachricht:", subscribeMessage);

            ws.send(JSON.stringify(subscribeMessage));
            console.log("Abonnement für 'channel.follow' gesendet.");
        } else if (message.metadata.message_type === "session_subscribed") {
            console.log("Event erfolgreich abonniert:", message.payload);
        } else if (message.metadata.message_type === "notification") {
            const event = message.payload.event;
            if (event && event.broadcaster_user_id === config.TWITCH_USER_ID) {
                console.log(`Neuer Follower: ${event.user_name}`);
                
                // Aktualisiere die Webseite
                const followerElement = document.getElementById("follower-number");
                if (followerElement) {
                    followerElement.textContent = parseInt(followerElement.textContent || "0") + 1;
                }
            }
        } else if (message.metadata.message_type === "session_keepalive") {
            console.log("Keepalive erhalten.");
        }
    });

    ws.on("close", (code, reason) => {
        console.log(`WebSocket-Verbindung geschlossen. Code: ${code}, Grund: ${reason}`);
        console.log("Versuche erneut zu verbinden...");
        setTimeout(initializeWebSocket, 5000); // 5 Sekunden Verzögerung
    });

    ws.on("error", (err) => {
        console.error("WebSocket-Fehler:", err);
    });
}

// WebSocket initialisieren
console.log("Twitch User ID:", config.TWITCH_USER_ID);
initializeWebSocket(); 