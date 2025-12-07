import { useState, useEffect } from 'react';
import { Card, InputNumber, Button, List, Tag, Space, Typography, message } from 'antd';
import { EditOutlined, CheckOutlined, ExpandOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useAttemptStore } from '../stores/attemptStore';
import type { LiftType } from '../types';
import type { AttemptOrder } from '../../weigh-in/types';

const { Text } = Typography;

interface QuickDeclarationWidgetProps {
  competitionId: string;
  currentLift: LiftType;
  attemptOrder: AttemptOrder[];
  currentIndex: number;
  onOpenFullDeclarations: () => void;
}

interface DeclarationItem {
  athlete_id: string;
  athlete_name: string;
  next_attempt_number: 1 | 2 | 3;
  current_weight: number;
  declared_weight?: number;
  last_result?: 'success' | 'failure' | 'pending';
  position: number;
}

export const QuickDeclarationWidget = ({
  currentLift,
  attemptOrder,
  currentIndex,
  onOpenFullDeclarations,
}: QuickDeclarationWidgetProps) => {
  const { t } = useTranslation();
  const { athletes } = useAthleteStore();
  const { attempts, updateAttempt } = useAttemptStore();
  const [declarations, setDeclarations] = useState<DeclarationItem[]>([]);
  const [editingAthlete, setEditingAthlete] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<number | null>(null);

  // Get upcoming athletes (current + next 3)
  useEffect(() => {
    const upcomingAthletes = attemptOrder.slice(currentIndex, currentIndex + 4);

    const items: DeclarationItem[] = upcomingAthletes.map((attempt, idx) => {
      const athlete = athletes.find(a => a.id === attempt.athlete_id);
      const athleteAttempts = attempts.filter(
        a => a.athlete_id === attempt.athlete_id && a.lift_type === currentLift
      );
      const lastAttempt = athleteAttempts[athleteAttempts.length - 1];

      return {
        athlete_id: attempt.athlete_id,
        athlete_name: attempt.athlete_name || `${athlete?.first_name} ${athlete?.last_name}`,
        next_attempt_number: attempt.attempt_number,
        current_weight: attempt.weight_kg,
        declared_weight: attempt.weight_kg,
        last_result: lastAttempt?.result as 'success' | 'failure' | 'pending' | undefined,
        position: idx,
      };
    });

    setDeclarations(items);
  }, [attemptOrder, currentIndex, athletes, attempts, currentLift]);

  const handleStartEdit = (athleteId: string, currentWeight: number) => {
    setEditingAthlete(athleteId);
    setEditWeight(currentWeight);
  };

  const handleSaveWeight = async (athleteId: string) => {
    if (editWeight === null) return;

    // Find the pending attempt for this athlete
    const pendingAttempt = attempts.find(
      a => a.athlete_id === athleteId && a.lift_type === currentLift && a.result === 'pending'
    );

    if (pendingAttempt) {
      try {
        await updateAttempt({
          ...pendingAttempt,
          weight_kg: editWeight,
        });
        message.success(t('declarations.messages.weightUpdated'));
      } catch {
        message.error(t('common.error'));
      }
    }

    // Update local state
    setDeclarations(prev =>
      prev.map(d =>
        d.athlete_id === athleteId ? { ...d, declared_weight: editWeight, current_weight: editWeight } : d
      )
    );

    setEditingAthlete(null);
    setEditWeight(null);
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
              actions={
                editingAthlete === item.athlete_id
                  ? [
                      <Button
                        key="save"
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleSaveWeight(item.athlete_id)}
                      />,
                      <Button
                        key="cancel"
                        size="small"
                        onClick={handleCancelEdit}
                      >
                        {t('common.cancel')}
                      </Button>,
                    ]
                  : [
                      <Button
                        key="edit"
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleStartEdit(item.athlete_id, item.current_weight)}
                      />,
                    ]
              }
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Tag color={item.position === 0 ? 'blue' : 'default'}>
                      {getPositionLabel(item.position)}
                    </Tag>
                    <Text strong={item.position === 0}>{item.athlete_name}</Text>
                  </Space>
                }
                description={
                  <Space>
                    <Text type="secondary">#{item.next_attempt_number}</Text>
                    {editingAthlete === item.athlete_id ? (
                      <InputNumber
                        value={editWeight}
                        onChange={setEditWeight}
                        min={20}
                        max={500}
                        step={2.5}
                        size="small"
                        style={{ width: 100 }}
                        addonAfter="kg"
                        autoFocus
                      />
                    ) : (
                      <Text
                        strong
                        style={{ fontSize: 16, color: item.position === 0 ? '#1890ff' : undefined }}
                      >
                        {item.current_weight} kg
                      </Text>
                    )}
                    {item.last_result && item.last_result !== 'pending' && (
                      <Tag color={item.last_result === 'success' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                        {item.last_result === 'success' ? '✓' : '✗'}
                      </Tag>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};
