import { useEffect } from 'react';
import { Card, Descriptions, Button, Space, Tag, message, Tabs, Row, Col } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserAddOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ImportOutlined,
  SafetyOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompetitionStore } from '../stores/competitionStore';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { formatDate } from '../../../shared/utils/formatters';
import { AthleteList } from '../../athlete/components/AthleteList';

export const CompetitionDetail = () => {
  const { t } = useTranslation();
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
      message.error(t('competition.messages.error'));
      console.error(error);
    }
  };

  if (!competition) {
    return (
      <Card>
        <p>{t('errors.notFound')}</p>
        <Button onClick={() => navigate('/competitions')}>{t('common.back')}</Button>
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
      label: t('competition.tabs.athletes'),
      children: <AthleteList competitionId={competition.id} />,
    },
    {
      key: 'actions',
      label: t('competition.actions'),
      children: (
        <div>
          <h3 style={{ marginBottom: 16 }}>{t('competition.actions')}</h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/weigh-in`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <TeamOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                <h3>{t('weighIn.title')}</h3>
                <p>{t('weighIn.title')}</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/flights`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <TeamOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                <h3>{t('flight.title')}</h3>
                <p>{t('flight.title')}</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/live`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <TrophyOutlined style={{ fontSize: 48, color: '#f5222d', marginBottom: 16 }} />
                <h3>{t('competition.tabs.live')}</h3>
                <p>{t('live.title')}</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/rankings`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <BarChartOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                <h3>{t('rankings.title')}</h3>
                <p>{t('rankings.title')}</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/athletes/import`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <ImportOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                <h3>{t('athlete.import')}</h3>
                <p>{t('athlete.import')}</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/equipment`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <SafetyOutlined style={{ fontSize: 48, color: '#13c2c2', marginBottom: 16 }} />
                <h3>{t('equipment.validationList')}</h3>
                <p>{t('equipment.validationTitle')}</p>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/competitions/${competition.id}/jury`)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
              >
                <AuditOutlined style={{ fontSize: 48, color: '#eb2f96', marginBottom: 16 }} />
                <h3>{t('protest.juryPanel')}</h3>
                <p>{t('protest.pendingProtests')}</p>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'info',
      label: t('common.info'),
      children: (
        <Descriptions bordered column={1}>
          <Descriptions.Item label={t('competition.fields.name')}>{competition.name}</Descriptions.Item>
          <Descriptions.Item label={t('competition.fields.date')}>{formatDate(competition.date)}</Descriptions.Item>
          <Descriptions.Item label={t('competition.fields.location')}>{competition.location || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('competition.fields.federation')}>{competition.federation}</Descriptions.Item>
          <Descriptions.Item label={t('competition.fields.status')}>
            <Tag color={getStatusColor(competition.status)}>
              {t(`competition.status.${competition.status}`).toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('competition.fields.createdAt')}>{formatDate(competition.created_at)}</Descriptions.Item>
          <Descriptions.Item label={t('competition.fields.updatedAt')}>{formatDate(competition.updated_at)}</Descriptions.Item>
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
              {t('athlete.new')}
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/competitions/${competition.id}/edit`)}
            >
              {t('common.edit')}
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/competitions')}
            >
              {t('common.back')}
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="actions" items={tabItems} />
      </Card>
    </div>
  );
};
