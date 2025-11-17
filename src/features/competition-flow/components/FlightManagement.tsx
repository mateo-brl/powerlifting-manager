import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Alert, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import { useFlightStore } from '../stores/flightStore';
import { calculateFlights, validateFlightBalance } from '../utils/flightCalculation';
import { Flight } from '../../weigh-in/types';
import type { ColumnsType } from 'antd/es/table';

export const FlightManagement = () => {
  const { t } = useTranslation();
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { athletes, loadAthletes } = useAthleteStore();
  const { weighIns, loadWeighIns } = useWeighInStore();
  const { flights, loadFlights, createFlight, deleteFlightsByCompetition } = useFlightStore();
  const [validation, setValidation] = useState<{ valid: boolean; warnings: string[] }>({
    valid: true,
    warnings: [],
  });

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

  const handleCalculateFlights = async () => {
    if (competitionWeighIns.length === 0) {
      message.warning(t('flight.messages.tooFewAthletes'));
      return;
    }

    if (!competitionId) {
      message.error(t('competition.messages.error'));
      return;
    }

    try {
      await deleteFlightsByCompetition(competitionId);

      const calculatedFlights = calculateFlights(competitionAthletes, competitionWeighIns);
      const validation = validateFlightBalance(calculatedFlights);

      for (const flight of calculatedFlights) {
        await createFlight({
          competition_id: competitionId,
          name: flight.name,
          athlete_ids: flight.athlete_ids,
          lift_type: flight.lift_type,
          status: flight.status,
        });
      }

      setValidation(validation);

      if (validation.valid) {
        message.success(t('flight.messages.calculated'));
      } else {
        message.warning(t('flight.messages.unbalanced'));
      }
    } catch (error) {
      message.error(t('flight.messages.error'));
      console.error(error);
    }
  };

  const handleRecalculate = async () => {
    if (!competitionId) return;

    try {
      await deleteFlightsByCompetition(competitionId);
      message.info(t('flight.messages.calculated'));
      setValidation({ valid: true, warnings: [] });
    } catch (error) {
      message.error(t('flight.messages.error'));
      console.error(error);
    }
  };

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
            {competitionFlights.length > 0 && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRecalculate}
                danger
              >
                {t('flight.recalculate')}
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleCalculateFlights}
              disabled={competitionWeighIns.length === 0}
            >
              {competitionFlights.length > 0 ? t('flight.recalculate') : t('flight.calculate')}
            </Button>
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
            message={t('flight.title')}
            description={`${competitionWeighIns.length} / ${competitionAthletes.length} ${t('athlete.title')}`}
            type="info"
            showIcon
          />
        </div>

        {validation.warnings.length > 0 && (
          <Alert
            message={t('common.warning')}
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validation.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

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
