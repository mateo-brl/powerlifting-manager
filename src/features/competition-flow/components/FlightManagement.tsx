import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Alert, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import { calculateFlights, validateFlightBalance } from '../utils/flightCalculation';
import { Flight } from '../../weigh-in/types';
import type { ColumnsType } from 'antd/es/table';

export const FlightManagement = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { athletes, loadAthletes } = useAthleteStore();
  const { weighIns, loadWeighIns } = useWeighInStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [validation, setValidation] = useState<{ valid: boolean; warnings: string[] }>({
    valid: true,
    warnings: [],
  });

  useEffect(() => {
    if (competitionId) {
      loadAthletes(competitionId);
      loadWeighIns(competitionId);
    }
  }, [competitionId]);

  const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);
  const competitionWeighIns = weighIns.filter(w => w.competition_id === competitionId);

  const handleCalculateFlights = () => {
    if (competitionWeighIns.length === 0) {
      message.warning('No weigh-ins recorded yet');
      return;
    }

    const calculatedFlights = calculateFlights(competitionAthletes, competitionWeighIns);
    const validation = validateFlightBalance(calculatedFlights);

    setFlights(calculatedFlights);
    setValidation(validation);

    if (validation.valid) {
      message.success(`${calculatedFlights.length} flights created successfully`);
    } else {
      message.warning('Flights created with warnings');
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
            <Button type="primary" onClick={handleCalculateFlights}>
              Calculate Flights
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

        {flights.length > 0 && (
          <Table
            columns={flightColumns}
            dataSource={flights}
            rowKey="id"
            pagination={false}
          />
        )}

        {flights.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
            No flights calculated yet. Click "Calculate Flights" to generate flights automatically.
          </div>
        )}
      </Card>
    </div>
  );
};
