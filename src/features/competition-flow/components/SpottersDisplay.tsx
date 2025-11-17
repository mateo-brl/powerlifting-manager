import { useEffect, useState, useCallback } from 'react';
import { Card, Typography, Space, Tag, Alert, Spin } from 'antd';
import { WebSocketEvent } from '../../../shared/types/websocket';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { calculateBarLoading, getLoadingOrder, BAR_WEIGHTS, TOTAL_COLLAR_WEIGHT } from '../utils/barLoading';
import type { LiftType } from '../types';

const { Title, Text } = Typography;

// Check if we're in browser mode (not Tauri)
const isBrowserMode = () => {
  return !(window as any).__TAURI__;
};

interface CurrentAthleteData {
  athlete_name: string;
  weight_kg: number;
  attempt_number: number;
  lift_type: LiftType;
  lot_number?: number;
  rack_height?: number;
  safety_height?: number;
}

export const SpottersDisplay = () => {
  const [currentAthlete, setCurrentAthlete] = useState<CurrentAthleteData | null>(null);
  const [competitionName, setCompetitionName] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // Handler for processing events (useCallback to avoid closure issues)
  const handleEvent = useCallback((event: WebSocketEvent) => {
    console.log('[SpottersDisplay] Received event:', event.type);

    if (event.type === 'competition_started') {
      setCompetitionName(event.data.competition_name);
      setIsConnected(true);
    }

    if (event.type === 'athlete_up') {
      setCurrentAthlete({
        athlete_name: event.data.athlete_name,
        weight_kg: event.data.weight_kg,
        attempt_number: event.data.attempt_number,
        lift_type: event.data.lift_type,
        lot_number: event.data.lot_number,
        rack_height: event.data.rack_height,
        safety_height: event.data.safety_height,
      });
      setIsConnected(true);
    }

    if (event.type === 'competition_paused' || event.type === 'competition_ended') {
      setIsConnected(false);
    }
  }, []);

  // WebSocket connection (for Tauri mode)
  const { status } = useWebSocket(
    isBrowserMode() ? null : 'ws://127.0.0.1:9001',
    {
      onMessage: handleEvent,
      onConnect: () => {
        console.log('[SpottersDisplay] Connected to WebSocket server');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('[SpottersDisplay] Disconnected from WebSocket server');
        if (!isBrowserMode()) {
          setIsConnected(false);
        }
      },
    }
  );

  // BroadcastChannel listener (for browser mode)
  useEffect(() => {
    if (!isBrowserMode()) return;

    const channel = new BroadcastChannel('powerlifting-broadcast');
    console.log('[SpottersDisplay] Using BroadcastChannel for browser mode');

    channel.onmessage = (event) => {
      console.log('[SpottersDisplay] BroadcastChannel received:', event.data);
      handleEvent(event.data as WebSocketEvent);
    };

    return () => {
      channel.close();
    };
  }, [handleEvent]);

  if (!currentAthlete) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <Title level={2} style={{ margin: '16px 0 0 0' }}>
            SPOTTERS DISPLAY
          </Title>
          <Text style={{ fontSize: 18 }}>
            Waiting for competition to start...
          </Text>
        </div>
      </div>
    );
  }

  // IPF uses 20kg bars for both men and women
  const barWeight = BAR_WEIGHTS.men; // 20kg standard
  const barLoading = calculateBarLoading(currentAthlete.weight_kg, barWeight);
  const loadingOrder = getLoadingOrder(barLoading);

  // Get lift name
  const getLiftName = () => {
    switch (currentAthlete.lift_type) {
      case 'squat': return 'SQUAT';
      case 'bench': return 'BENCH PRESS';
      case 'deadlift': return 'DEADLIFT';
      default: return '';
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        background: 'white',
        padding: '20px 40px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        borderBottom: '3px solid black',
        paddingBottom: '10px',
        marginBottom: '15px'
      }}>
        <Title level={1} style={{ margin: 0, fontSize: 32 }}>
          SPOTTERS DISPLAY
        </Title>
        {competitionName && (
          <Text style={{ fontSize: 14, color: '#666' }}>
            {competitionName}
          </Text>
        )}
      </div>

      {/* Athlete Info - Simple Table Format */}
      <div style={{
        marginBottom: '15px',
        border: '2px solid black',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '2px solid black' }}>
              <td style={{
                padding: '12px 20px',
                fontSize: 18,
                fontWeight: 'bold',
                width: '25%',
                background: '#f0f0f0'
              }}>
                ATHLETE
              </td>
              <td style={{
                padding: '12px 20px',
                fontSize: 24,
                fontWeight: 'bold'
              }}>
                {currentAthlete.athlete_name}
              </td>
            </tr>
            <tr style={{ borderBottom: '2px solid black' }}>
              <td style={{
                padding: '12px 20px',
                fontSize: 18,
                fontWeight: 'bold',
                background: '#f0f0f0'
              }}>
                LIFT
              </td>
              <td style={{
                padding: '12px 20px',
                fontSize: 20,
                fontWeight: 'bold'
              }}>
                {getLiftName()} - Attempt #{currentAthlete.attempt_number}
                {currentAthlete.lot_number && ` (Lot ${currentAthlete.lot_number})`}
              </td>
            </tr>
            <tr>
              <td style={{
                padding: '12px 20px',
                fontSize: 18,
                fontWeight: 'bold',
                background: '#f0f0f0'
              }}>
                WEIGHT
              </td>
              <td style={{
                padding: '12px 20px',
                fontSize: 36,
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}>
                {currentAthlete.weight_kg} kg
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rack Heights - Prominent Display */}
      {(currentAthlete.rack_height || currentAthlete.safety_height) && (
        <div style={{
          marginBottom: '15px',
          padding: '15px 20px',
          background: 'white',
          color: 'black',
          border: '3px solid #000',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 16, marginBottom: 8, fontWeight: 'bold', color: '#d48806' }}>
            {getLiftName() === 'SQUAT' && 'SQUAT RACK HEIGHT'}
            {getLiftName() === 'BENCH PRESS' && 'BENCH RACK SETTINGS'}
            {getLiftName() === 'DEADLIFT' && 'RACK HEIGHT'}
          </div>
          <div style={{ fontSize: 32, fontWeight: 'bold', fontFamily: 'monospace' }}>
            {getLiftName() === 'SQUAT' && currentAthlete.rack_height}
            {getLiftName() === 'BENCH PRESS' && (
              <>
                {currentAthlete.rack_height && (
                  <span>RACK: {currentAthlete.rack_height}</span>
                )}
                {currentAthlete.rack_height && currentAthlete.safety_height && (
                  <span style={{ margin: '0 15px' }}>|</span>
                )}
                {currentAthlete.safety_height && (
                  <span>SAFETY: {currentAthlete.safety_height}</span>
                )}
              </>
            )}
            {getLiftName() === 'DEADLIFT' && (currentAthlete.rack_height || 'N/A')}
          </div>
        </div>
      )}

      {/* Bar Loading - Simple List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Title level={2} style={{ margin: '0 0 10px 0', fontSize: 22 }}>
          BAR LOADING ({barWeight}kg bar)
        </Title>

        {/* Plate List */}
        <div style={{ marginBottom: '15px', flex: '0 0 auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '2px solid black'
          }}>
            <thead>
              <tr style={{ background: '#f0f0f0', borderBottom: '2px solid black' }}>
                <th style={{ padding: '8px 12px', fontSize: 14, textAlign: 'left' }}>QUANTITY</th>
                <th style={{ padding: '8px 12px', fontSize: 14, textAlign: 'left' }}>PLATE WEIGHT</th>
                <th style={{ padding: '8px 12px', fontSize: 14, textAlign: 'left' }}>COLOR</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrder.map((plate, index) => (
                <tr key={index} style={{ borderBottom: index < loadingOrder.length - 1 ? '1px solid #ddd' : 'none' }}>
                  <td style={{ padding: '10px 12px', fontSize: 20, fontWeight: 'bold' }}>
                    {plate.count}x
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 22, fontWeight: 'bold' }}>
                    {plate.weight} kg
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{
                      width: 60,
                      height: 30,
                      background: plate.color,
                      border: '2px solid black',
                      borderRadius: 4
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual Bar Diagram */}
        <div style={{ flex: '0 0 auto' }}>
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            BAR LOADING (each side):
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {/* Left side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {/* Plates (reversed order for left side) */}
              {[...loadingOrder].reverse().map((plate, index) => {
                const plateHeight = Math.min(65, 30 + plate.weight * 1.5);
                return (
                  <div key={index} style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: plate.count }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 18,
                          height: plateHeight,
                          background: plate.color,
                          border: '2px solid black',
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                );
              })}

              {/* Collar */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 18,
                    height: 50,
                    background: '#666',
                    border: '2px solid black',
                    borderRadius: 3,
                  }}
                />
                <Text style={{ fontSize: 11, display: 'block', marginTop: 2, fontWeight: 'bold' }}>C</Text>
              </div>
            </div>

            {/* Bar center */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 20,
                  background: '#333',
                  border: '2px solid black',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 10, color: 'white', fontWeight: 'bold' }}>BAR</Text>
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {/* Collar */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 18,
                    height: 50,
                    background: '#666',
                    border: '2px solid black',
                    borderRadius: 3,
                  }}
                />
                <Text style={{ fontSize: 11, display: 'block', marginTop: 2, fontWeight: 'bold' }}>C</Text>
              </div>

              {/* Plates */}
              {loadingOrder.map((plate, index) => {
                const plateHeight = Math.min(65, 30 + plate.weight * 1.5);
                return (
                  <div key={index} style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: plate.count }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 18,
                          height: plateHeight,
                          background: plate.color,
                          border: '2px solid black',
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginTop: 12, padding: '10px', background: '#f0f0f0', border: '2px solid black', borderRadius: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              {barLoading.totalPlates} plates per side | Bar: {barWeight}kg + Collars: {TOTAL_COLLAR_WEIGHT}kg + Plates: {barLoading.platePerSide}kg × 2 = <strong>{barLoading.actualWeight}kg</strong>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};
