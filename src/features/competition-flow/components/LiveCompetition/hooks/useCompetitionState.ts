import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveCompetitionStore } from '../../../stores/liveCompetitionStore';
import { useCompetitionStore } from '../../../../competition/stores/competitionStore';
import { LiftType } from '../../../types';

export interface UseCompetitionStateReturn {
  competitionId: string | undefined;
  competition: any;
  competitionFormat: 'full_power' | 'bench_only';
  currentLift: LiftType;
  currentIndex: number;
  isCompetitionActive: boolean;
  declarationsModalVisible: boolean;
  shortcutsHelpVisible: boolean;
  setCurrentLift: (lift: LiftType) => void;
  setCurrentIndex: (index: number) => void;
  setIsCompetitionActive: (active: boolean) => void;
  setDeclarationsModalVisible: (visible: boolean) => void;
  setShortcutsHelpVisible: (visible: boolean) => void;
  getInitialLift: () => LiftType;
}

/**
 * Hook to manage all competition state
 * Handles initialization, persistence, and state updates
 */
export function useCompetitionState(): UseCompetitionStateReturn {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { competitions } = useCompetitionStore();

  // Live competition store for persistence
  const {
    activeCompetitionId,
    currentLift: storedLift,
    currentIndex: storedIndex,
    isCompetitionActive: storedIsActive,
    setActiveCompetition,
    setCurrentLift: setStoredLift,
    setCurrentIndex: setStoredIndex,
    setIsCompetitionActive: setStoredIsActive,
  } = useLiveCompetitionStore();

  // Local UI state
  const [declarationsModalVisible, setDeclarationsModalVisible] = useState(false);
  const [shortcutsHelpVisible, setShortcutsHelpVisible] = useState(false);

  // Get competition and its format
  const competition = competitions.find(c => c.id === competitionId);
  const competitionFormat = competition?.format || 'full_power';

  // Set initial lift based on format
  const getInitialLift = (): LiftType => {
    if (competitionFormat === 'bench_only') return 'bench';
    return 'squat';
  };

  // Initialize or restore competition state
  useEffect(() => {
    if (competitionId) {
      if (activeCompetitionId !== competitionId) {
        // New competition, initialize with default values
        setActiveCompetition(competitionId, getInitialLift());
      }
    }
  }, [competitionId, activeCompetitionId, competitionFormat]);

  // Use stored values if this is the active competition, otherwise use defaults
  const isThisCompetitionActive = activeCompetitionId === competitionId;
  const currentLift = isThisCompetitionActive ? storedLift : getInitialLift();
  const currentIndex = isThisCompetitionActive ? storedIndex : 0;
  const isCompetitionActive = isThisCompetitionActive ? storedIsActive : false;

  // Wrapper functions to update both local and stored state
  const setCurrentLift = (lift: LiftType) => {
    setStoredLift(lift);
  };

  const setCurrentIndex = (index: number) => {
    setStoredIndex(index);
  };

  const setIsCompetitionActive = (active: boolean) => {
    setStoredIsActive(active);
  };

  return {
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
    getInitialLift,
  };
}
