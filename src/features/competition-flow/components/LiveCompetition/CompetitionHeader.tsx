import { Select, Button, Space, Typography, Tooltip } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LiftType } from '../../types';

const { Title, Text } = Typography;

export interface CompetitionHeaderProps {
  competitionId: string | undefined;
  competitionName: string;
  competitionFormat: 'full_power' | 'bench_only';
  currentLift: LiftType;
  isCompetitionActive: boolean;
  hasAttempts: boolean;
  onChangeLift: (lift: LiftType) => void;
  onStart: () => void;
  onPause: () => void;
  onShowHelp: () => void;
}

/**
 * Competition header with lift selector and start/pause controls
 */
export const CompetitionHeader = ({
  competitionId,
  competitionName,
  competitionFormat,
  currentLift,
  isCompetitionActive,
  hasAttempts,
  onChangeLift,
  onStart,
  onPause,
  onShowHelp,
}: CompetitionHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get available lifts based on competition format
  const getAvailableLifts = () => {
    if (competitionFormat === 'bench_only') {
      return [{ value: 'bench', label: t('live.lifts.bench') }];
    }
    return [
      { value: 'squat', label: t('live.lifts.squat') },
      { value: 'bench', label: t('live.lifts.bench') },
      { value: 'deadlift', label: t('live.lifts.deadlift') },
    ];
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>{t('live.title')}</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {competitionName} • {t('competition.format.label')}:{' '}
          {competitionFormat === 'bench_only' ? t('competition.format.bench') : t('competition.format.sbd')}
        </Text>
      </div>
      <Space>
        <Select
          value={currentLift}
          onChange={onChangeLift}
          style={{ width: 150 }}
          size="large"
          disabled={isCompetitionActive}
          options={getAvailableLifts()}
        />
        {!isCompetitionActive ? (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onStart}
            size="large"
            disabled={!hasAttempts}
          >
            {t('live.start')}
          </Button>
        ) : (
          <Button
            icon={<PauseCircleOutlined />}
            onClick={onPause}
            size="large"
          >
            {t('live.pause')}
          </Button>
        )}
        <Tooltip title={t('shortcuts.title') + ' (?)'}>
          <Button
            icon={<QuestionCircleOutlined />}
            onClick={onShowHelp}
          />
        </Tooltip>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/competitions/${competitionId}`)}
        >
          {t('common.back')}
        </Button>
      </Space>
    </div>
  );
};
