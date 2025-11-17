import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Select, Button, Row, Col, message, Tabs, Space, Typography, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, ArrowLeftOutlined, DesktopOutlined, TeamOutlined, FileTextOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import { useAttemptStore } from '../stores/attemptStore';
import { useBroadcastStore } from '../stores/broadcastStore';
import { calculateAttemptOrder } from '../utils/attemptOrdering';
import { AttemptOrderList } from './AttemptOrderList';
import { AttemptTracker } from './AttemptTracker';
import { Timer } from './Timer';
import { LiftType } from '../types';
import { AttemptOrder } from '../../weigh-in/types';
import { useCompetitionStore } from '../../competition/stores/competitionStore';

const { Title, Text } = Typography;

export const LiveCompetition = () => {
  const { t } = useTranslation();
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { athletes, loadAthletes } = useAthleteStore();
  const { weighIns, loadWeighIns } = useWeighInStore();
  const { attempts, loadAttempts } = useAttemptStore();
  const { broadcast } = useBroadcastStore();
  const { competitions } = useCompetitionStore();

  // Get competition and its format
  const competition = competitions.find(c => c.id === competitionId);
  const competitionFormat = competition?.format || 'full_power';

  // Set initial lift based on format
  const getInitialLift = (): LiftType => {
    if (competitionFormat === 'bench_only') return 'bench';
    return 'squat';
  };

  const [currentLift, setCurrentLift] = useState<LiftType>(getInitialLift());
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

    // Enrich with weigh-in data (rack heights)
    const enrichedOrdered = ordered.map(attempt => {
      const weighIn = competitionWeighIns.find(w => w.athlete_id === attempt.athlete_id);
      return {
        ...attempt,
        rack_height: currentLift === 'squat' ? weighIn?.squat_rack_height :
                    currentLift === 'bench' ? weighIn?.bench_rack_height : undefined,
        safety_height: currentLift === 'bench' ? weighIn?.bench_safety_height : undefined,
      };
    });

    setAttemptOrder(enrichedOrdered);

    // Reset index if we're past the end
    if (currentIndex >= ordered.length) {
      setCurrentIndex(0);
    }
  }, [currentLift, attempts, competitionAthletes, competitionWeighIns, currentIndex]);

  const handleStartCompetition = () => {
    if (attemptOrder.length === 0) {
      message.warning(t('live.messages.noAthletes'));
      return;
    }
    setIsCompetitionActive(true);
    message.success(t('live.messages.started', { lift: currentLift.toUpperCase() }));

    // Broadcast competition started event
    const competition = competitions.find(c => c.id === competitionId);
    if (competition) {
      broadcast({
        type: 'competition_started',
        data: {
          competition_id: competitionId || '',
          competition_name: competition.name,
          lift_type: currentLift,
        },
      });
    }

    // Broadcast current athlete up
    if (attemptOrder[currentIndex]) {
      const currentAttempt = attemptOrder[currentIndex];
      broadcast({
        type: 'athlete_up',
        data: {
          athlete_id: currentAttempt.athlete_id,
          athlete_name: currentAttempt.athlete_name,
          weight_kg: currentAttempt.weight_kg,
          attempt_number: currentAttempt.attempt_number,
          lift_type: currentLift,
          lot_number: currentAttempt.lot_number,
          rack_height: currentAttempt.rack_height,
          safety_height: currentAttempt.safety_height,
        },
      });

      // Broadcast initial attempt order for warmup display
      broadcast({
        type: 'attempt_order_update',
        data: {
          attempt_order: attemptOrder.map(a => ({
            athlete_id: a.athlete_id,
            athlete_name: a.athlete_name,
            weight_kg: a.weight_kg,
            attempt_number: a.attempt_number,
            lot_number: a.lot_number,
          })),
          current_index: currentIndex,
        },
      });
    }
  };

  const handlePauseCompetition = () => {
    setIsCompetitionActive(false);
    message.info(t('live.messages.paused'));

    // Broadcast pause event
    broadcast({
      type: 'competition_paused',
      data: {
        competition_id: competitionId || '',
      },
    });
  };

  const handleNextAttempt = () => {
    if (currentIndex < attemptOrder.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Broadcast next athlete up
      const nextAttempt = attemptOrder[nextIndex];
      if (nextAttempt) {
        broadcast({
          type: 'athlete_up',
          data: {
            athlete_id: nextAttempt.athlete_id,
            athlete_name: nextAttempt.athlete_name,
            weight_kg: nextAttempt.weight_kg,
            attempt_number: nextAttempt.attempt_number,
            lift_type: currentLift,
            lot_number: nextAttempt.lot_number,
            rack_height: nextAttempt.rack_height,
            safety_height: nextAttempt.safety_height,
          },
        });

        // Also broadcast updated attempt order with new index for warmup display
        broadcast({
          type: 'attempt_order_update',
          data: {
            attempt_order: attemptOrder.map(a => ({
              athlete_id: a.athlete_id,
              athlete_name: a.athlete_name,
              weight_kg: a.weight_kg,
              attempt_number: a.attempt_number,
              lot_number: a.lot_number,
            })),
            current_index: nextIndex,
          },
        });
      }
    } else {
      message.info(t('live.messages.allAttemptsCompleted'));
      setIsCompetitionActive(false);

      // Broadcast competition ended
      broadcast({
        type: 'competition_ended',
        data: {
          competition_id: competitionId || '',
        },
      });
    }
  };

  const handleChangeLift = (newLift: LiftType) => {
    setCurrentLift(newLift);
    setCurrentIndex(0);
    setIsCompetitionActive(false);
    message.info(t('live.messages.switchLift', { lift: newLift.toUpperCase() }));

    // Broadcast lift changed
    broadcast({
      type: 'lift_changed',
      data: {
        lift_type: newLift,
      },
    });
  };

  const currentAttempt = attemptOrder[currentIndex];
  const hasAttempts = attemptOrder.length > 0;

  const handleOpenExternalDisplay = () => {
    const displayUrl = `${window.location.origin}/display`;
    window.open(displayUrl, 'ExternalDisplay', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
    message.success(t('live.display.opened'));
  };

  const handleOpenSpottersDisplay = () => {
    const spottersUrl = `${window.location.origin}/spotters`;
    window.open(spottersUrl, 'SpottersDisplay', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');

    // Re-broadcast current state for the new window
    setTimeout(() => {
      const competition = competitions.find(c => c.id === competitionId);
      if (competition) {
        console.log('[LiveCompetition] Re-broadcasting state for spotters display');
        console.log('[LiveCompetition] isCompetitionActive:', isCompetitionActive);
        console.log('[LiveCompetition] currentAttempt:', currentAttempt);

        // Always broadcast competition started if we have a competition
        broadcast({
          type: 'competition_started',
          data: {
            competition_id: competitionId || '',
            competition_name: competition.name,
            lift_type: currentLift,
          },
        });

        // Broadcast current athlete if available (regardless of competition status)
        if (currentAttempt) {
          broadcast({
            type: 'athlete_up',
            data: {
              athlete_id: currentAttempt.athlete_id,
              athlete_name: currentAttempt.athlete_name,
              weight_kg: currentAttempt.weight_kg,
              attempt_number: currentAttempt.attempt_number,
              lift_type: currentLift,
              lot_number: currentAttempt.lot_number,
              rack_height: currentAttempt.rack_height,
              safety_height: currentAttempt.safety_height,
            },
          });
        }
      }
    }, 500); // Small delay to ensure new window is ready

    message.success(t('live.display.opened'));
  };

  const handleOpenWarmupDisplay = () => {
    const warmupUrl = `${window.location.origin}/warmup`;
    window.open(warmupUrl, 'WarmupDisplay', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');

    // Re-broadcast current state for the new window
    setTimeout(() => {
      const competition = competitions.find(c => c.id === competitionId);
      if (competition) {
        console.log('[LiveCompetition] Re-broadcasting state for warmup display');

        // Broadcast competition started
        broadcast({
          type: 'competition_started',
          data: {
            competition_id: competitionId || '',
            competition_name: competition.name,
            lift_type: currentLift,
          },
        });

        // Broadcast current athlete if available
        if (currentAttempt) {
          broadcast({
            type: 'athlete_up',
            data: {
              athlete_id: currentAttempt.athlete_id,
              athlete_name: currentAttempt.athlete_name,
              weight_kg: currentAttempt.weight_kg,
              attempt_number: currentAttempt.attempt_number,
              lift_type: currentLift,
              lot_number: currentAttempt.lot_number,
              rack_height: currentAttempt.rack_height,
              safety_height: currentAttempt.safety_height,
            },
          });
        }

        // Broadcast attempt order for warmup display
        broadcast({
          type: 'attempt_order_update',
          data: {
            attempt_order: attemptOrder.map(a => ({
              athlete_id: a.athlete_id,
              athlete_name: a.athlete_name,
              weight_kg: a.weight_kg,
              attempt_number: a.attempt_number,
              lot_number: a.lot_number,
            })),
            current_index: currentIndex,
          },
        });
      }
    }, 500); // Small delay to ensure new window is ready

    message.success(t('live.display.opened'));
  };

  // Broadcast attempt order updates to warmup display
  useEffect(() => {
    if (attemptOrder.length > 0) {
      broadcast({
        type: 'attempt_order_update',
        data: {
          attempt_order: attemptOrder.map(a => ({
            athlete_id: a.athlete_id,
            athlete_name: a.athlete_name,
            weight_kg: a.weight_kg,
            attempt_number: a.attempt_number,
            lot_number: a.lot_number,
          })),
          current_index: currentIndex,
        },
      });
    }
  }, [attemptOrder, currentIndex, broadcast]);

  // Get available lifts based on competition format
  const getAvailableLifts = () => {
    if (competitionFormat === 'bench_only') {
      return [{ value: 'bench', label: t('live.lifts.bench') }];
    }
    return [
      { value: 'squat', label: t('live.lifts.squat') },
      { value: 'bench', label: t('live.lifts.bench') },
      { value: 'deadlift', label: t('live.lifts.deadlift') },
    ];
  };

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>{t('live.title')}</Title>
              {competition && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {competition.name} • {t('competition.format.label')}: {competitionFormat === 'bench_only' ? t('competition.format.bench') : t('competition.format.sbd')}
                </Text>
              )}
            </div>
            <Space>
              <Select
                value={currentLift}
                onChange={handleChangeLift}
                style={{ width: 150 }}
                size="large"
                disabled={isCompetitionActive}
                options={getAvailableLifts()}
              />
              {!isCompetitionActive ? (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartCompetition}
                  size="large"
                  disabled={!hasAttempts}
                >
                  {t('live.start')}
                </Button>
              ) : (
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={handlePauseCompetition}
                  size="large"
                >
                  {t('live.pause')}
                </Button>
              )}
            </Space>
          </div>
        }
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/competitions/${competitionId}`)}
          >
            {t('common.back')}
          </Button>
        }
      >
        {competitionWeighIns.length === 0 && (
          <Alert
            message={t('live.messages.noWeighIns')}
            description={t('live.messages.completeWeighIns')}
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
                    label: t('live.attemptTracker'),
                    children: currentAttempt && competitionId ? (
                      <AttemptTracker
                        currentAttempt={currentAttempt}
                        liftType={currentLift}
                        competitionId={competitionId}
                        onComplete={handleNextAttempt}
                      />
                    ) : (
                      <Alert
                        message={t('live.attempt.pending')}
                        description={t('live.messages.allAttemptsCompleted')}
                        type="info"
                      />
                    ),
                  },
                  {
                    key: 'order',
                    label: t('live.attemptOrder'),
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
                {/* Timer - resets when athlete changes */}
                <Timer
                  key={currentAttempt ? `${currentAttempt.athlete_id}-${currentAttempt.attempt_number}` : 'no-attempt'}
                  onComplete={() => message.warning(t('live.timer.timeUp'))}
                />

                {/* Competition Info */}
                <Card title={t('live.competitionInfo.title')} size="small">
                  <p>
                    <strong>{t('live.currentLift')}:</strong> {currentLift.toUpperCase()}
                  </p>
                  <p>
                    <strong>{t('live.attempt.result')}:</strong> {currentIndex + 1} / {attemptOrder.length}
                  </p>
                  <p>
                    <strong>{t('live.competitionInfo.athletes')}:</strong> {competitionAthletes.length}
                  </p>
                  <p>
                    <strong>{t('live.competitionInfo.weighedIn')}:</strong> {competitionWeighIns.length}
                  </p>
                  <p>
                    <strong>{t('competition.fields.status')}:</strong>{' '}
                    {isCompetitionActive ? (
                      <span style={{ color: '#52c41a', fontWeight: 'bold' }}>● {t('live.status.active')}</span>
                    ) : (
                      <span style={{ color: '#faad14' }}>● {t('live.status.paused')}</span>
                    )}
                  </p>
                </Card>

                {/* Quick Actions */}
                <Card title={t('live.quickActions.title')} size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      icon={<DesktopOutlined />}
                      onClick={handleOpenExternalDisplay}
                      block
                      style={{ background: '#722ed1', borderColor: '#722ed1' }}
                    >
                      {t('live.display.external')}
                    </Button>
                    <Button
                      type="primary"
                      icon={<TeamOutlined />}
                      onClick={handleOpenSpottersDisplay}
                      block
                      style={{ background: '#13c2c2', borderColor: '#13c2c2' }}
                    >
                      {t('live.display.spotters')}
                    </Button>
                    <Button
                      type="primary"
                      icon={<UsergroupAddOutlined />}
                      onClick={handleOpenWarmupDisplay}
                      block
                      style={{ background: '#52c41a', borderColor: '#52c41a' }}
                    >
                      {t('live.display.warmup')}
                    </Button>
                    <Link to={`/competitions/${competitionId}/declarations`} style={{ display: 'block' }}>
                      <Button
                        type="default"
                        icon={<FileTextOutlined />}
                        block
                        style={{ borderColor: '#1890ff', color: '#1890ff' }}
                      >
                        {t('declarations.title')}
                      </Button>
                    </Link>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setCurrentIndex(0);
                        message.success(t('live.messages.reset'));
                      }}
                      block
                    >
                      {t('live.quickActions.resetToStart')}
                    </Button>
                    <Button
                      onClick={handleNextAttempt}
                      disabled={!isCompetitionActive}
                      block
                    >
                      {t('live.quickActions.skipAttempt')}
                    </Button>
                  </Space>
                </Card>
              </Space>
            </Col>
          </Row>
        )}

        {!hasAttempts && competitionWeighIns.length > 0 && (
          <Alert
            message={t('live.messages.allAttemptsCompleted')}
            description={t('live.messages.allAttemptsCompleted')}
            type="success"
            showIcon
          />
        )}
      </Card>
    </div>
  );
};
