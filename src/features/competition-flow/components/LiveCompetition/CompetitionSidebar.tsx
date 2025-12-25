import { Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { Timer } from '../Timer';
import { QuickDeclarationWidget } from '../QuickDeclarationWidget';
import { CompetitionInfoCard } from './CompetitionInfoCard';
import { QuickActionsCard } from './QuickActionsCard';
import { LiftType } from '../../types';
import { AttemptOrder } from '../../../weigh-in/types';

export interface CompetitionSidebarProps {
  competitionId: string | undefined;
  currentLift: LiftType;
  currentIndex: number;
  currentAttempt: AttemptOrder | undefined;
  totalAttempts: number;
  totalAthletes: number;
  weighedInCount: number;
  isCompetitionActive: boolean;
  onDeclarationChange: () => void;
  onOpenDeclarationsModal: () => void;
  onOpenExternalDisplay: () => Promise<void>;
  onOpenSpottersDisplay: () => Promise<void>;
  onOpenWarmupDisplay: () => Promise<void>;
  onResetToStart: () => void;
  onSkipAttempt: () => void;
  onEndCompetition: () => void;
}

/**
 * Sidebar with timer, competition info, declarations, and quick actions
 */
export const CompetitionSidebar = ({
  competitionId,
  currentLift,
  currentIndex,
  currentAttempt,
  totalAttempts,
  totalAthletes,
  weighedInCount,
  isCompetitionActive,
  onDeclarationChange,
  onOpenDeclarationsModal,
  onOpenExternalDisplay,
  onOpenSpottersDisplay,
  onOpenWarmupDisplay,
  onResetToStart,
  onSkipAttempt,
  onEndCompetition,
}: CompetitionSidebarProps) => {
  const { t } = useTranslation();

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* Timer - resets when athlete changes */}
      <Timer
        key={currentAttempt ? `${currentAttempt.athlete_id}-${currentAttempt.attempt_number}` : 'no-attempt'}
        onComplete={() => message.warning(t('live.timer.timeUp'))}
      />

      {/* Competition Info */}
      <CompetitionInfoCard
        currentLift={currentLift}
        currentIndex={currentIndex}
        totalAttempts={totalAttempts}
        totalAthletes={totalAthletes}
        weighedInCount={weighedInCount}
        isCompetitionActive={isCompetitionActive}
      />

      {/* Quick Declarations Widget */}
      {competitionId && (
        <QuickDeclarationWidget
          competitionId={competitionId}
          currentLift={currentLift}
          onOpenFullDeclarations={onOpenDeclarationsModal}
          onDeclarationChange={onDeclarationChange}
        />
      )}

      {/* Quick Actions */}
      <QuickActionsCard
        isCompetitionActive={isCompetitionActive}
        onOpenExternalDisplay={onOpenExternalDisplay}
        onOpenSpottersDisplay={onOpenSpottersDisplay}
        onOpenWarmupDisplay={onOpenWarmupDisplay}
        onResetToStart={onResetToStart}
        onSkipAttempt={onSkipAttempt}
        onEndCompetition={onEndCompetition}
      />
    </Space>
  );
};
