import { useState } from 'react';
import { Card, Button, Space, message, Progress, Typography, Divider, InputNumber, Alert } from 'antd';
import { ThunderboltOutlined, TrophyOutlined, UserAddOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompetitionStore } from '../features/competition/stores/competitionStore';
import { useAthleteStore } from '../features/athlete/stores/athleteStore';
import { useWeighInStore } from '../features/weigh-in/stores/weighInStore';
import { useAttemptStore } from '../features/competition-flow/stores/attemptStore';
import { initializeMockCompetition } from '../shared/utils/mockData';

const { Title, Text } = Typography;

export const DemoDataInitializer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createCompetition } = useCompetitionStore();
  const { createAthlete } = useAthleteStore();
  const { createWeighIn } = useWeighInStore();
  const { createAttempt } = useAttemptStore();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [athleteCount, setAthleteCount] = useState(20);
  const [demoCompetitionId, setDemoCompetitionId] = useState<string | null>(null);

  const generateMockAttempts = async (competitionId: string, athletes: any[], weighIns: any[]) => {
    // Generate some random attempts for demo purposes
    const liftTypes = ['squat', 'bench', 'deadlift'] as const;
    const totalAttempts = Math.min(athletes.length * 3, 30); // Max 30 attempts for demo

    for (let i = 0; i < totalAttempts; i++) {
      const athlete = athletes[i % athletes.length];
      const weighIn = weighIns.find(w => w.athlete_id === athlete.id);
      if (!weighIn) continue;

      const liftType = liftTypes[Math.floor(i / athletes.length)];
      const attemptNumber = (i % 3) + 1 as 1 | 2 | 3;

      // Get opening weight for this lift
      let baseWeight = weighIn[`opening_${liftType}`];

      // Add progression for 2nd and 3rd attempts
      if (attemptNumber === 2) baseWeight += 5 + Math.random() * 10;
      if (attemptNumber === 3) baseWeight += 10 + Math.random() * 15;

      const weight = Math.round(baseWeight / 2.5) * 2.5;

      // Create attempt
      const attempt = await createAttempt({
        athlete_id: athlete.id,
        competition_id: competitionId,
        lift_type: liftType,
        attempt_number: attemptNumber,
        weight_kg: weight,
        rack_height: weighIn[`${liftType}_rack_height`],
      });

      // Note: In a real scenario, we would also update the attempt with referee votes
      // For demo purposes, we just create the attempts
      await createAttempt({
        athlete_id: attempt.athlete_id,
        competition_id: attempt.competition_id,
        lift_type: attempt.lift_type,
        attempt_number: attempt.attempt_number,
        weight_kg: attempt.weight_kg,
      });
    }
  };

  const handleGenerateDemo = async () => {
    setLoading(true);
    setProgress(0);

    try {
      message.info(t('dashboard.demoData.description'));
      setProgress(10);

      // Create competition with athletes and weigh-ins
      const { competition, athletes, weighIns } = await initializeMockCompetition(
        createCompetition,
        createAthlete,
        createWeighIn,
        athleteCount
      );

      setProgress(50);
      message.success(t('competition.messages.created') + ` - ${athletes.length} ${t('athlete.title').toLowerCase()}`);

      // Generate some mock attempts
      message.info(t('dashboard.demoData.description'));
      await generateMockAttempts(competition.id, athletes, weighIns);

      setProgress(100);
      setDemoCompetitionId(competition.id);

      message.success({
        content: t('dashboard.demoData.success'),
        duration: 5,
      });

    } catch (error) {
      message.error(t('dashboard.demoData.error'));
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#faad14' }} />
          <Title level={4} style={{ margin: 0 }}>{t('dashboard.demoData.title')}</Title>
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      <Alert
        message={t('dashboard.demoData.title')}
        description={t('dashboard.demoData.description')}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong>{t('athlete.total')}:</Text>
          <InputNumber
            value={athleteCount}
            onChange={(val) => val && setAthleteCount(val)}
            min={5}
            max={50}
            style={{ marginLeft: 16, width: 120 }}
            disabled={loading}
          />
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <Button
          type="primary"
          size="large"
          icon={<TrophyOutlined />}
          onClick={handleGenerateDemo}
          loading={loading}
          block
          style={{ height: 50, fontSize: 16, fontWeight: 'bold' }}
        >
          {loading ? t('common.loading') : t('dashboard.demoData.button')}
        </Button>

        {loading && (
          <Progress percent={progress} status="active" strokeColor="#52c41a" />
        )}

        {demoCompetitionId && !loading && (
          <div>
            <Alert
              message={t('dashboard.demoData.success')}
              type="success"
              showIcon
              style={{ marginBottom: 12 }}
            />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<UserAddOutlined />}
                onClick={() => navigate(`/competitions/${demoCompetitionId}`)}
                block
              >
                {t('competition.view')}
              </Button>

              <Button
                icon={<CheckSquareOutlined />}
                onClick={() => navigate(`/competitions/${demoCompetitionId}/weigh-in`)}
                block
              >
                {t('weighIn.title')}
              </Button>

              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => navigate(`/competitions/${demoCompetitionId}/live`)}
                block
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                {t('live.title')}
              </Button>

              <Button
                icon={<TrophyOutlined />}
                onClick={() => navigate(`/competitions/${demoCompetitionId}/rankings`)}
                block
              >
                {t('rankings.title')}
              </Button>
            </Space>
          </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
          <Text type="secondary">
            {t('dashboard.demoData.description')}
          </Text>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>{t('competition.new')}</li>
            <li>{athleteCount} {t('athlete.title').toLowerCase()}</li>
            <li>{t('weighIn.title')}</li>
            <li>{t('live.attemptTracker')}</li>
            <li>{t('live.title')}</li>
          </ul>
        </div>
      </Space>
    </Card>
  );
};
