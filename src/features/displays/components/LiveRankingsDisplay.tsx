/**
 * Écran de classements en direct pour affichage mural
 * Compatible avec projecteurs et écrans de grande taille
 */

import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Avatar, Space, Typography } from 'antd';
import {
  TrophyOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface RankingAthlete {
  id: string;
  rank: number;
  name: string;
  country?: string;
  team?: string;
  athlete_photo?: string;
  team_logo?: string;
  weight_class: string;
  division: string;
  best_squat?: number;
  best_bench?: number;
  best_deadlift?: number;
  total: number;
  ipf_points: number;
  trend?: 'up' | 'down' | 'stable'; // Tendance du classement
}

interface LiveRankingsDisplayProps {
  competitionName: string;
  category?: string; // 'M-83kg-Raw' par exemple
  showAbsolute?: boolean; // Classement absolu ou par catégorie
}

const LiveRankingsDisplay: React.FC<LiveRankingsDisplayProps> = ({
  competitionName,
  category,
  showAbsolute = false,
}) => {
  const { t } = useTranslation();
  const [rankings, setRankings] = useState<RankingAthlete[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data pour la démo
  const mockRankings: RankingAthlete[] = [
    {
      id: '1',
      rank: 1,
      name: 'John Smith',
      country: 'USA',
      team: 'Westside Barbell',
      athlete_photo: '/images/athletes/athlete1.jpg',
      team_logo: '/images/teams/westside.png',
      weight_class: '83',
      division: 'raw',
      best_squat: 245,
      best_bench: 185,
      best_deadlift: 285,
      total: 715,
      ipf_points: 498.5,
      trend: 'stable',
    },
    {
      id: '2',
      rank: 2,
      name: 'Jean Dupont',
      country: 'FRA',
      team: 'Force Athlétique Paris',
      weight_class: '83',
      division: 'raw',
      best_squat: 235,
      best_bench: 180,
      best_deadlift: 275,
      total: 690,
      ipf_points: 485.2,
      trend: 'up',
    },
    {
      id: '3',
      rank: 3,
      name: 'Hans Mueller',
      country: 'GER',
      team: 'Berlin Powerlifting',
      weight_class: '83',
      division: 'raw',
      best_squat: 230,
      best_bench: 175,
      best_deadlift: 270,
      total: 675,
      ipf_points: 472.8,
      trend: 'down',
    },
  ];

  useEffect(() => {
    // Simuler la mise à jour en temps réel
    setRankings(mockRankings);
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return null;

    // Utiliser les emojis de drapeaux (Unicode)
    const flags: Record<string, string> = {
      FRA: '🇫🇷',
      USA: '🇺🇸',
      GBR: '🇬🇧',
      GER: '🇩🇪',
      CAN: '🇨🇦',
      AUS: '🇦🇺',
      JPN: '🇯🇵',
      RUS: '🇷🇺',
      CHN: '🇨🇳',
      BRA: '🇧🇷',
    };

    return flags[countryCode] || '🏴';
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Or
    if (rank === 2) return '#C0C0C0'; // Argent
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#1890ff';
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up')
      return <RiseOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
    if (trend === 'down')
      return <FallOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    return null;
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 'bold',
            color: getRankColor(rank),
          }}
        >
          {rank <= 3 && <TrophyOutlined style={{ marginRight: 8 }} />}
          {rank}
        </div>
      ),
    },
    {
      title: t('rankings.athlete', 'Athlète'),
      key: 'athlete',
      width: 350,
      render: (_: any, record: RankingAthlete) => (
        <Space size="middle">
          <Avatar
            size={64}
            src={record.athlete_photo}
            icon={!record.athlete_photo && <UserOutlined />}
          />
          <div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {record.name}
              {getTrendIcon(record.trend)}
            </div>
            <Space>
              {record.country && (
                <Text style={{ fontSize: 18 }}>
                  {getCountryFlag(record.country)} {record.country}
                </Text>
              )}
              {record.team && (
                <Tag color="blue" style={{ fontSize: 14 }}>
                  {record.team}
                </Tag>
              )}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: t('rankings.squat', 'Squat'),
      dataIndex: 'best_squat',
      key: 'squat',
      width: 120,
      render: (value?: number) => (
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
          {value ? `${value} kg` : '-'}
        </Text>
      ),
    },
    {
      title: t('rankings.bench', 'Bench'),
      dataIndex: 'best_bench',
      key: 'bench',
      width: 120,
      render: (value?: number) => (
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
          {value ? `${value} kg` : '-'}
        </Text>
      ),
    },
    {
      title: t('rankings.deadlift', 'Deadlift'),
      dataIndex: 'best_deadlift',
      key: 'deadlift',
      width: 120,
      render: (value?: number) => (
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
          {value ? `${value} kg` : '-'}
        </Text>
      ),
    },
    {
      title: t('rankings.total', 'Total'),
      dataIndex: 'total',
      key: 'total',
      width: 150,
      render: (value: number) => (
        <Text
          style={{
            fontSize: 26,
            fontWeight: 'bold',
            color: '#722ed1',
          }}
        >
          {value} kg
        </Text>
      ),
    },
    {
      title: 'IPF Points',
      dataIndex: 'ipf_points',
      key: 'ipf_points',
      width: 150,
      render: (value: number) => (
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#faad14' }}>
          {value.toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '32px',
      }}
    >
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <Title level={1} style={{ color: '#722ed1', marginBottom: 8 }}>
            <TrophyOutlined /> {competitionName}
          </Title>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 16 }}>
            {showAbsolute
              ? t('rankings.absoluteRankings', 'Classement Absolu')
              : t('rankings.categoryRankings', 'Classement par Catégorie')}
            {category && ` - ${category}`}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {t('rankings.lastUpdate', 'Dernière mise à jour')}:{' '}
            {lastUpdate.toLocaleTimeString('fr-FR')}
          </Text>
        </div>

        <Table
          dataSource={rankings}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="large"
          rowClassName={(record) =>
            record.rank <= 3 ? 'podium-row' : ''
          }
          style={{
            fontSize: '18px',
          }}
        />
      </Card>

      <style>{`
        .podium-row {
          background: linear-gradient(to right, rgba(255, 215, 0, 0.1), transparent) !important;
        }
        .ant-table-thead > tr > th {
          font-size: 20px !important;
          font-weight: bold !important;
          background: #722ed1 !important;
          color: white !important;
        }
        .ant-table-tbody > tr {
          height: 100px;
        }
        .ant-table-tbody > tr:hover {
          background: rgba(114, 46, 209, 0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default LiveRankingsDisplay;
