import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { TrophyOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompetitionStore } from '../features/competition/stores/competitionStore';
import { DemoDataInitializer } from './DemoDataInitializer';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.welcome')}</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={t('dashboard.stats.totalCompetitions')}
              value={competitions.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={t('competition.status.upcoming')}
              value={upcomingCompetitions.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={t('dashboard.stats.activeCompetitions')}
              value={activeCompetitions.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={t('competition.status.completed')}
              value={completedCompetitions.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={t('live.quickActions.title')}>
            <Row gutter={16}>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate('/competitions/new')}
                >
                  {t('dashboard.newCompetition')}
                </Button>
              </Col>
              <Col>
                <Button
                  icon={<TrophyOutlined />}
                  size="large"
                  onClick={() => navigate('/competitions')}
                >
                  {t('competition.list')}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <DemoDataInitializer />
        </Col>
      </Row>

      {activeCompetitions.length > 0 && (
        <Card title={t('dashboard.stats.activeCompetitions')} loading={loading}>
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
