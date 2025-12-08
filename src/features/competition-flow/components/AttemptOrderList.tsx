import { Table, Card, Tag, Badge, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { AttemptOrder } from '../../weigh-in/types';
import { TrophyOutlined } from '@ant-design/icons';

interface AttemptOrderListProps {
  attempts: AttemptOrder[];
  currentIndex: number;
  liftType: 'squat' | 'bench' | 'deadlift';
}

export const AttemptOrderList = ({ attempts, currentIndex, liftType }: AttemptOrderListProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const columns: ColumnsType<AttemptOrder & { index: number }> = [
    {
      title: t('rankings.rank'),
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (index: number) => {
        if (index === currentIndex) {
          return <Badge status="processing" text={`#${index + 1}`} />;
        }
        if (index < currentIndex) {
          return <Badge status="success" text={`#${index + 1}`} />;
        }
        return `#${index + 1}`;
      },
    },
    {
      title: t('rankings.athlete'),
      dataIndex: 'athlete_name',
      key: 'athlete_name',
      render: (name: string, record) => {
        const isCurrent = record.index === currentIndex;
        return (
          <span style={{ fontWeight: isCurrent ? 'bold' : 'normal' }}>
            {isCurrent && <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />}
            {name}
          </span>
        );
      },
    },
    {
      title: t('externalDisplay.attempt'),
      dataIndex: 'attempt_number',
      key: 'attempt_number',
      width: 100,
      render: (attempt: number) => (
        <Tag color={attempt === 1 ? 'green' : attempt === 2 ? 'blue' : 'purple'}>
          #{attempt}
        </Tag>
      ),
    },
    {
      title: t('externalDisplay.weight') + ' (kg)',
      dataIndex: 'weight_kg',
      key: 'weight_kg',
      width: 120,
      render: (weight: number) => (
        <span style={{ fontSize: 16, fontWeight: 'bold' }}>
          {weight} kg
        </span>
      ),
    },
    {
      title: t('athlete.fields.lotNumber'),
      dataIndex: 'lot_number',
      key: 'lot_number',
      width: 80,
    },
    {
      title: t('spottersDisplay.rackHeights.rack'),
      dataIndex: 'rack_height',
      key: 'rack_height',
      width: 80,
      render: (height?: number) => height || '-',
    },
  ];

  const dataWithIndex = attempts.map((attempt, index) => ({
    ...attempt,
    index,
  }));

  const currentAttempt = currentIndex >= 0 && currentIndex < attempts.length
    ? attempts[currentIndex]
    : null;

  const upcomingAttempts = attempts.slice(currentIndex + 1, currentIndex + 4);

  return (
    <div>
      {currentAttempt && (
        <Card
          style={{ marginBottom: 16, background: token.colorWarningBg, borderColor: token.colorWarning }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: token.colorTextSecondary, marginBottom: 4 }}>
                {t('live.currentAthlete').toUpperCase()}
              </div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: token.colorText }}>
                {currentAttempt.athlete_name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: token.colorTextSecondary, marginBottom: 4 }}>
                {liftType.toUpperCase()} - {t('live.attempt.number', { number: currentAttempt.attempt_number })}
              </div>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: token.colorWarning }}>
                {currentAttempt.weight_kg} kg
              </div>
            </div>
          </div>
        </Card>
      )}

      {upcomingAttempts.length > 0 && (
        <Card
          title={t('live.nextAthlete')}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {upcomingAttempts.map((attempt, idx) => (
              <div
                key={attempt.athlete_id + attempt.attempt_number}
                style={{
                  padding: 8,
                  background: token.colorBgLayout,
                  borderRadius: token.borderRadius,
                  minWidth: 150,
                }}
              >
                <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                  {idx + 1}. {attempt.athlete_name}
                </div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: token.colorText }}>
                  {attempt.weight_kg} kg
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title={t('live.attemptOrder')}>
        <Table
          columns={columns}
          dataSource={dataWithIndex}
          rowKey={(record) => `${record.athlete_id}-${record.attempt_number}`}
          pagination={false}
          size="small"
          rowClassName={(record) => {
            if (record.index === currentIndex) return 'current-attempt-row';
            if (record.index < currentIndex) return 'completed-attempt-row';
            return '';
          }}
        />
      </Card>

      <style>{`
        .current-attempt-row {
          background-color: ${token.colorWarningBg} !important;
          font-weight: bold;
        }
        .completed-attempt-row {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};
