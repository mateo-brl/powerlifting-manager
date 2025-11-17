import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, InputNumber, Button, message, Tag, Space, Typography, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useAttemptStore } from '../stores/attemptStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import type { LiftType } from '../types';

const { Title, Text } = Typography;

interface DeclarationRow {
  athlete_id: string;
  athlete_name: string;
  last_attempt: number;
  next_attempt_number: 1 | 2 | 3;
  last_result: 'success' | 'failure' | 'none';
  suggested_weight: number;
  declared_weight?: number;
  status: 'pending' | 'declared';
}

export const WeightDeclarations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { competitionId } = useParams<{ competitionId: string }>();
  const { athletes } = useAthleteStore();
  const { attempts } = useAttemptStore();
  const { weighIns } = useWeighInStore();
  const [declarations, setDeclarations] = useState<DeclarationRow[]>([]);
  const [liftType] = useState<LiftType>('squat');

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
            suggested_weight: openingWeight,
            declared_weight: openingWeight,
            status: 'declared',
          });
        }
      }
    });

    setDeclarations(rows);
  };

  const handleWeightChange = (athleteId: string, weight: number | null) => {
    if (weight === null) return;

    setDeclarations(prev =>
      prev.map(row =>
        row.athlete_id === athleteId
          ? { ...row, declared_weight: weight, status: 'declared' as const }
          : row
      )
    );
  };

  const handleSaveAll = () => {
    const undeclared = declarations.filter(d => d.status === 'pending' && d.last_attempt > 0);

    if (undeclared.length > 0) {
      message.warning(t('declarations.messages.undeclaredWarning', { count: undeclared.length }));
    } else {
      message.success(t('declarations.messages.saved'));
      // Here you would normally save to a store or database
    }
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
      width: 120,
      render: (num: number) => <Tag color="blue">#{num}</Tag>,
    },
    {
      title: t('declarations.suggestedWeight'),
      dataIndex: 'suggested_weight',
      key: 'suggested_weight',
      width: 150,
      render: (weight: number) => <Text type="secondary">{weight} kg</Text>,
    },
    {
      title: t('declarations.declaredWeight'),
      dataIndex: 'declared_weight',
      key: 'declared_weight',
      width: 200,
      render: (_: any, record: DeclarationRow) => (
        <InputNumber
          value={record.declared_weight}
          onChange={(value) => handleWeightChange(record.athlete_id, value)}
          min={20}
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
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'declared' ? 'green' : 'orange'} icon={status === 'declared' ? <CheckOutlined /> : undefined}>
          {status === 'declared' ? t('declarations.status.declared') : t('declarations.status.pending')}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space direction="vertical" size={0}>
            <Title level={3} style={{ margin: 0 }}>{t('declarations.title')}</Title>
            <Text type="secondary">{t('declarations.description')}</Text>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/competitions/${competitionId}/live`)}
            >
              {t('common.back')}
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAll}
            >
              {t('declarations.saveAll')}
            </Button>
          </Space>
        }
      >
        <Alert
          message={t('declarations.info.title')}
          description={t('declarations.info.description')}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={declarations}
          rowKey="athlete_id"
          pagination={false}
          locale={{
            emptyText: t('declarations.noDeclarations'),
          }}
        />
      </Card>
    </div>
  );
};
