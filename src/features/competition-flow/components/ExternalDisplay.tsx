import { useEffect, useState } from 'react';
import { useBroadcastStore } from '../stores/broadcastStore';
import { WebSocketEvent } from '../../../shared/types/websocket';
import { Card, Tag, Space, Typography } from 'antd';
import {
  TrophyOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export const ExternalDisplay = () => {
  const { currentEvent, subscribe } = useBroadcastStore();
  const [currentAthlete, setCurrentAthlete] = useState<string>('');
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [currentAttempt, setCurrentAttempt] = useState<1 | 2 | 3>(1);
  const [currentLift, setCurrentLift] = useState<string>('SQUAT');
  const [lastResult, setLastResult] = useState<'success' | 'failure' | null>(null);
  const [competitionName, setCompetitionName] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Subscribe to broadcast events
    const unsubscribe = subscribe((event: WebSocketEvent) => {
      console.log('[ExternalDisplay] Received event:', event.type);

      switch (event.type) {
        case 'competition_started':
          setCompetitionName(event.data.competition_name);
          setCurrentLift(event.data.lift_type.toUpperCase());
          setIsPaused(false);
          setLastResult(null);
          break;

        case 'competition_paused':
          setIsPaused(true);
          break;

        case 'athlete_up':
          setCurrentAthlete(event.data.athlete_name);
          setCurrentWeight(event.data.weight_kg);
          setCurrentAttempt(event.data.attempt_number);
          setLastResult(null);
          setIsPaused(false);
          break;

        case 'attempt_result':
          setLastResult(event.data.result);
          break;

        case 'lift_changed':
          setCurrentLift(event.data.lift_type.toUpperCase());
          setLastResult(null);
          break;

        case 'competition_ended':
          setLastResult(null);
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  // Initialize from current event if available
  useEffect(() => {
    if (currentEvent) {
      if (currentEvent.type === 'athlete_up') {
        setCurrentAthlete(currentEvent.data.athlete_name);
        setCurrentWeight(currentEvent.data.weight_kg);
        setCurrentAttempt(currentEvent.data.attempt_number);
        setCurrentLift(currentEvent.data.lift_type.toUpperCase());
      }
    }
  }, [currentEvent]);

  const getLiftColor = (lift: string) => {
    switch (lift) {
      case 'SQUAT':
        return '#1890ff';
      case 'BENCH':
        return '#52c41a';
      case 'DEADLIFT':
        return '#f5222d';
      default:
        return '#1890ff';
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        color: 'white',
      }}
    >
      {/* Competition Header */}
      {competitionName && (
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            <TrophyOutlined /> {competitionName}
          </Title>
        </div>
      )}

      {/* Status Indicators */}
      {isPaused && (
        <Card
          style={{
            marginBottom: 40,
            background: '#faad14',
            border: 'none',
            textAlign: 'center',
          }}
        >
          <Title level={3} style={{ margin: 0, color: 'white' }}>
            <ClockCircleOutlined /> PAUSED
          </Title>
        </Card>
      )}

      {/* Current Lift */}
      <div
        style={{
          background: getLiftColor(currentLift),
          padding: '20px 60px',
          borderRadius: 12,
          marginBottom: 40,
        }}
      >
        <Title level={1} style={{ color: 'white', margin: 0, fontSize: 60 }}>
          {currentLift}
        </Title>
      </div>

      {/* Current Athlete */}
      {currentAthlete && (
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 16,
            minWidth: 600,
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}
          styles={{ body: { padding: 40 } }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Athlete Name */}
            <div>
              <Text type="secondary">ATHLETE</Text>
              <Title level={1} style={{ margin: 0, marginTop: 8 }}>
                {currentAthlete}
              </Title>
            </div>

            {/* Weight */}
            <div>
              <Text type="secondary">WEIGHT</Text>
              <Title
                level={1}
                style={{
                  margin: 0,
                  marginTop: 8,
                  fontSize: 96,
                  fontFamily: 'monospace',
                  color: getLiftColor(currentLift),
                }}
              >
                {currentWeight} kg
              </Title>
            </div>

            {/* Attempt Number */}
            <Tag color="blue" style={{ fontSize: 20, padding: '8px 24px' }}>
              ATTEMPT #{currentAttempt}
            </Tag>

            {/* Last Result */}
            {lastResult && (
              <div style={{ marginTop: 20 }}>
                {lastResult === 'success' ? (
                  <div>
                    <CheckCircleFilled
                      style={{ fontSize: 80, color: '#52c41a' }}
                    />
                    <Title level={2} style={{ color: '#52c41a', marginTop: 16 }}>
                      GOOD LIFT ✓
                    </Title>
                  </div>
                ) : (
                  <div>
                    <CloseCircleFilled
                      style={{ fontSize: 80, color: '#ff4d4f' }}
                    />
                    <Title level={2} style={{ color: '#ff4d4f', marginTop: 16 }}>
                      NO LIFT ✗
                    </Title>
                  </div>
                )}
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* No data message */}
      {!currentAthlete && !isPaused && (
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 16,
            minWidth: 600,
            textAlign: 'center',
          }}
        >
          <Title level={3}>Waiting for competition to start...</Title>
          <Text>
            Navigate to Live Competition and click Start to begin broadcasting.
          </Text>
        </Card>
      )}
    </div>
  );
};
