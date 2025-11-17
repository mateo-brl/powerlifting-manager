import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Alert, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import { useFlightStore } from '../stores/flightStore';
import { calculateFlights, validateFlightBalance } from '../utils/flightCalculation';
import { Flight } from '../../weigh-in/types';
import type { ColumnsType } from 'antd/es/table';

export const FlightManagement = () => {
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
      message.warning('No weigh-ins recorded yet');
      return;
    }

    if (!competitionId) {
      message.error('No competition ID');
      return;
    }

    try {
      // Delete existing flights for this competition
      await deleteFlightsByCompetition(competitionId);

      // Calculate new flights
      const calculatedFlights = calculateFlights(competitionAthletes, competitionWeighIns);
      const validation = validateFlightBalance(calculatedFlights);

      // Save flights to database
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
        message.success(`${calculatedFlights.length} flights created successfully`);
      } else {
        message.warning('Flights created with warnings');
      }
    } catch (error) {
      message.error('Failed to create flights');
      console.error(error);
    }
  };

  const handleRecalculate = async () => {
    if (!competitionId) return;

    try {
      await deleteFlightsByCompetition(competitionId);
      message.info('Flights cleared. Click "Calculate Flights" to regenerate.');
      setValidation({ valid: true, warnings: [] });
    } catch (error) {
      message.error('Failed to clear flights');
      console.error(error);
    }
  };

  const flightColumns: ColumnsType<Flight> = [
    {
      title: 'Flight',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Lift Type',
      dataIndex: 'lift_type',
      key: 'lift_type',
      render: (type: string) => (
        <Tag color={type === 'squat' ? 'blue' : type === 'bench' ? 'green' : 'red'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Athletes',
      dataIndex: 'athlete_ids',
      key: 'athlete_ids',
      render: (ids: string[]) => ids.length,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'default' : status === 'active' ? 'green' : 'blue'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Flight Management"
        extra={
          <Space>
            {competitionFlights.length > 0 && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRecalculate}
                danger
              >
                Clear Flights
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleCalculateFlights}
              disabled={competitionWeighIns.length === 0}
            >
              {competitionFlights.length > 0 ? 'Recalculate Flights' : 'Calculate Flights'}
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/competitions/${competitionId}`)}
            >
              Back
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="Flight Calculation"
            description={`${competitionWeighIns.length} athletes weighed in out of ${competitionAthletes.length} total. Max ${14} athletes per flight.`}
            type="info"
            showIcon
          />
        </div>

        {validation.warnings.length > 0 && (
          <Alert
            message="Warnings"
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
            No flights calculated yet. Click "Calculate Flights" to generate flights automatically.
          </div>
        )}
      </Card>
    </div>
  );
};
