/**
 * WebSocket Event Types for Real-Time Competition Display
 */

export type WebSocketEventType =
  | 'athlete_up'
  | 'attempt_result'
  | 'timer_update'
  | 'lift_changed'
  | 'competition_started'
  | 'competition_paused'
  | 'competition_ended'
  | 'attempt_order_update';

export interface AthleteUpEvent {
  type: 'athlete_up';
  data: {
    athlete_id: string;
    athlete_name: string;
    weight_kg: number;
    attempt_number: 1 | 2 | 3;
    lift_type: 'squat' | 'bench' | 'deadlift';
    lot_number?: number;
    rack_height?: number;
    safety_height?: number;
  };
}

export interface AttemptResultEvent {
  type: 'attempt_result';
  data: {
    athlete_id: string;
    athlete_name: string;
    weight_kg: number;
    attempt_number: 1 | 2 | 3;
    lift_type: 'squat' | 'bench' | 'deadlift';
    result: 'success' | 'failure';
    referee_votes: [boolean, boolean, boolean];
  };
}

export interface TimerUpdateEvent {
  type: 'timer_update';
  data: {
    seconds_remaining: number;
    is_running: boolean;
    is_warning: boolean; // true when < 30 seconds
  };
}

export interface LiftChangedEvent {
  type: 'lift_changed';
  data: {
    lift_type: 'squat' | 'bench' | 'deadlift';
  };
}

export interface CompetitionStartedEvent {
  type: 'competition_started';
  data: {
    competition_id: string;
    competition_name: string;
    lift_type: 'squat' | 'bench' | 'deadlift';
  };
}

export interface CompetitionPausedEvent {
  type: 'competition_paused';
  data: {
    competition_id: string;
  };
}

export interface CompetitionEndedEvent {
  type: 'competition_ended';
  data: {
    competition_id: string;
  };
}

export interface AttemptOrderUpdateEvent {
  type: 'attempt_order_update';
  data: {
    attempt_order: Array<{
      athlete_id: string;
      athlete_name: string;
      weight_kg: number;
      attempt_number: 1 | 2 | 3;
      lot_number?: number;
    }>;
    current_index: number;
  };
}

export type WebSocketEvent =
  | AthleteUpEvent
  | AttemptResultEvent
  | TimerUpdateEvent
  | LiftChangedEvent
  | CompetitionStartedEvent
  | CompetitionPausedEvent
  | CompetitionEndedEvent
  | AttemptOrderUpdateEvent;

export interface WebSocketMessage {
  timestamp: string;
  event: WebSocketEvent;
}

export interface WebSocketConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}
