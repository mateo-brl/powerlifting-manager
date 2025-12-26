import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { WebSocketEvent } from '../../../shared/types/websocket';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { Card, Tag, Space, Typography } from 'antd';
import {
  TrophyOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useThemeColors } from '../../../theme/useThemeColors';

const { Title, Text } = Typography;

// Check if we're in browser mode (not Tauri)
const isBrowserMode = () => {
  return !(window as any).__TAURI__;
};

export const ExternalDisplay = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [currentAthlete, setCurrentAthlete] = useState<string>('');
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [currentAttempt, setCurrentAttempt] = useState<1 | 2 | 3>(1);
  const [currentLift, setCurrentLift] = useState<string>('SQUAT');
  const [lastResult, setLastResult] = useState<'success' | 'failure' | null>(null);
  const [competitionName, setCompetitionName] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'websocket' | 'broadcast' | 'disconnected'>('disconnected');
  const [showConnectionStatus, setShowConnectionStatus] = useState(true);

  // Handler for processing events (useCallback to avoid closure issues)
  const handleEvent = useCallback((event: WebSocketEvent) => {
    

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

      case 'timer_update':
        setTimerSeconds(event.data.seconds_remaining);
        setTimerRunning(event.data.is_running);
        break;
    }
  }, []);

  // WebSocket connection (for Tauri mode)
  const { status } = useWebSocket(
    isBrowserMode() ? null : 'ws://127.0.0.1:9001',
    {
      onMessage: handleEvent,
      onConnect: () => {
        
        setConnectionMode('websocket');
      },
      onDisconnect: () => {
        
        if (!isBrowserMode()) {
          setConnectionMode('disconnected');
        }
      },
    }
  );

  // BroadcastChannel listener (for browser mode)
  useEffect(() => {
    if (!isBrowserMode()) return;

    const channel = new BroadcastChannel('powerlifting-broadcast');
    setConnectionMode('broadcast');
    

    channel.onmessage = (event) => {
      
      handleEvent(event.data as WebSocketEvent);
    };

    return () => {
      channel.close();
    };
  }, [handleEvent]);

  // Hide connection status after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnectionStatus(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

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

      {/* Connection Status */}
      {showConnectionStatus && connectionMode === 'broadcast' && (
        <Card
          style={{
            marginBottom: 20,
            background: colors.successBg,
            border: `2px solid ${colors.successBorder}`,
            textAlign: 'center',
          }}
        >
          <Text style={{ color: colors.successText, fontWeight: 'bold' }}>
            ✓ {t('common.loading')} (Browser Mode - BroadcastChannel)
          </Text>
        </Card>
      )}
      {showConnectionStatus && connectionMode === 'websocket' && (
        <Card
          style={{
            marginBottom: 20,
            background: colors.successBg,
            border: `2px solid ${colors.successBorder}`,
            textAlign: 'center',
          }}
        >
          <Text style={{ color: colors.successText, fontWeight: 'bold' }}>
            ✓ {t('common.loading')} (Tauri Mode - WebSocket)
          </Text>
        </Card>
      )}
      {connectionMode === 'disconnected' && (
        <Card
          style={{
            marginBottom: 20,
            background: colors.errorBg,
            border: 'none',
            textAlign: 'center',
          }}
        >
          <Text style={{ color: colors.errorText }}>
            <ClockCircleOutlined /> {t('common.loading')}... ({status})
          </Text>
        </Card>
      )}

      {/* Timer Display */}
      {timerRunning && (
        <div
          style={{
            marginBottom: 30,
            padding: '20px 40px',
            background: timerSeconds <= 10 ? colors.errorBg : timerSeconds <= 30 ? colors.warningBg : colors.successBg,
            border: timerSeconds <= 10 ? `2px solid ${colors.errorBorder}` : timerSeconds <= 30 ? `2px solid ${colors.warningBorder}` : `2px solid ${colors.successBorder}`,
            borderRadius: 12,
            textAlign: 'center',
          }}
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          <div style={{ fontSize: 18, color: timerSeconds <= 10 ? colors.errorText : timerSeconds <= 30 ? colors.warningText : colors.successText, marginBottom: 8, opacity: 0.9 }}>
            {t('externalDisplay.timer').toUpperCase()}
          </div>
          <div
            style={{ fontSize: 72, fontWeight: 'bold', color: timerSeconds <= 10 ? colors.errorText : timerSeconds <= 30 ? colors.warningText : colors.successText, fontFamily: 'monospace' }}
            aria-label={t('externalDisplay.ariaTimerSeconds', { seconds: timerSeconds })}
          >
            {timerSeconds}s
          </div>
        </div>
      )}

      {/* Status Indicators */}
      {isPaused && (
        <Card
          style={{
            marginBottom: 40,
            background: colors.warningBg,
            border: `2px solid ${colors.warningBorder}`,
            textAlign: 'center',
          }}
        >
          <Title level={3} style={{ margin: 0, color: colors.warningText }}>
            <ClockCircleOutlined /> {t('live.status.paused')}
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
              <Text type="secondary">{t('externalDisplay.currentAthlete')}</Text>
              <Title level={1} style={{ margin: 0, marginTop: 8 }}>
                {currentAthlete}
              </Title>
            </div>

            {/* Weight */}
            <div>
              <Text type="secondary">{t('externalDisplay.weight')}</Text>
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
              {t('externalDisplay.attempt').toUpperCase()} #{currentAttempt}
            </Tag>

            {/* Last Result */}
            {lastResult && (
              <div style={{ marginTop: 20 }}>
                {lastResult === 'success' ? (
                  <div>
                    <div style={{
                      display: 'inline-block',
                      background: colors.successBg,
                      borderRadius: '50%',
                      padding: '20px',
                      border: `4px solid ${colors.successBorder}`
                    }}>
                      <CheckCircleFilled
                        style={{ fontSize: 80, color: colors.successBorder }}
                      />
                    </div>
                    <Title level={2} style={{ color: colors.textPrimary, marginTop: 16 }}>
                      {t('externalDisplay.goodLift').toUpperCase()} ✓
                    </Title>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'inline-block',
                      background: colors.errorBg,
                      borderRadius: '50%',
                      padding: '20px'
                    }}>
                      <CloseCircleFilled
                        style={{ fontSize: 80, color: colors.errorText }}
                      />
                    </div>
                    <Title level={2} style={{ color: colors.errorBorder, marginTop: 16 }}>
                      {t('externalDisplay.noLift').toUpperCase()} ✗
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
          <Title level={3}>{t('externalDisplay.waitingForCompetition')}</Title>
          <Text>
            {t('externalDisplay.waitingForCompetition')}
          </Text>
        </Card>
      )}
    </div>
  );
};
