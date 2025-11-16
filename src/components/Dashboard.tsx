import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { TrophyOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCompetitionStore } from '../features/competition/stores/competitionStore';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { competitions, loadCompetitions } = useCompetitionStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadCompetitions();
    } catch (error) {
      console.error('Failed to load competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingCompetitions = competitions.filter((c) => c.status === 'upcoming');
  const activeCompetitions = competitions.filter((c) => c.status === 'in_progress');
  const completedCompetitions = competitions.filter((c) => c.status === 'completed');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>Dashboard</h1>
        <p>Welcome to Powerlifting Manager</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Competitions"
              value={competitions.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Upcoming"
              value={upcomingCompetitions.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Active"
              value={activeCompetitions.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Completed"
              value={completedCompetitions.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Quick Actions"
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/competitions/new')}
            >
              New Competition
            </Button>
          </Col>
          <Col>
            <Button
              icon={<TrophyOutlined />}
              size="large"
              onClick={() => navigate('/competitions')}
            >
              View All Competitions
            </Button>
          </Col>
        </Row>
      </Card>

      {activeCompetitions.length > 0 && (
        <Card title="Active Competitions" loading={loading}>
          {activeCompetitions.map((comp) => (
            <Card.Grid
              key={comp.id}
              style={{ width: '33.33%', cursor: 'pointer' }}
              onClick={() => navigate(`/competitions/${comp.id}`)}
            >
              <div>
                <h3>{comp.name}</h3>
                <p>{comp.date}</p>
                <p>{comp.location}</p>
              </div>
            </Card.Grid>
          ))}
        </Card>
      )}
    </div>
  );
};
