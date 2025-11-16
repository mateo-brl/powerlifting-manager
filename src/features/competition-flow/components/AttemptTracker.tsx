import { useState, useEffect } from 'react';
import { Card, Button, InputNumber, message, Space, Typography, Tag, Badge } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, TrophyOutlined } from '@ant-design/icons';
import { AttemptOrder } from '../../weigh-in/types';
import { LiftType } from '../types';
import { useAttemptStore } from '../stores/attemptStore';

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
  const { createAttempt, updateAttempt } = useAttemptStore();
  const [weight, setWeight] = useState<number>(currentAttempt.weight_kg);
  const [refereeVotes, setRefereeVotes] = useState<[boolean | null, boolean | null, boolean | null]>([
    null,
    null,
    null,
  ]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset for new attempt
    setWeight(currentAttempt.weight_kg);
    setRefereeVotes([null, null, null]);
    setAttemptId(null);
  }, [currentAttempt]);

  const handleRefereeVote = (refereeIndex: 0 | 1 | 2, decision: boolean) => {
    const newVotes = [...refereeVotes] as [boolean | null, boolean | null, boolean | null];
    newVotes[refereeIndex] = decision;
    setRefereeVotes(newVotes);
  };

  const canSubmit = refereeVotes.every(vote => vote !== null);

  const handleSubmit = async () => {
    if (!canSubmit) {
      message.warning('All 3 referees must vote');
      return;
    }

    setIsSubmitting(true);
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

      message.success(success ? 'Good lift! ✓' : 'No lift ✗');

      // Move to next attempt after a short delay
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      message.error('Failed to record attempt');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const greenCount = refereeVotes.filter(v => v === true).length;
  const redCount = refereeVotes.filter(v => v === false).length;

  return (
    <Card>
      {/* Current Athlete Display */}
      <div style={{ background: '#1890ff', color: 'white', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
              <TrophyOutlined /> CURRENT ATTEMPT
            </div>
            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
              {currentAttempt.athlete_name}
            </Title>
            <Space>
              <Tag color="blue">Lot #{currentAttempt.lot_number}</Tag>
              <Tag color="green">Attempt #{currentAttempt.attempt_number}</Tag>
              {currentAttempt.rack_height && (
                <Tag color="purple">Rack: {currentAttempt.rack_height}</Tag>
              )}
            </Space>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
              {liftType.toUpperCase()}
            </div>
            <div style={{ fontSize: 56, fontWeight: 'bold', fontFamily: 'monospace' }}>
              {weight} kg
            </div>
          </div>
        </div>
      </div>

      {/* Weight Adjustment */}
      <div style={{ marginBottom: 24 }}>
        <Text strong>Adjust Weight (optional)</Text>
        <div style={{ marginTop: 8 }}>
          <InputNumber
            value={weight}
            onChange={(val) => val && setWeight(val)}
            min={currentAttempt.weight_kg - 2.5}
            max={currentAttempt.weight_kg + 20}
            step={2.5}
            style={{ width: 200 }}
            size="large"
            addonAfter="kg"
          />
          <Text type="secondary" style={{ marginLeft: 16 }}>
            Original: {currentAttempt.weight_kg} kg
          </Text>
        </div>
      </div>

      {/* Referee Lights */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Referee Decisions</Title>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
          {[0, 1, 2].map((index) => (
            <Card
              key={index}
              style={{
                flex: 1,
                textAlign: 'center',
                background: '#f5f5f5',
                border: '2px solid #d9d9d9',
              }}
              styles={{ body: { padding: '24px 16px' } }}
            >
              <div style={{ marginBottom: 16 }}>
                <Badge
                  status={
                    refereeVotes[index] === true
                      ? 'success'
                      : refereeVotes[index] === false
                      ? 'error'
                      : 'default'
                  }
                  text={`Referee ${index + 1}`}
                />
              </div>

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button
                  type={refereeVotes[index] === true ? 'primary' : 'default'}
                  icon={<CheckCircleFilled />}
                  onClick={() => handleRefereeVote(index as 0 | 1 | 2, true)}
                  size="large"
                  block
                  style={{
                    background: refereeVotes[index] === true ? '#52c41a' : undefined,
                    borderColor: refereeVotes[index] === true ? '#52c41a' : undefined,
                    height: 60,
                  }}
                >
                  Good Lift
                </Button>
                <Button
                  type={refereeVotes[index] === false ? 'primary' : 'default'}
                  icon={<CloseCircleFilled />}
                  onClick={() => handleRefereeVote(index as 0 | 1 | 2, false)}
                  size="large"
                  block
                  danger={refereeVotes[index] === false}
                  style={{ height: 60 }}
                >
                  No Lift
                </Button>
              </Space>
            </Card>
          ))}
        </div>

        {/* Vote Summary */}
        {canSubmit && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space size="large">
              <div>
                <CheckCircleFilled style={{ fontSize: 24, color: '#52c41a', marginRight: 8 }} />
                <Text strong style={{ fontSize: 18 }}>
                  {greenCount} Green
                </Text>
              </div>
              <div>
                <CloseCircleFilled style={{ fontSize: 24, color: '#ff4d4f', marginRight: 8 }} />
                <Text strong style={{ fontSize: 18 }}>
                  {redCount} Red
                </Text>
              </div>
              <div>
                <Tag color={greenCount >= 2 ? 'success' : 'error'} style={{ fontSize: 16, padding: '8px 16px' }}>
                  {greenCount >= 2 ? '✓ GOOD LIFT' : '✗ NO LIFT'}
                </Tag>
              </div>
            </Space>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="primary"
        size="large"
        block
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={isSubmitting}
        style={{ height: 60, fontSize: 18, fontWeight: 'bold' }}
      >
        {canSubmit ? 'Confirm Attempt & Continue' : 'Waiting for all referee decisions...'}
      </Button>
    </Card>
  );
};
