import { Table, Card, Tag, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AttemptOrder } from '../../weigh-in/types';
import { TrophyOutlined } from '@ant-design/icons';

interface AttemptOrderListProps {
  attempts: AttemptOrder[];
  currentIndex: number;
  liftType: 'squat' | 'bench' | 'deadlift';
}

export const AttemptOrderList = ({ attempts, currentIndex, liftType }: AttemptOrderListProps) => {
  const columns: ColumnsType<AttemptOrder & { index: number }> = [
    {
      title: 'Order',
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
      title: 'Athlete',
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
      title: 'Attempt',
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
      title: 'Weight (kg)',
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
      title: 'Lot #',
      dataIndex: 'lot_number',
      key: 'lot_number',
      width: 80,
    },
    {
      title: 'Rack',
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
          style={{ marginBottom: 16, background: '#fffbe6', borderColor: '#faad14' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                CURRENT ATTEMPT
              </div>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {currentAttempt.athlete_name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                {liftType.toUpperCase()} - Attempt #{currentAttempt.attempt_number}
              </div>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14' }}>
                {currentAttempt.weight_kg} kg
              </div>
            </div>
          </div>
        </Card>
      )}

      {upcomingAttempts.length > 0 && (
        <Card
          title="Next Athletes"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {upcomingAttempts.map((attempt, idx) => (
              <div
                key={attempt.athlete_id + attempt.attempt_number}
                style={{
                  padding: 8,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  minWidth: 150,
                }}
              >
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {idx + 1}. {attempt.athlete_name}
                </div>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                  {attempt.weight_kg} kg
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Complete Order">
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
          background-color: #fffbe6 !important;
          font-weight: bold;
        }
        .completed-attempt-row {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};
