import { useState, useEffect, useCallback } from 'react';
import { Card, Button, InputNumber, message, Space, Typography, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { AttemptOrder } from '../../weigh-in/types';
import { LiftType } from '../types';
import { useAttemptStore } from '../stores/attemptStore';
import { useBroadcastStore } from '../stores/broadcastStore';

const { Title, Text } = Typography;

interface AttemptTrackerProps {
  currentAttempt: AttemptOrder;
  liftType: LiftType;
  competitionId: string;
  onComplete: () => void;
}

export const AttemptTracker = ({
  currentAttempt,
  liftType,
  competitionId,
  onComplete,
}: AttemptTrackerProps) => {
  const { t } = useTranslation();
  const { attempts, createAttempt, updateAttempt } = useAttemptStore();
  const { broadcast } = useBroadcastStore();
  const [weight, setWeight] = useState<number>(currentAttempt.weight_kg);
  const [refereeVotes, setRefereeVotes] = useState<[boolean | null, boolean | null, boolean | null]>([
    null,
    null,
    null,
  ]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAttemptCompleted, setIsAttemptCompleted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<'success' | 'failure' | null>(null);

  // Get previous attempts for this athlete and lift type
  const previousAttempts = attempts.filter(
    a => a.athlete_id === currentAttempt.athlete_id &&
         a.lift_type === liftType &&
         a.attempt_number < currentAttempt.attempt_number
  ).sort((a, b) => a.attempt_number - b.attempt_number);

  // Create a stable key for the current attempt
  const attemptKey = `${currentAttempt.athlete_id}-${currentAttempt.attempt_number}-${liftType}`;

  useEffect(() => {
    // Reset for new attempt (only when athlete/attempt actually changes)
    setWeight(currentAttempt.weight_kg);
    setRefereeVotes([null, null, null]);
    setAttemptId(null);
    setIsAttemptCompleted(false);
    setAttemptResult(null);
  }, [attemptKey, currentAttempt.weight_kg]);

  const handleRefereeVote = useCallback((refereeIndex: 0 | 1 | 2, decision: boolean) => {
    console.log('[AttemptTracker] Referee', refereeIndex + 1, 'voted:', decision ? 'Good Lift' : 'No Lift');
    setRefereeVotes(prevVotes => {
      const newVotes = [...prevVotes] as [boolean | null, boolean | null, boolean | null];
      newVotes[refereeIndex] = decision;
      console.log('[AttemptTracker] New votes:', newVotes);
      return newVotes;
    });
  }, []);

  const canSubmit = refereeVotes.every(vote => vote !== null);

  const handleSubmit = async () => {
    console.log('[AttemptTracker] handleSubmit called - canSubmit:', canSubmit);
    if (!canSubmit) {
      message.warning(t('live.referee.vote'));
      return;
    }

    setIsSubmitting(true);
    console.log('[AttemptTracker] Submitting attempt with votes:', refereeVotes);
    try {
      // Create or update attempt
      if (!attemptId) {
        const attempt = await createAttempt({
          athlete_id: currentAttempt.athlete_id,
          competition_id: competitionId,
          lift_type: liftType,
          attempt_number: currentAttempt.attempt_number,
          weight_kg: weight,
          rack_height: currentAttempt.rack_height,
        });
        setAttemptId(attempt.id);

        // Update with referee votes
        await updateAttempt({
          id: attempt.id,
          referee_votes: refereeVotes as [boolean, boolean, boolean],
        });
      } else {
        await updateAttempt({
          id: attemptId,
          referee_votes: refereeVotes as [boolean, boolean, boolean],
        });
      }

      const greenCount = refereeVotes.filter(v => v === true).length;
      const success = greenCount >= 2;

      // Broadcast attempt result
      broadcast({
        type: 'attempt_result',
        data: {
          athlete_id: currentAttempt.athlete_id,
          athlete_name: currentAttempt.athlete_name,
          weight_kg: weight,
          attempt_number: currentAttempt.attempt_number,
          lift_type: liftType,
          result: success ? 'success' : 'failure',
          referee_votes: refereeVotes as [boolean, boolean, boolean],
        },
      });

      message.success(success ? t('live.attempt.success') + ' ✓' : t('live.attempt.failure') + ' ✗');

      // Mark attempt as completed but don't move to next automatically
      setIsAttemptCompleted(true);
      setAttemptResult(success ? 'success' : 'failure');
    } catch (error) {
      message.error(t('live.messages.attemptSaved'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextAthlete = () => {
    onComplete();
  };

  const greenCount = refereeVotes.filter(v => v === true).length;
  const redCount = refereeVotes.filter(v => v === false).length;

  return (
    <Card bodyStyle={{ padding: '16px' }}>
      {/* Previous Attempts History - Compact */}
      {previousAttempts.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Space size="small" wrap>
            {previousAttempts.map((attempt) => (
              <Tag
                key={attempt.id}
                style={{
                  fontSize: 12,
                  padding: '2px 8px',
                  background: attempt.result === 'success' ? '#ffffff' : '#ff4d4f',
                  color: attempt.result === 'success' ? '#000000' : '#ffffff',
                  border: attempt.result === 'success' ? '1px solid #1890ff' : 'none'
                }}
              >
                {t('live.attempt.number', { number: attempt.attempt_number })}: {attempt.weight_kg}kg {attempt.result === 'success' ? '✓' : '✗'}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* Current Athlete Display - Compact */}
      <div style={{ background: '#1890ff', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ color: 'white', margin: 0, marginBottom: 4 }}>
              {currentAttempt.athlete_name}
            </Title>
            <Space size="small">
              <Tag style={{ margin: 0, fontSize: 11 }}>{t('spottersDisplay.lotNumber', { number: currentAttempt.lot_number })}</Tag>
              <Tag style={{ margin: 0, fontSize: 11 }}>{t('live.attempt.number', { number: currentAttempt.attempt_number })}</Tag>
              {currentAttempt.rack_height && (
                <Tag style={{ margin: 0, fontSize: 11 }}>{t('spottersDisplay.rackHeights.rack')} {currentAttempt.rack_height}</Tag>
              )}
            </Space>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{liftType.toUpperCase()}</div>
            <div style={{ fontSize: 42, fontWeight: 'bold', fontFamily: 'monospace' }}>
              {weight} kg
            </div>
          </div>
        </div>
      </div>

      {/* Weight Adjustment - Inline */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Text strong style={{ fontSize: 13 }}>{t('live.attempt.weight')}:</Text>
        <InputNumber
          value={weight}
          onChange={(val) => val && setWeight(val)}
          min={currentAttempt.weight_kg - 2.5}
          max={currentAttempt.weight_kg + 20}
          step={2.5}
          style={{ width: 120 }}
          size="small"
          addonAfter="kg"
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          ({currentAttempt.weight_kg} kg)
        </Text>
      </div>

      {/* Referee Lights - Compact */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>{t('live.referee.title')}</Text>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[0, 1, 2].map((index) => (
            <Card
              key={index}
              size="small"
              style={{
                flex: 1,
                textAlign: 'center',
                background: '#f5f5f5',
                border: '1px solid #d9d9d9',
              }}
              bodyStyle={{ padding: '8px' }}
            >
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 'bold' }}>
                {t('live.referee.center')} {index + 1}
                {refereeVotes[index] !== null && (
                  <span style={{ marginLeft: 4 }}>
                    {refereeVotes[index] ? '⚪' : '🔴'}
                  </span>
                )}
              </div>

              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Button
                  type={refereeVotes[index] === true ? 'primary' : 'default'}
                  onClick={() => handleRefereeVote(index as 0 | 1 | 2, true)}
                  size="small"
                  block
                  style={{
                    background: refereeVotes[index] === true ? '#ffffff' : undefined,
                    borderColor: refereeVotes[index] === true ? '#1890ff' : undefined,
                    color: refereeVotes[index] === true ? '#000000' : undefined,
                    fontSize: 11,
                    height: 32,
                    fontWeight: refereeVotes[index] === true ? 'bold' : undefined,
                  }}
                >
                  ⚪ {t('live.attempt.success')}
                </Button>
                <Button
                  type={refereeVotes[index] === false ? 'primary' : 'default'}
                  onClick={() => handleRefereeVote(index as 0 | 1 | 2, false)}
                  size="small"
                  block
                  danger={refereeVotes[index] === false}
                  style={{
                    fontSize: 11,
                    height: 32,
                    background: refereeVotes[index] === false ? '#ff4d4f' : undefined,
                    borderColor: refereeVotes[index] === false ? '#ff4d4f' : undefined,
                  }}
                >
                  🔴 {t('live.attempt.failure')}
                </Button>
              </Space>
            </Card>
          ))}
        </div>

        {/* Vote Summary - Compact */}
        {canSubmit && (
          <div style={{ marginTop: 8, textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: 4 }}>
            <Space size="middle">
              <Text strong style={{ fontSize: 13 }}>⚪ {greenCount}</Text>
              <Text strong style={{ fontSize: 13 }}>🔴 {redCount}</Text>
              <Tag
                color={greenCount >= 2 ? undefined : 'error'}
                style={{
                  fontSize: 12,
                  padding: '4px 12px',
                  background: greenCount >= 2 ? '#ffffff' : undefined,
                  color: greenCount >= 2 ? '#000000' : undefined,
                  border: greenCount >= 2 ? '1px solid #1890ff' : undefined,
                  fontWeight: 'bold'
                }}
              >
                {greenCount >= 2 ? '✓ ' + t('live.attempt.success') : '✗ ' + t('live.attempt.failure')}
              </Tag>
            </Space>
          </div>
        )}
      </div>

      {/* Submit Button or Next Athlete Button - Compact */}
      {!isAttemptCompleted ? (
        <Button
          type="primary"
          size="middle"
          block
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
          style={{ height: 44, fontSize: 14, fontWeight: 'bold', marginTop: 8 }}
        >
          {canSubmit ? t('common.confirm') : t('live.attempt.pending') + '...'}
        </Button>
      ) : (
        <div style={{ marginTop: 8 }}>
          <div style={{
            padding: '12px',
            marginBottom: '8px',
            borderRadius: '6px',
            textAlign: 'center',
            background: attemptResult === 'success' ? '#ffffff' : '#ff4d4f',
            border: attemptResult === 'success' ? '2px solid #1890ff' : 'none',
            color: attemptResult === 'success' ? '#000000' : '#ffffff'
          }}>
            <Title level={5} style={{ margin: 0, color: attemptResult === 'success' ? '#000000' : '#ffffff' }}>
              {attemptResult === 'success' ? '✓ ' + t('externalDisplay.goodLift') : '✗ ' + t('externalDisplay.noLift')}
            </Title>
          </div>
          <Button
            type="primary"
            size="middle"
            block
            onClick={handleNextAthlete}
            style={{ height: 44, fontSize: 14, fontWeight: 'bold', background: '#52c41a', borderColor: '#52c41a' }}
          >
            {t('live.nextAthlete')} →
          </Button>
        </div>
      )}
    </Card>
  );
};
