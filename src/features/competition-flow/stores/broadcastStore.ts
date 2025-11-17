import { create } from 'zustand';
import { WebSocketEvent } from '../../../shared/types/websocket';
import { invoke } from '../../../shared/utils/tauriWrapper';

// Create BroadcastChannel for cross-window communication in browser mode
const CHANNEL_NAME = 'powerlifting-broadcast';
let broadcastChannel: BroadcastChannel | null = null;

// Check if we're in browser mode (not Tauri)
const isBrowserMode = () => {
  return !(window as any).__TAURI__;
};

// Initialize BroadcastChannel in browser mode
if (isBrowserMode() && typeof BroadcastChannel !== 'undefined') {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  console.log('[BroadcastChannel] Initialized for browser mode');
}

interface BroadcastState {
  // Current state
  currentEvent: WebSocketEvent | null;
  eventHistory: WebSocketEvent[];
  listeners: Set<(event: WebSocketEvent) => void>;

  // Actions
  broadcast: (event: WebSocketEvent) => void;
  subscribe: (callback: (event: WebSocketEvent) => void) => () => void;
  clearHistory: () => void;
  getLastEvent: (type: WebSocketEvent['type']) => WebSocketEvent | null;
}

export const useBroadcastStore = create<BroadcastState>((set, get) => ({
  currentEvent: null,
  eventHistory: [],
  listeners: new Set(),

  broadcast: (event: WebSocketEvent) => {
    console.log('[Broadcast] Event:', event.type, event.data);

    set((state) => ({
      currentEvent: event,
      eventHistory: [...state.eventHistory.slice(-99), event], // Keep last 100 events
    }));

    // Notify all listeners (for local components)
    const { listeners } = get();
    listeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('[Broadcast] Listener error:', error);
      }
    });

    // Broadcast to other windows/tabs
    if (isBrowserMode()) {
      // Use BroadcastChannel in browser mode
      if (broadcastChannel) {
        broadcastChannel.postMessage(event);
        console.log('[BroadcastChannel] Posted message:', event.type);
      }
    } else {
      // Use Tauri WebSocket in app mode
      invoke('broadcast_websocket_event', { event })
        .catch((error) => {
          console.error('[Broadcast] WebSocket error:', error);
        });
    }
  },

  subscribe: (callback: (event: WebSocketEvent) => void) => {
    const { listeners } = get();
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      const { listeners } = get();
      listeners.delete(callback);
    };
  },

  clearHistory: () => {
    set({ eventHistory: [], currentEvent: null });
  },

  getLastEvent: (type: WebSocketEvent['type']) => {
    const { eventHistory } = get();
    for (let i = eventHistory.length - 1; i >= 0; i--) {
      if (eventHistory[i].type === type) {
        return eventHistory[i];
      }
    }
    return null;
  },
}));
