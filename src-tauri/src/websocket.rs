use futures_util::{SinkExt, StreamExt};
use serde_json::Value;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio_tungstenite::{accept_async, tungstenite::Message};

pub type BroadcastSender = broadcast::Sender<String>;

/// Start WebSocket server on port 9001
pub async fn start_websocket_server(tx: BroadcastSender) -> Result<(), Box<dyn std::error::Error>> {
    let addr = "127.0.0.1:9001";
    let listener = TcpListener::bind(&addr).await?;
    println!("[WebSocket Server] Listening on: {}", addr);

    while let Ok((stream, peer_addr)) = listener.accept().await {
        println!("[WebSocket Server] New connection from: {}", peer_addr);
        let tx_clone = tx.clone();
        tokio::spawn(handle_connection(stream, tx_clone));
    }

    Ok(())
}

async fn handle_connection(stream: TcpStream, broadcast_tx: BroadcastSender) {
    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("[WebSocket] Error during handshake: {}", e);
            return;
        }
    };

    println!("[WebSocket] WebSocket connection established");

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();
    let mut broadcast_rx = broadcast_tx.subscribe();

    // Spawn a task to send broadcast messages to this client
    let send_task = tokio::spawn(async move {
        while let Ok(msg) = broadcast_rx.recv().await {
            if ws_sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    // Handle incoming messages from client
    let receive_task = tokio::spawn(async move {
        while let Some(msg) = ws_receiver.next().await {
            match msg {
                Ok(Message::Text(text)) => {
                    println!("[WebSocket] Received: {}", text);
                    // Echo or handle client messages if needed
                }
                Ok(Message::Close(_)) => {
                    println!("[WebSocket] Client disconnected");
                    break;
                }
                Err(e) => {
                    eprintln!("[WebSocket] Error receiving message: {}", e);
                    break;
                }
                _ => {}
            }
        }
    });

    // Wait for either task to complete
    tokio::select! {
        _ = send_task => {},
        _ = receive_task => {},
    }

    println!("[WebSocket] Connection closed");
}

/// Broadcast an event to all connected WebSocket clients
pub fn broadcast_event(tx: &BroadcastSender, event: Value) {
    let json_string = serde_json::to_string(&event).unwrap_or_default();
    let _ = tx.send(json_string);
}
