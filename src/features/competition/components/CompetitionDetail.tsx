import { useEffect } from 'react';
import { Card, Descriptions, Button, Space, Tag, message, Tabs, Row, Col } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserAddOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ImportOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useCompetitionStore } from '../stores/competitionStore';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { formatDate } from '../../../shared/utils/formatters';
import { AthleteList } from '../../athlete/components/AthleteList';

export const CompetitionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { competitions } = useCompetitionStore();
  const { loadAthletes } = useAthleteStore();

  const competition = competitions.find((c) => c.id === id);

  useEffect(() => {
    if (id) {
      loadCompetitionData(id);
    }
  }, [id]);

  const loadCompetitionData = async (competitionId: string) => {
    try {
      await loadAthletes(competitionId);
    } catch (error) {
      message.error('Failed to load competition data');
      console.error(error);
    }
  };

  if (!competition) {
    return (
      <Card>
        <p>Competition not found</p>
        <Button onClick={() => navigate('/competitions')}>Back to List</Button>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'upcoming':
        return 'orange';
      default:
        return 'default';
    }
  };

  const tabItems = [
    {
      key: 'athletes',
      label: 'Athletes',
      children: <AthleteList competitionId={competition.id} />,
    },
    {
      key: 'actions',
      label: 'Competition Actions',
      children: (
        <div>
          <h3 style={{ marginBottom: 16 }}>Competition Management</h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/weigh-in`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <TeamOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                <h3>Weigh-In / Pesée</h3>
                <p>Record athlete bodyweights and opening attempts</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/flights`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <TeamOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                <h3>Flight Management</h3>
                <p>Calculate and manage competition flights</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/live`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <TrophyOutlined style={{ fontSize: 48, color: '#f5222d', marginBottom: 16 }} />
                <h3>Live Competition</h3>
                <p>Manage real-time competition flow</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/rankings`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <BarChartOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                <h3>Rankings & Results</h3>
                <p>View competition standings and results</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/athletes/import`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <ImportOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                <h3>Import Athletes</h3>
                <p>Bulk import athletes from CSV file</p>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'info',
      label: 'Information',
      children: (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Competition Name">{competition.name}</Descriptions.Item>
          <Descriptions.Item label="Date">{formatDate(competition.date)}</Descriptions.Item>
          <Descriptions.Item label="Location">{competition.location || '-'}</Descriptions.Item>
          <Descriptions.Item label="Federation">{competition.federation}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(competition.status)}>
              {competition.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created">{formatDate(competition.created_at)}</Descriptions.Item>
          <Descriptions.Item label="Last Updated">{formatDate(competition.updated_at)}</Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={competition.name}
        extra={
          <Space>
            <Button
              icon={<UserAddOutlined />}
              onClick={() => navigate(`/competitions/${competition.id}/athletes/new`)}
            >
              Add Athlete
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/competitions/${competition.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/competitions')}
            >
              Back
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="actions" items={tabItems} />
      </Card>
    </div>
  );
};
