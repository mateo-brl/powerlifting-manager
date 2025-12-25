import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { LiftType } from '../../types';

export interface CompetitionInfoCardProps {
  currentLift: LiftType;
  currentIndex: number;
  totalAttempts: number;
  totalAthletes: number;
  weighedInCount: number;
  isCompetitionActive: boolean;
}

/**
 * Displays competition information and statistics
 */
export const CompetitionInfoCard = ({
  currentLift,
  currentIndex,
  totalAttempts,
  totalAthletes,
  weighedInCount,
  isCompetitionActive,
}: CompetitionInfoCardProps) => {
  const { t } = useTranslation();

  return (
    <Card title={t('live.competitionInfo.title')} size="small">
      <p>
        <strong>{t('live.currentLift')}:</strong> {currentLift.toUpperCase()}
      </p>
      <p>
        <strong>{t('live.attempt.result')}:</strong> {currentIndex + 1} / {totalAttempts}
      </p>
      <p>
        <strong>{t('live.competitionInfo.athletes')}:</strong> {totalAthletes}
      </p>
      <p>
        <strong>{t('live.competitionInfo.weighedIn')}:</strong> {weighedInCount}
      </p>
      <p>
        <strong>{t('competition.fields.status')}:</strong>{' '}
        {isCompetitionActive ? (
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>● {t('live.status.active')}</span>
        ) : (
          <span style={{ color: '#faad14' }}>● {t('live.status.paused')}</span>
        )}
      </p>
    </Card>
  );
};
