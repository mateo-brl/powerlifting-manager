import { useState, useCallback, useEffect } from 'react';
import { Card, Row, Col, Alert, Tabs, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useBroadcastStore } from '../../stores/broadcastStore';
import { useKeyboardShortcuts } from '../../../../shared/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '../../../../components/KeyboardShortcutsHelp';
import { AttemptOrderList } from '../AttemptOrderList';
import { AttemptTracker } from '../AttemptTracker';
import { WeightDeclarationsInline } from '../WeightDeclarationsInline';
import { CompetitionHeader } from './CompetitionHeader';
import { CompetitionSidebar } from './CompetitionSidebar';
import { useCompetitionState, useAttemptOrdering, useCompetitionActions } from './hooks';

/**
 * Main live competition orchestration component
 * Refactored from 775 lines to ~200 lines by extracting hooks and components
 */
export const LiveCompetition = () => {
  const { t } = useTranslation();
  const { broadcast } = useBroadcastStore();

  // Local state for refreshing and versioning
  const [refreshKey, setRefreshKey] = useState(0);
  const [orderVersion, setOrderVersion] = useState(0);

  // Hook 1: Competition state management
  const {
    competitionId,
    competition,
    competitionFormat,
    currentLift,
    currentIndex,
    isCompetitionActive,
    declarationsModalVisible,
    shortcutsHelpVisible,
    setCurrentLift,
    setCurrentIndex,
    setIsCompetitionActive,
    setDeclarationsModalVisible,
    setShortcutsHelpVisible,
  } = useCompetitionState();

  // Hook 2: Attempt ordering logic
  const {
    attemptOrder,
    currentAttempt,
    hasAttempts,
    competitionAthletes,
    competitionWeighIns,
  } = useAttemptOrdering({
    competitionId,
    currentLift,
    currentIndex,
    setCurrentIndex,
    refreshKey,
    orderVersion,
  });

  // Hook 3: Competition actions (event handlers)
  const {
    handleStartCompetition,
    handlePauseCompetition,
    handleNextAttempt,
    handleEndCompetition,
    handleChangeLift,
    handleTogglePause,
    handleOpenExternalDisplay,
    handleOpenSpottersDisplay,
    handleOpenWarmupDisplay,
  } = useCompetitionActions({
    competitionId,
    competition,
    currentLift,
    currentIndex,
    attemptOrder,
    hasAttempts,
    isCompetitionActive,
    setCurrentLift,
    setCurrentIndex,
    setIsCompetitionActive,
    setOrderVersion,
  });

  // Force refresh of attempt order when declarations change
  const handleDeclarationChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Reset to start handler
  const handleResetToStart = useCallback(() => {
    setCurrentIndex(0);
  }, [setCurrentIndex]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'n',
        action: handleNextAttempt,
        description: t('shortcuts.nextAthlete'),
        enabled: isCompetitionActive,
      },
      {
        key: 'p',
        action: handleTogglePause,
        description: t('shortcuts.pauseResume'),
      },
      {
        key: '?',
        shift: true,
        action: () => setShortcutsHelpVisible(true),
        description: t('shortcuts.showHelp'),
      },
      {
        key: 'Escape',
        action: () => setShortcutsHelpVisible(false),
        description: t('shortcuts.closeModal'),
      },
    ],
    enabled: true,
  });

  // Broadcast attempt order updates to warmup display
  useEffect(() => {
    if (attemptOrder.length > 0) {
      broadcast({
        type: 'attempt_order_update',
        data: {
          attempt_order: attemptOrder.map(a => ({
            athlete_id: a.athlete_id,
            athlete_name: a.athlete_name,
            weight_kg: a.weight_kg,
            attempt_number: a.attempt_number,
            lot_number: a.lot_number,
          })),
          current_index: currentIndex,
        },
      });
    }
  }, [attemptOrder, currentIndex, broadcast]);

  return (
    <div>
      <Card
        title={
          <CompetitionHeader
            competitionId={competitionId}
            competitionName={competition?.name || ''}
            competitionFormat={competitionFormat}
            currentLift={currentLift}
            isCompetitionActive={isCompetitionActive}
            hasAttempts={hasAttempts}
            onChangeLift={handleChangeLift}
            onStart={handleStartCompetition}
            onPause={handlePauseCompetition}
            onShowHelp={() => setShortcutsHelpVisible(true)}
          />
        }
      >
        {competitionWeighIns.length === 0 && (
          <Alert
            message={t('live.messages.noWeighIns')}
            description={t('live.messages.completeWeighIns')}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {hasAttempts && (
          <Row gutter={24}>
            <Col span={17}>
              <Tabs
                defaultActiveKey="tracker"
                items={[
                  {
                    key: 'tracker',
                    label: t('live.attemptTracker'),
                    children: currentAttempt && competitionId ? (
                      <AttemptTracker
                        currentAttempt={currentAttempt}
                        liftType={currentLift}
                        competitionId={competitionId}
                        onComplete={handleNextAttempt}
                      />
                    ) : (
                      <Alert
                        message={t('live.attempt.pending')}
                        description={t('live.messages.allAttemptsCompleted')}
                        type="info"
                      />
                    ),
                  },
                  {
                    key: 'order',
                    label: t('live.attemptOrder'),
                    children: (
                      <AttemptOrderList
                        attempts={attemptOrder}
                        currentIndex={currentIndex}
                        liftType={currentLift}
                      />
                    ),
                  },
                ]}
              />
            </Col>

            <Col span={7}>
              <CompetitionSidebar
                competitionId={competitionId}
                currentLift={currentLift}
                currentIndex={currentIndex}
                currentAttempt={currentAttempt}
                totalAttempts={attemptOrder.length}
                totalAthletes={competitionAthletes.length}
                weighedInCount={competitionWeighIns.length}
                isCompetitionActive={isCompetitionActive}
                onDeclarationChange={handleDeclarationChange}
                onOpenDeclarationsModal={() => setDeclarationsModalVisible(true)}
                onOpenExternalDisplay={handleOpenExternalDisplay}
                onOpenSpottersDisplay={handleOpenSpottersDisplay}
                onOpenWarmupDisplay={handleOpenWarmupDisplay}
                onResetToStart={handleResetToStart}
                onSkipAttempt={handleNextAttempt}
                onEndCompetition={handleEndCompetition}
              />
            </Col>
          </Row>
        )}

        {!hasAttempts && competitionWeighIns.length > 0 && (
          <Alert
            message={t('live.messages.allAttemptsCompleted')}
            description={t('live.messages.allAttemptsCompleted')}
            type="success"
            showIcon
          />
        )}
      </Card>

      {/* Full Declarations Modal */}
      <Modal
        title={t('declarations.title')}
        open={declarationsModalVisible}
        onCancel={() => setDeclarationsModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <WeightDeclarationsInline
          competitionId={competitionId || ''}
          currentLift={currentLift}
        />
      </Modal>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        open={shortcutsHelpVisible}
        onClose={() => setShortcutsHelpVisible(false)}
      />
    </div>
  );
};
