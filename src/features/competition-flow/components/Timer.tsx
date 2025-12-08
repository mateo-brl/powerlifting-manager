import { useState, useEffect, useRef } from 'react';
import { Button, Card, Progress } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useBroadcastStore } from '../stores/broadcastStore';

const TOTAL_TIME = 60; // 60 seconds
const ALERT_TIMES = [30, 15, 10]; // Alert at these times

interface TimerProps {
  onComplete?: () => void;
}

export const Timer = ({ onComplete }: TimerProps) => {
  const { t } = useTranslation();
  const { broadcast } = useBroadcastStore();
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const broadcastRef = useRef(broadcast);

  // Keep refs up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
    broadcastRef.current = broadcast;
  }, [onComplete, broadcast]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            return prev;
          }

          const newTime = prev - 1;

          // Broadcast timer update
          broadcastRef.current({
            type: 'timer_update',
            data: {
              seconds_remaining: newTime,
              is_running: true,
              is_warning: newTime <= 30,
            },
          });

          // Play sound at alert times
          if (ALERT_TIMES.includes(newTime)) {
            playBeep();
          }

          // Time's up
          if (newTime === 0) {
            playLongBeep();
            setIsRunning(false);
            onCompleteRef.current?.();
          }

          return newTime;
        });
      }, 1000);
    } else {
      // Clear interval when paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const playBeep = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playLongBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  };

  const handleStart = () => {
    setIsRunning(true);
    setHasStarted(true);

    // Broadcast timer started
    broadcast({
      type: 'timer_update',
      data: {
        seconds_remaining: timeLeft,
        is_running: true,
        is_warning: timeLeft <= 30,
      },
    });
  };

  const handlePause = () => {
    setIsRunning(false);

    // Broadcast timer paused
    broadcast({
      type: 'timer_update',
      data: {
        seconds_remaining: timeLeft,
        is_running: false,
        is_warning: timeLeft <= 30,
      },
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_TIME);
    setHasStarted(false);

    // Broadcast timer reset
    broadcast({
      type: 'timer_update',
      data: {
        seconds_remaining: TOTAL_TIME,
        is_running: false,
        is_warning: false,
      },
    });
  };

  const percentage = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;
  const getColor = () => {
    if (timeLeft <= 10) return '#ff4d4f';
    if (timeLeft <= 30) return '#faad14';
    return '#52c41a';
  };

  return (
    <Card style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 72,
          fontWeight: 'bold',
          color: getColor(),
          fontFamily: 'monospace',
          marginBottom: 16,
        }}>
          {timeLeft}s
        </div>

        <Progress
          percent={percentage}
          strokeColor={getColor()}
          showInfo={false}
          strokeWidth={12}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {!isRunning ? (
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleStart}
            disabled={timeLeft === 0}
          >
            {hasStarted ? t('live.resume') : t('live.timer.start')}
          </Button>
        ) : (
          <Button
            size="large"
            icon={<PauseCircleOutlined />}
            onClick={handlePause}
          >
            {t('live.pause')}
          </Button>
        )}

        <Button
          size="large"
          icon={<ReloadOutlined />}
          onClick={handleReset}
        >
          {t('live.timer.reset')}
        </Button>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>
        {t('live.timer.timeUp')}: 30s, 15s, 10s
      </div>
    </Card>
  );
};
