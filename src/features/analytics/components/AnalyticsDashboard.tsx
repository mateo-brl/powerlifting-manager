/**
 * Dashboard de statistiques et analytics avancées
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Space,
  Table,
  Tag,
  Tabs,
  Empty,
} from 'antd';
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ProgressionChart from './ProgressionChart';
import MultiLineChart from './MultiLineChart';
import {
  AthleteHistory,
  AthleteProgression,
  AthleteDetailedStats,
} from '../types';
import {
  calculateAthleteProgression,
  convertToChartData,
  calculateDetailedStats,
} from '../services/progressionCalculator';

const { Option } = Select;
const { TabPane } = Tabs;

interface AnalyticsDashboardProps {
  // Pour l'instant, on simule les données
  // En production, ces données viendraient de la base de données
  competitionId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
  const { t } = useTranslation();
  const [selectedAthlete, setSelectedAthlete] = useState<string | undefined>();
  const [progression, setProgression] = useState<AthleteProgression | null>(null);
  const [detailedStats, setDetailedStats] = useState<AthleteDetailedStats | null>(
    null
  );

  // Données simulées pour la démo
  const mockAthletes = [
    { id: '1', name: 'Jean Martin' },
    { id: '2', name: 'Sophie Bernard' },
    { id: '3', name: 'Pierre Dubois' },
  ];

  const mockHistory: AthleteHistory[] = [
    {
      id: '1',
      athlete_id: '1',
      competition_id: 'c1',
      competition_name: 'French Open 2023',
      competition_date: '2023-03-15',
      weight_class: '83',
      division: 'raw',
      best_squat: 180,
      best_bench: 120,
      best_deadlift: 220,
      total: 520,
      ipf_points: 385.5,
      wilks_score: 412.3,
      dots_score: 405.2,
      rank_category: 2,
      rank_absolute: 5,
      created_at: '2023-03-15T10:00:00Z',
    },
    {
      id: '2',
      athlete_id: '1',
      competition_id: 'c2',
      competition_name: 'National Championship 2023',
      competition_date: '2023-09-20',
      weight_class: '83',
      division: 'raw',
      best_squat: 190,
      best_bench: 125,
      best_deadlift: 230,
      total: 545,
      ipf_points: 402.1,
      wilks_score: 430.5,
      dots_score: 422.8,
      rank_category: 1,
      rank_absolute: 3,
      created_at: '2023-09-20T10:00:00Z',
    },
    {
      id: '3',
      athlete_id: '1',
      competition_id: 'c3',
      competition_name: 'Winter Cup 2024',
      competition_date: '2024-01-10',
      weight_class: '83',
      division: 'raw',
      best_squat: 195,
      best_bench: 130,
      best_deadlift: 235,
      total: 560,
      ipf_points: 413.2,
      wilks_score: 445.2,
      dots_score: 438.5,
      rank_category: 1,
      rank_absolute: 2,
      created_at: '2024-01-10T10:00:00Z',
    },
  ];

  useEffect(() => {
    if (selectedAthlete) {
      const athlete = mockAthletes.find((a) => a.id === selectedAthlete);
      if (athlete) {
        const prog = calculateAthleteProgression(
          athlete.id,
          athlete.name,
          mockHistory
        );
        setProgression(prog);

        const stats = calculateDetailedStats(athlete.id, athlete.name, mockHistory);
        setDetailedStats(stats);
      }
    } else {
      setProgression(null);
      setDetailedStats(null);
    }
  }, [selectedAthlete]);

  const chartData = progression ? convertToChartData(progression.history) : [];

  const renderOverviewStats = () => {
    if (!detailedStats) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('analytics.totalCompetitions', 'Compétitions')}
              value={detailedStats.total_competitions}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('analytics.successRate', 'Taux de Réussite')}
              value={detailedStats.success_rate}
              suffix="%"
              precision={1}
              valueStyle={{ color: detailedStats.success_rate > 80 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('analytics.bestTotal', 'Meilleur Total')}
              value={detailedStats.pr_total || 0}
              suffix="kg"
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('analytics.yearsActive', 'Années Actif')}
              value={detailedStats.years_active}
              suffix={t('analytics.years', 'ans')}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderProgressionStats = () => {
    if (!progression) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('analytics.squatProgression', 'Progression Squat')}
              value={progression.squat_progression}
              suffix="%"
              precision={1}
              prefix={
                progression.squat_progression >= 0 ? (
                  <RiseOutlined style={{ color: '#3f8600' }} />
                ) : (
                  <FallOutlined style={{ color: '#cf1322' }} />
                )
              }
              valueStyle={{
                color: progression.squat_progression >= 0 ? '#3f8600' : '#cf1322',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('analytics.benchProgression', 'Progression Bench')}
              value={progression.bench_progression}
              suffix="%"
              precision={1}
              prefix={
                progression.bench_progression >= 0 ? (
                  <RiseOutlined style={{ color: '#3f8600' }} />
                ) : (
                  <FallOutlined style={{ color: '#cf1322' }} />
                )
              }
              valueStyle={{
                color: progression.bench_progression >= 0 ? '#3f8600' : '#cf1322',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('analytics.deadliftProgression', 'Progression Deadlift')}
              value={progression.deadlift_progression}
              suffix="%"
              precision={1}
              prefix={
                progression.deadlift_progression >= 0 ? (
                  <RiseOutlined style={{ color: '#3f8600' }} />
                ) : (
                  <FallOutlined style={{ color: '#cf1322' }} />
                )
              }
              valueStyle={{
                color: progression.deadlift_progression >= 0 ? '#3f8600' : '#cf1322',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('analytics.totalProgression', 'Progression Total')}
              value={progression.total_progression}
              suffix="%"
              precision={1}
              prefix={
                progression.total_progression >= 0 ? (
                  <RiseOutlined style={{ color: '#3f8600' }} />
                ) : (
                  <FallOutlined style={{ color: '#cf1322' }} />
                )
              }
              valueStyle={{
                color: progression.total_progression >= 0 ? '#3f8600' : '#cf1322',
              }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderHistoryTable = () => {
    if (!progression) return null;

    const columns = [
      {
        title: t('analytics.competition', 'Compétition'),
        dataIndex: 'competition_name',
        key: 'competition_name',
      },
      {
        title: t('analytics.date', 'Date'),
        dataIndex: 'competition_date',
        key: 'date',
        render: (date: string) =>
          new Date(date).toLocaleDateString('fr-FR'),
      },
      {
        title: t('analytics.squat', 'Squat'),
        dataIndex: 'best_squat',
        key: 'squat',
        render: (value?: number) => (value ? `${value} kg` : '-'),
      },
      {
        title: t('analytics.bench', 'Bench'),
        dataIndex: 'best_bench',
        key: 'bench',
        render: (value?: number) => (value ? `${value} kg` : '-'),
      },
      {
        title: t('analytics.deadlift', 'Deadlift'),
        dataIndex: 'best_deadlift',
        key: 'deadlift',
        render: (value?: number) => (value ? `${value} kg` : '-'),
      },
      {
        title: t('analytics.total', 'Total'),
        dataIndex: 'total',
        key: 'total',
        render: (value?: number) => (value ? `${value} kg` : '-'),
      },
      {
        title: t('analytics.rank', 'Classement'),
        dataIndex: 'rank_category',
        key: 'rank',
        render: (value?: number) =>
          value ? (
            <Tag color={value === 1 ? 'gold' : value === 2 ? 'silver' : 'blue'}>
              #{value}
            </Tag>
          ) : (
            '-'
          ),
      },
    ];

    return (
      <Table
        dataSource={progression.history}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <LineChartOutlined style={{ fontSize: 24 }} />
            {t('analytics.dashboard', 'Dashboard Statistiques & Analytics')}
          </Space>
        }
        extra={
          <Select
            style={{ width: 250 }}
            placeholder={t('analytics.selectAthlete', 'Sélectionner un athlète')}
            onChange={setSelectedAthlete}
            value={selectedAthlete}
          >
            {mockAthletes.map((athlete) => (
              <Option key={athlete.id} value={athlete.id}>
                {athlete.name}
              </Option>
            ))}
          </Select>
        }
      >
        {!selectedAthlete ? (
          <Empty
            description={t(
              'analytics.selectAthletePrompt',
              'Sélectionnez un athlète pour voir ses statistiques'
            )}
          />
        ) : (
          <Tabs defaultActiveKey="overview">
            <TabPane
              tab={
                <span>
                  <BarChartOutlined />
                  {t('analytics.overview', 'Vue d\'ensemble')}
                </span>
              }
              key="overview"
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {renderOverviewStats()}
                {renderProgressionStats()}
              </Space>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <LineChartOutlined />
                  {t('analytics.progression', 'Progression')}
                </span>
              }
              key="progression"
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <MultiLineChart
                  data={chartData}
                  metrics={['squat', 'bench', 'deadlift', 'total']}
                  title={t('analytics.liftsProgression', 'Progression des Mouvements')}
                  height={400}
                />
                <ProgressionChart
                  data={chartData}
                  metric="ipf_points"
                  title={t('analytics.ipfPointsProgression', 'Progression IPF Points')}
                  height={350}
                />
              </Space>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <TrophyOutlined />
                  {t('analytics.history', 'Historique')}
                </span>
              }
              key="history"
            >
              {renderHistoryTable()}
            </TabPane>
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
