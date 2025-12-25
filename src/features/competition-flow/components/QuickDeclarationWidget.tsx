import { useState, useEffect } from 'react';
import { Card, InputNumber, Button, List, Tag, Space, Typography, message, Input, theme } from 'antd';
import { EditOutlined, CheckOutlined, ExpandOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useAttemptStore } from '../stores/attemptStore';
import { useDeclarationStore } from '../stores/declarationStore';
import type { LiftType } from '../types';

const { Text } = Typography;
const { useToken } = theme;

interface QuickDeclarationWidgetProps {
  competitionId: string;
  currentLift: LiftType;
  onOpenFullDeclarations: () => void;
  onDeclarationChange?: () => void;
}

interface AthleteDeclarationItem {
  athlete_id: string;
  athlete_name: string;
  lot_number: number;
  last_completed_attempt: 0 | 1 | 2 | 3; // 0 = no attempts yet
  next_attempt_to_declare: 1 | 2 | 3 | null; // null if all 3 done
  last_weight: number | null;
  declared_weight: number | null;
  suggested_weight: number | null;
}

export const QuickDeclarationWidget = ({
  competitionId,
  currentLift,
  onOpenFullDeclarations,
  onDeclarationChange,
}: QuickDeclarationWidgetProps) => {
  const { t } = useTranslation();
  const { token } = useToken();
  const { athletes } = useAthleteStore();
  const { attempts } = useAttemptStore();
  const { setDeclaration, getDeclaration } = useDeclarationStore();
  const [athletesList, setAthletesList] = useState<AthleteDeclarationItem[]>([]);
  const [editingAthlete, setEditingAthlete] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  // Build list of all athletes who need to declare
  useEffect(() => {
    const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);

    const items: AthleteDeclarationItem[] = competitionAthletes.map(athlete => {
      // Get completed attempts for this athlete and lift
      const athleteAttempts = attempts.filter(
        a => a.athlete_id === athlete.id &&
             a.lift_type === currentLift &&
             a.result !== 'pending'
      ).sort((a, b) => a.attempt_number - b.attempt_number);

      const lastCompletedAttempt = athleteAttempts.length as 0 | 1 | 2 | 3;
      const nextAttemptToDeclare = lastCompletedAttempt < 3
        ? (lastCompletedAttempt + 1) as 1 | 2 | 3
        : null;

      // Get last weight used
      const lastAttempt = athleteAttempts[athleteAttempts.length - 1];
      const lastWeight = lastAttempt ? lastAttempt.weight_kg : null;

      // Calculate suggested weight
      let suggestedWeight: number | null = null;
      if (nextAttemptToDeclare && lastWeight) {
        // If last attempt was successful, suggest +2.5kg, otherwise same weight
        if (lastAttempt.result === 'success') {
          suggestedWeight = lastWeight + 2.5;
        } else {
          suggestedWeight = lastWeight;
        }
      }

      // Check if there's already a declaration
      const declaredWeight = nextAttemptToDeclare
        ? getDeclaration(athlete.id, currentLift, nextAttemptToDeclare)
        : null;

      return {
        athlete_id: athlete.id,
        athlete_name: `${athlete.last_name}, ${athlete.first_name}`,
        lot_number: athlete.lot_number || 999,
        last_completed_attempt: lastCompletedAttempt,
        next_attempt_to_declare: nextAttemptToDeclare,
        last_weight: lastWeight,
        declared_weight: declaredWeight || null,
        suggested_weight: suggestedWeight,
      };
    })
    // Filter: only show athletes who have attempts to declare (1, 2, or 3)
    // AND have completed at least one attempt (so they need to declare next)
    .filter(item => item.next_attempt_to_declare !== null && item.last_completed_attempt > 0)
    // Sort by lot number
    .sort((a, b) => a.lot_number - b.lot_number);

    setAthletesList(items);
  }, [athletes, attempts, competitionId, currentLift, getDeclaration]);

  // Filter by search
  const filteredAthletes = athletesList.filter(item =>
    searchText === '' ||
    item.athlete_name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.lot_number.toString().includes(searchText)
  );

  const handleStartEdit = (athleteId: string, suggestedWeight: number | null) => {
    setEditingAthlete(athleteId);
    setEditWeight(suggestedWeight || 0);
  };

  const handleSaveWeight = (athleteId: string, attemptNumber: 1 | 2 | 3) => {
    if (editWeight === null || editWeight <= 0) {
      message.warning(t('declarations.messages.invalidWeight'));
      return;
    }

    // Validate that weight is >= last attempt weight
    const item = athletesList.find(a => a.athlete_id === athleteId);
    if (item?.last_weight && editWeight < item.last_weight) {
      message.warning(t('declarations.messages.weightBelowPrevious', { minWeight: item.last_weight }));
      return;
    }

    // Save to declaration store
    setDeclaration(athleteId, currentLift, attemptNumber, editWeight);

    // Update local state
    setAthletesList(prev =>
      prev.map(d =>
        d.athlete_id === athleteId
          ? { ...d, declared_weight: editWeight }
          : d
      )
    );

    message.success(t('declarations.messages.weightUpdated'));
    setEditingAthlete(null);
    setEditWeight(null);

    // Notify parent to refresh
    onDeclarationChange?.();
  };

  const handleCancelEdit = () => {
    setEditingAthlete(null);
    setEditWeight(null);
  };

  const getAttemptBadgeColor = (attempt: number) => {
    switch (attempt) {
      case 1: return 'blue';
      case 2: return 'orange';
      case 3: return 'red';
      default: return 'default';
    }
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
      {/* Search input */}
      <Input
        placeholder={t('live.declarations.searchAthlete')}
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        size="small"
        style={{ marginBottom: 8 }}
        allowClear
        aria-label={t('live.declarations.aria.searchAthlete')}
      />

      {filteredAthletes.length === 0 ? (
        <Text type="secondary">
          {athletesList.length === 0
            ? t('live.declarations.noDeclarationsNeeded')
            : t('live.declarations.noResults')
          }
        </Text>
      ) : (
        <List
          size="small"
          dataSource={filteredAthletes.slice(0, 4)} // Show max 4 athletes for compact view
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 12px' }}>
              <div style={{ width: '100%' }}>
                {/* Athlete name and info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Space>
                    <Tag>{item.lot_number}</Tag>
                    <Text strong>{item.athlete_name}</Text>
                  </Space>
                  <Tag color={getAttemptBadgeColor(item.last_completed_attempt)}>
                    {t('live.declarations.completed')} #{item.last_completed_attempt}
                  </Tag>
                </div>

                {/* Last weight info */}
                {item.last_weight && (
                  <div style={{ fontSize: 12, color: token.colorTextSecondary, marginBottom: 4 }}>
                    {t('live.declarations.lastBar')}: {item.last_weight} kg
                  </div>
                )}

                {/* Declaration input */}
                {item.next_attempt_to_declare && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: item.declared_weight ? token.colorSuccessBg : token.colorWarningBg,
                    padding: '6px 10px',
                    borderRadius: token.borderRadius,
                    border: item.declared_weight ? `1px solid ${token.colorSuccessBorder}` : `1px solid ${token.colorWarningBorder}`
                  }}>
                    <Text strong style={{ fontSize: 13 }}>
                      {t('live.declarations.declareAttempt')} #{item.next_attempt_to_declare}:
                    </Text>

                    {editingAthlete === item.athlete_id ? (
                      <Space size="small">
                        <InputNumber
                          value={editWeight}
                          onChange={setEditWeight}
                          min={item.last_weight || 20}
                          max={500}
                          step={2.5}
                          size="small"
                          style={{ width: 90 }}
                          autoFocus
                          addonAfter="kg"
                          aria-label={t('live.declarations.aria.declareWeight', { athlete: item.athlete_name, attempt: item.next_attempt_to_declare })}
                        />
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleSaveWeight(item.athlete_id, item.next_attempt_to_declare!)}
                        />
                        <Button size="small" onClick={handleCancelEdit}>✕</Button>
                      </Space>
                    ) : (
                      <Space size="small">
                        {item.declared_weight ? (
                          <Tag color="green" style={{ fontSize: 14, padding: '2px 8px' }}>
                            {item.declared_weight} kg
                          </Tag>
                        ) : (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ({item.suggested_weight || '?'} kg)
                          </Text>
                        )}
                        <Button
                          type={item.declared_weight ? 'text' : 'primary'}
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleStartEdit(item.athlete_id, item.declared_weight || item.suggested_weight)}
                        >
                          {!item.declared_weight && t('live.declarations.declare')}
                        </Button>
                      </Space>
                    )}
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      )}

      {filteredAthletes.length > 4 && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            +{filteredAthletes.length - 4} {t('live.declarations.moreAthletes')}
          </Text>
        </div>
      )}
    </Card>
  );
};
