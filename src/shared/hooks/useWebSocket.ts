import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketEvent, WebSocketMessage, WebSocketStatus } from '../types/websocket';

interface UseWebSocketOptions {
  onMessage?: (event: WebSocketEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (url: string | null, options: UseWebSocketOptions = {}) => {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.DISCONNECTED);
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldConnectRef = useRef(true);

  // Clean up reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!url || !shouldConnectRef.current) return;

    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      setStatus(WebSocketStatus.CONNECTING);

      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setStatus(WebSocketStatus.CONNECTED);
        reconnectAttemptsRef.current = 0;
        clearReconnectTimeout();
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message.event);
          onMessage?.(message.event);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setStatus(WebSocketStatus.ERROR);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setStatus(WebSocketStatus.DISCONNECTED);
        onDisconnect?.();

        // Auto-reconnect if enabled
        if (autoReconnect && shouldConnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setStatus(WebSocketStatus.RECONNECTING);

          console.log(
            `[WebSocket] Reconnecting... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setStatus(WebSocketStatus.ERROR);
    }
  }, [url, autoReconnect, reconnectInterval, maxReconnectAttempts, onConnect, onMessage, onError, onDisconnect, clearReconnectTimeout]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    clearReconnectTimeout();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus(WebSocketStatus.DISCONNECTED);
  }, [clearReconnectTimeout]);

  // Send message through WebSocket
  const sendMessage = useCallback((event: WebSocketEvent) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        timestamp: new Date().toISOString(),
        event,
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message: not connected');
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    shouldConnectRef.current = true;
    connect();

    return () => {
      shouldConnectRef.current = false;
      clearReconnectTimeout();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, clearReconnectTimeout]);

  return {
    status,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    isConnected: status === WebSocketStatus.CONNECTED,
    isConnecting: status === WebSocketStatus.CONNECTING,
    isReconnecting: status === WebSocketStatus.RECONNECTING,
  };
};
