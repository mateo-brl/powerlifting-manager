import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Select, Button, Row, Col, message, Tabs, Space, Typography, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import { useAttemptStore } from '../stores/attemptStore';
import { calculateAttemptOrder } from '../utils/attemptOrdering';
import { AttemptOrderList } from './AttemptOrderList';
import { AttemptTracker } from './AttemptTracker';
import { Timer } from './Timer';
import { LiftType } from '../types';
import { AttemptOrder } from '../../weigh-in/types';

const { Title } = Typography;

export const LiveCompetition = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { athletes, loadAthletes } = useAthleteStore();
  const { weighIns, loadWeighIns } = useWeighInStore();
  const { attempts, loadAttempts } = useAttemptStore();

  const [currentLift, setCurrentLift] = useState<LiftType>('squat');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [attemptOrder, setAttemptOrder] = useState<AttemptOrder[]>([]);
  const [isCompetitionActive, setIsCompetitionActive] = useState(false);

  useEffect(() => {
    if (competitionId) {
      loadAthletes(competitionId);
      loadWeighIns(competitionId);
      loadAttempts(competitionId);
    }
  }, [competitionId]);

  const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);
  const competitionWeighIns = weighIns.filter(w => w.competition_id === competitionId);

  // Calculate attempt order when lift type changes or new attempts are made
  useEffect(() => {
    if (competitionWeighIns.length === 0) return;

    // Get all athletes who haven't completed this lift
    const athletesForLift = competitionAthletes.filter(athlete => {
      const athleteAttempts = attempts.filter(
        a => a.athlete_id === athlete.id && a.lift_type === currentLift
      );
      return athleteAttempts.length < 3; // Still has attempts remaining
    });

    // Create attempt data
    const attemptData = athletesForLift.map(athlete => {
      const weighIn = competitionWeighIns.find(w => w.athlete_id === athlete.id);
      const athleteAttempts = attempts.filter(
        a => a.athlete_id === athlete.id && a.lift_type === currentLift
      );

      const attemptNumber = (athleteAttempts.length + 1) as 1 | 2 | 3;

      // Determine weight for next attempt
      let weight: number;
      if (attemptNumber === 1) {
        // Opening attempt
        weight = weighIn?.[`opening_${currentLift}` as keyof typeof weighIn] as number || 40;
      } else {
        // Find the last successful attempt or the last attempt
        const lastSuccessful = [...athleteAttempts]
          .filter(a => a.result === 'success')
          .sort((a, b) => b.weight_kg - a.weight_kg)[0];

        if (lastSuccessful) {
          weight = lastSuccessful.weight_kg + 2.5; // Add minimum increment
        } else {
          // Last attempt failed, keep same weight or add increment
          const lastAttempt = athleteAttempts[athleteAttempts.length - 1];
          weight = lastAttempt.weight_kg;
        }
      }

      return {
        athlete_id: athlete.id,
        attempt_number: attemptNumber,
        weight_kg: weight,
      };
    });

    const ordered = calculateAttemptOrder(attemptData, competitionAthletes);
    setAttemptOrder(ordered);

    // Reset index if we're past the end
    if (currentIndex >= ordered.length) {
      setCurrentIndex(0);
    }
  }, [currentLift, attempts, competitionAthletes, competitionWeighIns, currentIndex]);

  const handleStartCompetition = () => {
    if (attemptOrder.length === 0) {
      message.warning('No athletes ready for this lift');
      return;
    }
    setIsCompetitionActive(true);
    message.success(`Competition started - ${currentLift.toUpperCase()}`);
  };

  const handlePauseCompetition = () => {
    setIsCompetitionActive(false);
    message.info('Competition paused');
  };

  const handleNextAttempt = () => {
    if (currentIndex < attemptOrder.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      message.info('All attempts completed for this lift');
      setIsCompetitionActive(false);
    }
  };

  const handleChangeLift = (newLift: LiftType) => {
    setCurrentLift(newLift);
    setCurrentIndex(0);
    setIsCompetitionActive(false);
    message.info(`Switched to ${newLift.toUpperCase()}`);
  };

  const currentAttempt = attemptOrder[currentIndex];
  const hasAttempts = attemptOrder.length > 0;

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>Live Competition Management</Title>
            <Space>
              <Select
                value={currentLift}
                onChange={handleChangeLift}
                style={{ width: 150 }}
                size="large"
                disabled={isCompetitionActive}
                options={[
                  { value: 'squat', label: 'Squat' },
                  { value: 'bench', label: 'Bench Press' },
                  { value: 'deadlift', label: 'Deadlift' },
                ]}
              />
              {!isCompetitionActive ? (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartCompetition}
                  size="large"
                  disabled={!hasAttempts}
                >
                  Start
                </Button>
              ) : (
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={handlePauseCompetition}
                  size="large"
                >
                  Pause
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {competitionWeighIns.length === 0 && (
          <Alert
            message="No Weigh-Ins"
            description="No athletes have been weighed in yet. Please complete weigh-ins before starting the competition."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {hasAttempts && (
          <Row gutter={24}>
            <Col span={16}>
              <Tabs
                defaultActiveKey="tracker"
                items={[
                  {
                    key: 'tracker',
                    label: 'Attempt Tracker',
                    children: currentAttempt && competitionId ? (
                      <AttemptTracker
                        currentAttempt={currentAttempt}
                        liftType={currentLift}
                        competitionId={competitionId}
                        onComplete={handleNextAttempt}
                      />
                    ) : (
                      <Alert
                        message="No Current Attempt"
                        description="All attempts for this lift have been completed."
                        type="info"
                      />
                    ),
                  },
                  {
                    key: 'order',
                    label: 'Attempt Order',
                    children: (
                      <AttemptOrderList
                        attempts={attemptOrder}
                        currentIndex={currentIndex}
                        liftType={currentLift}
                      />
                    ),
                  },
                ]}
              />
            </Col>

            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Timer */}
                <Timer onComplete={() => message.warning('Time is up!')} />

                {/* Competition Info */}
                <Card title="Competition Status" size="small">
                  <p>
                    <strong>Current Lift:</strong> {currentLift.toUpperCase()}
                  </p>
                  <p>
                    <strong>Attempt:</strong> {currentIndex + 1} / {attemptOrder.length}
                  </p>
                  <p>
                    <strong>Athletes:</strong> {competitionAthletes.length}
                  </p>
                  <p>
                    <strong>Weighed In:</strong> {competitionWeighIns.length}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {isCompetitionActive ? (
                      <span style={{ color: '#52c41a', fontWeight: 'bold' }}>● ACTIVE</span>
                    ) : (
                      <span style={{ color: '#faad14' }}>● PAUSED</span>
                    )}
                  </p>
                </Card>

                {/* Quick Actions */}
                <Card title="Quick Actions" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setCurrentIndex(0);
                        message.success('Reset to first attempt');
                      }}
                      block
                    >
                      Reset to Start
                    </Button>
                    <Button
                      onClick={handleNextAttempt}
                      disabled={!isCompetitionActive}
                      block
                    >
                      Skip to Next Attempt
                    </Button>
                  </Space>
                </Card>
              </Space>
            </Col>
          </Row>
        )}

        {!hasAttempts && competitionWeighIns.length > 0 && (
          <Alert
            message="All Attempts Completed"
            description={`All athletes have completed their ${currentLift} attempts. Switch to the next lift to continue.`}
            type="success"
            showIcon
          />
        )}
      </Card>
    </div>
  );
};
