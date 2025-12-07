import { useState, useEffect } from 'react';
import { Card, InputNumber, Button, List, Tag, Space, Typography, message } from 'antd';
import { EditOutlined, CheckOutlined, ExpandOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useDeclarationStore } from '../stores/declarationStore';
import type { LiftType } from '../types';
import type { AttemptOrder } from '../../weigh-in/types';

const { Text } = Typography;

interface QuickDeclarationWidgetProps {
  competitionId: string;
  currentLift: LiftType;
  attemptOrder: AttemptOrder[];
  currentIndex: number;
  onOpenFullDeclarations: () => void;
  onDeclarationChange?: () => void; // Callback to refresh attempt order
}

interface DeclarationItem {
  athlete_id: string;
  athlete_name: string;
  current_attempt_number: 1 | 2 | 3;
  current_weight: number;
  next_attempt_number: 2 | 3 | null; // null if no more attempts
  next_weight: number | null;
  declared_weight: number | null;
  position: number;
}

export const QuickDeclarationWidget = ({
  currentLift,
  attemptOrder,
  currentIndex,
  onOpenFullDeclarations,
  onDeclarationChange,
}: QuickDeclarationWidgetProps) => {
  const { t } = useTranslation();
  const { athletes } = useAthleteStore();
  const { setDeclaration, getDeclaration } = useDeclarationStore();
  const [declarations, setDeclarations] = useState<DeclarationItem[]>([]);
  const [editingAthlete, setEditingAthlete] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<number | null>(null);

  // Get upcoming athletes (current + next 3)
  useEffect(() => {
    const upcomingAthletes = attemptOrder.slice(currentIndex, currentIndex + 4);

    const items: DeclarationItem[] = upcomingAthletes.map((attempt, idx) => {
      const athlete = athletes.find(a => a.id === attempt.athlete_id);

      // Current attempt info
      const currentAttemptNumber = attempt.attempt_number;
      const currentWeight = attempt.weight_kg;

      // Next attempt info (for declaration)
      const nextAttemptNumber = currentAttemptNumber < 3 ? (currentAttemptNumber + 1) as 2 | 3 : null;

      // Calculate suggested next weight based on current weight
      const suggestedNextWeight = nextAttemptNumber ? currentWeight + 2.5 : null;

      // Check if there's already a declaration for next attempt
      const existingDeclaration = nextAttemptNumber
        ? getDeclaration(attempt.athlete_id, currentLift, nextAttemptNumber)
        : null;

      return {
        athlete_id: attempt.athlete_id,
        athlete_name: attempt.athlete_name || `${athlete?.first_name} ${athlete?.last_name}`,
        current_attempt_number: currentAttemptNumber,
        current_weight: currentWeight,
        next_attempt_number: nextAttemptNumber,
        next_weight: suggestedNextWeight,
        declared_weight: existingDeclaration || null,
        position: idx,
      };
    });

    setDeclarations(items);
  }, [attemptOrder, currentIndex, athletes, currentLift, getDeclaration]);

  const handleStartEdit = (athleteId: string, suggestedWeight: number | null) => {
    setEditingAthlete(athleteId);
    setEditWeight(suggestedWeight || 0);
  };

  const handleSaveWeight = (athleteId: string, nextAttemptNumber: 2 | 3) => {
    if (editWeight === null || editWeight <= 0) {
      message.warning(t('declarations.messages.invalidWeight'));
      return;
    }

    // Save to declaration store
    setDeclaration(athleteId, currentLift, nextAttemptNumber, editWeight);

    // Update local state
    setDeclarations(prev =>
      prev.map(d =>
        d.athlete_id === athleteId
          ? { ...d, declared_weight: editWeight }
          : d
      )
    );

    message.success(t('declarations.messages.weightUpdated'));
    setEditingAthlete(null);
    setEditWeight(null);

    // Notify parent to refresh if needed
    onDeclarationChange?.();
  };

  const handleCancelEdit = () => {
    setEditingAthlete(null);
    setEditWeight(null);
  };

  const getPositionStyle = (position: number) => {
    if (position === 0) {
      return { background: '#e6f7ff', borderLeft: '3px solid #1890ff' };
    }
    return {};
  };

  const getPositionLabel = (position: number) => {
    if (position === 0) return t('live.declarations.current');
    return `+${position}`;
  };

  return (
    <Card
      title={t('live.declarations.title')}
      size="small"
      extra={
        <Button
          type="link"
          icon={<ExpandOutlined />}
          onClick={onOpenFullDeclarations}
          size="small"
        >
          {t('live.declarations.viewAll')}
        </Button>
      }
    >
      {declarations.length === 0 ? (
        <Text type="secondary">{t('live.declarations.noUpcoming')}</Text>
      ) : (
        <List
          size="small"
          dataSource={declarations}
          renderItem={(item) => (
            <List.Item
              style={{ ...getPositionStyle(item.position), padding: '8px 12px' }}
            >
              <div style={{ width: '100%' }}>
                {/* Athlete name and current attempt */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Space>
                    <Tag color={item.position === 0 ? 'blue' : 'default'}>
                      {getPositionLabel(item.position)}
                    </Tag>
                    <Text strong={item.position === 0}>{item.athlete_name}</Text>
                  </Space>
                  <Text type="secondary">#{item.current_attempt_number}</Text>
                </div>

                {/* Current weight */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{t('live.declarations.currentBar')}:</Text>
                  <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                    {item.current_weight} kg
                  </Text>
                </div>

                {/* Next attempt declaration (if applicable) */}
                {item.next_attempt_number && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fafafa',
                    padding: '4px 8px',
                    borderRadius: 4,
                    marginTop: 4
                  }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t('live.declarations.nextBar')} #{item.next_attempt_number}:
                    </Text>

                    {editingAthlete === item.athlete_id ? (
                      <Space size="small">
                        <InputNumber
                          value={editWeight}
                          onChange={setEditWeight}
                          min={item.current_weight}
                          max={500}
                          step={2.5}
                          size="small"
                          style={{ width: 80 }}
                          autoFocus
                        />
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleSaveWeight(item.athlete_id, item.next_attempt_number!)}
                        />
                        <Button
                          size="small"
                          onClick={handleCancelEdit}
                        >
                          ✕
                        </Button>
                      </Space>
                    ) : (
                      <Space size="small">
                        {item.declared_weight ? (
                          <Tag color="green">{item.declared_weight} kg</Tag>
                        ) : (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ({item.next_weight} kg)
                          </Text>
                        )}
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleStartEdit(item.athlete_id, item.declared_weight || item.next_weight)}
                        />
                      </Space>
                    )}
                  </div>
                )}

                {/* No more attempts */}
                {!item.next_attempt_number && item.current_attempt_number === 3 && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {t('live.declarations.lastAttempt')}
                  </Text>
                )}
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};
