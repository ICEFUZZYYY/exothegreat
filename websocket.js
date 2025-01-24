import WebSocket, { WebSocketServer } from 'ws';
import config from './config.js';

// Lokalen WebSocket-Server für den Client starten
const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket-Server läuft auf ws://localhost:8080");

wss.on("connection", (socket) => {
    console.log("Neuer Client verbunden.");
    socket.on("close", () => {
        console.log("Client-Verbindung geschlossen.");
    });
});

// Twitch WebSocket initialisieren
let sessionId = null;

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
            sessionId = message.payload.session.id;

            if (sessionId) {
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

                ws.send(JSON.stringify(subscribeMessage));
                console.log("Abonnement für 'channel.follow' gesendet.");
            }
        } else if (message.metadata.message_type === "session_subscribed") {
            console.log("Event erfolgreich abonniert:", message.payload);
        } else if (message.metadata.message_type === "notification") {
            const event = message.payload.event;
            if (event && event.broadcaster_user_id === config.TWITCH_USER_ID) {
                console.log(`Neuer Follower: ${event.user_name}`);
                
                // Nachricht an alle verbundenen Clients senden
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "new_follower", user_name: event.user_name }));
                    }
                });
            }
        }
    });

    ws.on("close", (code, reason) => {
        console.log(`WebSocket-Verbindung geschlossen. Code: ${code}, Grund: ${reason}`);
        console.log("Versuche erneut zu verbinden...");
        sessionId = null; // Reset sessionId on close
        setTimeout(initializeWebSocket, 10000); // 10 Sekunden warten
    });

    ws.on("error", (err) => {
        console.error("WebSocket-Fehler:", err);
    });
}

initializeWebSocket(); 