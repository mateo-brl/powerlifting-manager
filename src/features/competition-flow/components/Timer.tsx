import { useState, useEffect, useRef } from 'react';
import { Button, Card, Progress } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';

const TOTAL_TIME = 60; // 60 seconds
const ALERT_TIMES = [30, 15, 10]; // Alert at these times

interface TimerProps {
  onComplete?: () => void;
}

export const Timer = ({ onComplete }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;

          // Play sound at alert times
          if (ALERT_TIMES.includes(newTime)) {
            playBeep();
          }

          // Time's up
          if (newTime === 0) {
            playLongBeep();
            setIsRunning(false);
            onComplete?.();
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

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
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_TIME);
    setHasStarted(false);
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
          size={[undefined, 12]}
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
            {hasStarted ? 'Resume' : 'Start'}
          </Button>
        ) : (
          <Button
            size="large"
            icon={<PauseCircleOutlined />}
            onClick={handlePause}
          >
            Pause
          </Button>
        )}

        <Button
          size="large"
          icon={<ReloadOutlined />}
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>
        Alerts at: 30s, 15s, 10s
      </div>
    </Card>
  );
};
