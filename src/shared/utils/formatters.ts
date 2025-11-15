import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

/**
 * Formatters pour l'affichage des données
 */

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return dayjs(date).format('HH:mm:ss');
};

export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(1)} kg`;
};

export const formatAthleteName = (
  firstName: string,
  lastName: string
): string => {
  return `${lastName.toUpperCase()} ${firstName}`;
};

export const formatWeightClass = (
  weightClass: string,
  gender: 'M' | 'F'
): string => {
  const genderLabel = gender === 'M' ? 'Hommes' : 'Femmes';
  return `${genderLabel} ${weightClass}kg`;
};

export const formatLiftType = (liftType: 'squat' | 'bench' | 'deadlift'): string => {
  const labels = {
    squat: 'Squat',
    bench: 'Bench Press',
    deadlift: 'Deadlift',
  };
  return labels[liftType];
};

export const formatAttemptNumber = (attemptNumber: 1 | 2 | 3): string => {
  return `${attemptNumber}ère tentative`;
};

export const formatRefereeDecision = (
  lights?: [boolean, boolean, boolean]
): string => {
  if (!lights) return 'N/A';
  const goodLifts = lights.filter(l => l).length;
  return `${goodLifts}/3 (${lights.map(l => l ? '✓' : '✗').join(' ')})`;
};
