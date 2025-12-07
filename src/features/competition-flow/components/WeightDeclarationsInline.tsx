import { useState, useEffect } from 'react';
import { Table, InputNumber, Tag, Space, Typography, Select, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useAttemptStore } from '../stores/attemptStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import type { LiftType } from '../types';

const { Text } = Typography;

interface DeclarationRow {
  athlete_id: string;
  athlete_name: string;
  last_attempt: number;
  next_attempt_number: 1 | 2 | 3;
  last_result: 'success' | 'failure' | 'none';
  last_weight: number | null;
  suggested_weight: number;
  declared_weight?: number;
  status: 'pending' | 'declared';
}

interface WeightDeclarationsInlineProps {
  competitionId: string;
  currentLift: LiftType;
}

export const WeightDeclarationsInline = ({ competitionId, currentLift: initialLift }: WeightDeclarationsInlineProps) => {
  const { t } = useTranslation();
  const { athletes } = useAthleteStore();
  const { attempts, updateAttempt } = useAttemptStore();
  const { weighIns } = useWeighInStore();
  const [declarations, setDeclarations] = useState<DeclarationRow[]>([]);
  const [liftType, setLiftType] = useState<LiftType>(initialLift);

  useEffect(() => {
    if (!competitionId) return;
    calculateDeclarations();
  }, [competitionId, attempts, liftType]);

  const calculateDeclarations = () => {
    const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);
    const competitionWeighIns = weighIns.filter(w => w.competition_id === competitionId);

    const rows: DeclarationRow[] = [];

    competitionAthletes.forEach(athlete => {
      const athleteAttempts = attempts.filter(
        a => a.athlete_id === athlete.id && a.lift_type === liftType && a.result !== 'pending'
      ).sort((a, b) => a.attempt_number - b.attempt_number);

      // Only show athletes who need to declare their next attempt
      if (athleteAttempts.length > 0 && athleteAttempts.length < 3) {
        const lastAttempt = athleteAttempts[athleteAttempts.length - 1];
        const nextAttemptNumber = (athleteAttempts.length + 1) as 1 | 2 | 3;

        // Calculate suggested weight
        let suggestedWeight = lastAttempt.weight_kg;
        if (lastAttempt.result === 'success') {
          suggestedWeight += 2.5; // Minimum increment for success
        }

        rows.push({
          athlete_id: athlete.id,
          athlete_name: `${athlete.first_name} ${athlete.last_name}`,
          last_attempt: athleteAttempts.length,
          next_attempt_number: nextAttemptNumber,
          last_result: lastAttempt.result as 'success' | 'failure',
          last_weight: lastAttempt.weight_kg,
          suggested_weight: suggestedWeight,
          declared_weight: undefined,
          status: 'pending',
        });
      }

      // Also show athletes who haven't started (first attempt)
      if (athleteAttempts.length === 0) {
        const weighIn = competitionWeighIns.find(w => w.athlete_id === athlete.id);
        if (weighIn) {
          const openingWeight = weighIn[`opening_${liftType}` as keyof typeof weighIn] as number;
          rows.push({
            athlete_id: athlete.id,
            athlete_name: `${athlete.first_name} ${athlete.last_name}`,
            last_attempt: 0,
            next_attempt_number: 1,
            last_result: 'none',
            last_weight: null,
            suggested_weight: openingWeight,
            declared_weight: openingWeight,
            status: 'declared',
          });
        }
      }
    });

    setDeclarations(rows);
  };

  const handleWeightChange = async (athleteId: string, weight: number | null) => {
    if (weight === null) return;

    // Validate that weight is >= last attempt weight
    const row = declarations.find(d => d.athlete_id === athleteId);
    if (row?.last_weight && weight < row.last_weight) {
      message.warning(t('declarations.messages.weightBelowPrevious', { minWeight: row.last_weight }));
      return;
    }

    // Find the pending attempt for this athlete
    const pendingAttempt = attempts.find(
      a => a.athlete_id === athleteId && a.lift_type === liftType && a.result === 'pending'
    );

    if (pendingAttempt) {
      try {
        await updateAttempt({
          ...pendingAttempt,
          weight_kg: weight,
        });
        message.success(t('declarations.messages.weightUpdated'));
      } catch {
        message.error(t('common.error'));
      }
    }

    setDeclarations(prev =>
      prev.map(row =>
        row.athlete_id === athleteId
          ? { ...row, declared_weight: weight, status: 'declared' as const }
          : row
      )
    );
  };

  const columns = [
    {
      title: t('athlete.fields.lastName'),
      dataIndex: 'athlete_name',
      key: 'athlete_name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: t('declarations.lastAttempt'),
      dataIndex: 'last_attempt',
      key: 'last_attempt',
      width: 120,
      render: (attempt: number, record: DeclarationRow) => (
        <Space>
          <Text>#{attempt}</Text>
          {attempt > 0 && (
            <Tag color={record.last_result === 'success' ? 'green' : 'red'}>
              {record.last_result === 'success' ? t('live.attempt.success') : t('live.attempt.failure')}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('declarations.nextAttempt'),
      dataIndex: 'next_attempt_number',
      key: 'next_attempt_number',
      width: 100,
      render: (num: number) => <Tag color="blue">#{num}</Tag>,
    },
    {
      title: t('declarations.suggestedWeight'),
      dataIndex: 'suggested_weight',
      key: 'suggested_weight',
      width: 120,
      render: (weight: number) => <Text type="secondary">{weight} kg</Text>,
    },
    {
      title: t('declarations.declaredWeight'),
      dataIndex: 'declared_weight',
      key: 'declared_weight',
      width: 160,
      render: (_: any, record: DeclarationRow) => (
        <InputNumber
          value={record.declared_weight}
          onChange={(value) => handleWeightChange(record.athlete_id, value)}
          min={record.last_weight || 20}
          max={500}
          step={2.5}
          addonAfter="kg"
          style={{ width: '100%' }}
          placeholder={record.suggested_weight.toString()}
        />
      ),
    },
    {
      title: t('competition.fields.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'declared' ? 'green' : 'orange'} icon={status === 'declared' ? <CheckOutlined /> : undefined}>
          {status === 'declared' ? t('declarations.status.declared') : t('declarations.status.pending')}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Text strong>{t('live.currentLift')}:</Text>
          <Select
            value={liftType}
            onChange={setLiftType}
            style={{ width: 150 }}
            options={[
              { value: 'squat', label: t('live.lifts.squat') },
              { value: 'bench', label: t('live.lifts.bench') },
              { value: 'deadlift', label: t('live.lifts.deadlift') },
            ]}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={declarations}
        rowKey="athlete_id"
        pagination={false}
        size="small"
        locale={{
          emptyText: t('declarations.noDeclarations'),
        }}
      />
    </div>
  );
};
