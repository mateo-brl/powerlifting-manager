import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useBroadcastStore } from '../../../stores/broadcastStore';
import { openDisplayWindow } from '../../../../../shared/utils/tauriWrapper';
import { useConfirmAction } from '../../../../../shared/hooks/useConfirmAction';
import { LiftType } from '../../../types';
import { AttemptOrder } from '../../../../weigh-in/types';

export interface UseCompetitionActionsParams {
  competitionId: string | undefined;
  competition: any;
  currentLift: LiftType;
  currentIndex: number;
  attemptOrder: AttemptOrder[];
  hasAttempts: boolean;
  isCompetitionActive: boolean;
  setCurrentLift: (lift: LiftType) => void;
  setCurrentIndex: (index: number) => void;
  setIsCompetitionActive: (active: boolean) => void;
  setOrderVersion: (fn: (v: number) => number) => void;
}

export interface UseCompetitionActionsReturn {
  handleStartCompetition: () => void;
  handlePauseCompetition: () => void;
  handleNextAttempt: () => void;
  handleEndCompetition: () => void;
  handleChangeLift: (lift: LiftType) => void;
  handleTogglePause: () => void;
  handleOpenExternalDisplay: () => Promise<void>;
  handleOpenSpottersDisplay: () => Promise<void>;
  handleOpenWarmupDisplay: () => Promise<void>;
  broadcastCurrentState: () => void;
}

/**
 * Hook to manage all competition actions and event handlers
 * Handles start/pause/stop, lift changes, and display windows
 */
export function useCompetitionActions({
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
}: UseCompetitionActionsParams): UseCompetitionActionsReturn {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { broadcast } = useBroadcastStore();
  const { confirmEndCompetition } = useConfirmAction();

  const broadcastCurrentState = useCallback(() => {
    if (!competition) return;

    // Broadcast competition started
    broadcast({
      type: 'competition_started',
      data: {
        competition_id: competitionId || '',
        competition_name: competition.name,
        lift_type: currentLift,
      },
    });

    // Broadcast current athlete if available
    const currentAttempt = attemptOrder[currentIndex];
    if (currentAttempt) {
      broadcast({
        type: 'athlete_up',
        data: {
          athlete_id: currentAttempt.athlete_id,
          athlete_name: currentAttempt.athlete_name,
          weight_kg: currentAttempt.weight_kg,
          attempt_number: currentAttempt.attempt_number,
          lift_type: currentLift,
          lot_number: currentAttempt.lot_number,
          rack_height: currentAttempt.rack_height,
          safety_height: currentAttempt.safety_height,
        },
      });
    }

    // Broadcast attempt order
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
  }, [competition, competitionId, currentLift, currentIndex, attemptOrder, broadcast]);

  const handleStartCompetition = useCallback(() => {
    if (attemptOrder.length === 0) {
      message.warning(t('live.messages.noAthletes'));
      return;
    }
    setIsCompetitionActive(true);
    message.success(t('live.messages.started', { lift: currentLift.toUpperCase() }));

    // Broadcast competition started event
    if (competition) {
      broadcast({
        type: 'competition_started',
        data: {
          competition_id: competitionId || '',
          competition_name: competition.name,
          lift_type: currentLift,
        },
      });
    }

    // Broadcast current athlete up
    if (attemptOrder[currentIndex]) {
      const currentAttempt = attemptOrder[currentIndex];
      broadcast({
        type: 'athlete_up',
        data: {
          athlete_id: currentAttempt.athlete_id,
          athlete_name: currentAttempt.athlete_name,
          weight_kg: currentAttempt.weight_kg,
          attempt_number: currentAttempt.attempt_number,
          lift_type: currentLift,
          lot_number: currentAttempt.lot_number,
          rack_height: currentAttempt.rack_height,
          safety_height: currentAttempt.safety_height,
        },
      });

      // Broadcast initial attempt order for warmup display
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
  }, [attemptOrder, competition, competitionId, currentIndex, currentLift, setIsCompetitionActive, broadcast, t]);

  const handlePauseCompetition = useCallback(() => {
    setIsCompetitionActive(false);
    message.info(t('live.messages.paused'));

    // Broadcast pause event
    broadcast({
      type: 'competition_paused',
      data: {
        competition_id: competitionId || '',
      },
    });
  }, [competitionId, setIsCompetitionActive, broadcast, t]);

  const handleNextAttempt = useCallback(() => {
    // Trigger order recalculation first (to account for the completed attempt)
    setOrderVersion(v => v + 1);

    if (currentIndex < attemptOrder.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Broadcast next athlete up
      const nextAttempt = attemptOrder[nextIndex];
      if (nextAttempt) {
        broadcast({
          type: 'athlete_up',
          data: {
            athlete_id: nextAttempt.athlete_id,
            athlete_name: nextAttempt.athlete_name,
            weight_kg: nextAttempt.weight_kg,
            attempt_number: nextAttempt.attempt_number,
            lift_type: currentLift,
            lot_number: nextAttempt.lot_number,
            rack_height: nextAttempt.rack_height,
            safety_height: nextAttempt.safety_height,
          },
        });

        // Also broadcast updated attempt order with new index for warmup display
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
            current_index: nextIndex,
          },
        });
      }
    } else {
      // All attempts for this lift are completed
      message.success(t('live.messages.liftCompleted', { lift: t(`live.lifts.${currentLift}`) }));
      setIsCompetitionActive(false);

      // Don't broadcast competition_ended, just pause
      // The user can then switch to the next lift or end the competition
    }
  }, [currentIndex, currentLift, attemptOrder, setCurrentIndex, setIsCompetitionActive, setOrderVersion, broadcast, t]);

  const handleEndCompetition = useCallback(() => {
    confirmEndCompetition(() => {
      setIsCompetitionActive(false);

      // Broadcast competition ended
      broadcast({
        type: 'competition_ended',
        data: {
          competition_id: competitionId || '',
        },
      });

      message.success(t('live.messages.competitionEnded'));

      // Navigate to results
      navigate(`/competitions/${competitionId}/results`);
    });
  }, [competitionId, setIsCompetitionActive, broadcast, navigate, confirmEndCompetition, t]);

  const handleChangeLift = useCallback((newLift: LiftType) => {
    setCurrentLift(newLift);
    setCurrentIndex(0);
    setIsCompetitionActive(false);
    message.info(t('live.messages.switchLift', { lift: newLift.toUpperCase() }));

    // Broadcast lift changed
    broadcast({
      type: 'lift_changed',
      data: {
        lift_type: newLift,
      },
    });
  }, [setCurrentLift, setCurrentIndex, setIsCompetitionActive, broadcast, t]);

  const handleTogglePause = useCallback(() => {
    if (isCompetitionActive) {
      handlePauseCompetition();
    } else if (hasAttempts) {
      handleStartCompetition();
    }
  }, [isCompetitionActive, hasAttempts, handlePauseCompetition, handleStartCompetition]);

  const handleOpenExternalDisplay = useCallback(async () => {
    try {
      await openDisplayWindow('/display', 'external-display', {
        title: t('live.display.external'),
        fullscreen: true,
      });
      // Re-broadcast current state after a delay
      setTimeout(broadcastCurrentState, 500);
      message.success(t('live.display.opened'));
    } catch (e) {
      console.error('Failed to open external display:', e);
      message.error(t('live.display.error'));
    }
  }, [broadcastCurrentState, t]);

  const handleOpenSpottersDisplay = useCallback(async () => {
    try {
      await openDisplayWindow('/spotters', 'spotters-display', {
        title: t('live.display.spotters'),
        width: 1280,
        height: 800,
      });
      // Re-broadcast current state after a delay
      setTimeout(broadcastCurrentState, 500);
      message.success(t('live.display.opened'));
    } catch (e) {
      console.error('Failed to open spotters display:', e);
      message.error(t('live.display.error'));
    }
  }, [broadcastCurrentState, t]);

  const handleOpenWarmupDisplay = useCallback(async () => {
    try {
      await openDisplayWindow('/warmup', 'warmup-display', {
        title: t('live.display.warmup'),
        width: 1280,
        height: 800,
      });
      // Re-broadcast current state after a delay
      setTimeout(broadcastCurrentState, 500);
      message.success(t('live.display.opened'));
    } catch (e) {
      console.error('Failed to open warmup display:', e);
      message.error(t('live.display.error'));
    }
  }, [broadcastCurrentState, t]);

  return {
    handleStartCompetition,
    handlePauseCompetition,
    handleNextAttempt,
    handleEndCompetition,
    handleChangeLift,
    handleTogglePause,
    handleOpenExternalDisplay,
    handleOpenSpottersDisplay,
    handleOpenWarmupDisplay,
    broadcastCurrentState,
  };
}
