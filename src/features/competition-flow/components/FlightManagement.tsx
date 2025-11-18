import { useEffect } from 'react';
import { Button, Card, Table, Tag, Alert, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import { useFlightStore } from '../stores/flightStore';
import { Flight } from '../../weigh-in/types';
import type { ColumnsType } from 'antd/es/table';

export const FlightManagement = () => {
  const { t } = useTranslation();
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { athletes, loadAthletes } = useAthleteStore();
  const { weighIns, loadWeighIns } = useWeighInStore();
  const { flights, loadFlights } = useFlightStore();

  useEffect(() => {
    if (competitionId) {
      loadAthletes(competitionId);
      loadWeighIns(competitionId);
      loadFlights(competitionId);
    }
  }, [competitionId, loadAthletes, loadWeighIns, loadFlights]);

  const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);
  const competitionWeighIns = weighIns.filter(w => w.competition_id === competitionId);
  const competitionFlights = flights.filter(f => f.competition_id === competitionId);

  const flightColumns: ColumnsType<Flight> = [
    {
      title: t('flight.flight'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('flight.fields.liftType'),
      dataIndex: 'lift_type',
      key: 'lift_type',
      render: (type: string) => (
        <Tag color={type === 'squat' ? 'blue' : type === 'bench' ? 'green' : 'red'}>
          {t(`live.lifts.${type}`).toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('athlete.title'),
      dataIndex: 'athlete_ids',
      key: 'athlete_ids',
      render: (ids: string[]) => ids.length,
    },
    {
      title: t('flight.fields.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'default' : status === 'active' ? 'green' : 'blue'}>
          {t(`flight.status.${status}`).toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('flight.title')}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/competitions/${competitionId}`)}
            >
              {t('common.back')}
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={t('flight.manualManagement')}
            description={t('flight.manualDescription')}
            type="info"
            showIcon
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Alert
            message={`${competitionWeighIns.length} / ${competitionAthletes.length} ${t('athlete.title')}`}
            type="info"
            showIcon={false}
          />
        </div>

        {competitionFlights.length > 0 && (
          <Table
            columns={flightColumns}
            dataSource={competitionFlights}
            rowKey="id"
            pagination={false}
          />
        )}

        {competitionFlights.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
            {t('flight.noFlights')}
          </div>
        )}
      </Card>
    </div>
  );
};
