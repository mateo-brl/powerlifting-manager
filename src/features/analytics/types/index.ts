/**
 * Types pour le module statistiques et analytics
 */

/**
 * Historique de performance d'un athlète
 */
export interface AthleteHistory {
  id: string;
  athlete_id: string;
  competition_id: string;
  competition_name: string;
  competition_date: string;

  // Résultats
  bodyweight?: number;
  weight_class: string;
  division: string;

  // Tentatives et résultats
  best_squat?: number;
  best_bench?: number;
  best_deadlift?: number;
  total?: number;

  // Scores
  ipf_points?: number;
  wilks_score?: number;
  dots_score?: number;
  mcculloch_coefficient?: number;

  // Classements
  rank_category?: number;
  rank_absolute?: number;

  created_at: string;
}

/**
 * Progression d'un athlète au fil du temps
 */
export interface AthleteProgression {
  athlete_id: string;
  athlete_name: string;
  history: AthleteHistory[];

  // Statistiques de progression
  squat_progression: number; // % d'amélioration
  bench_progression: number;
  deadlift_progression: number;
  total_progression: number;

  // Meilleurs records personnels
  best_squat_ever?: number;
  best_bench_ever?: number;
  best_deadlift_ever?: number;
  best_total_ever?: number;

  // Dates des records
  best_squat_date?: string;
  best_bench_date?: string;
  best_deadlift_date?: string;
  best_total_date?: string;
}

/**
 * Comparaison entre deux compétitions
 */
export interface CompetitionComparison {
  id: string;
  competition_id: string;

  // Statistiques globales
  total_athletes: number;
  total_lifts: number;
  successful_lifts: number;
  failed_lifts: number;
  success_rate: number; // %

  // Records de la compétition
  best_squat_male?: number;
  best_squat_female?: number;
  best_bench_male?: number;
  best_bench_female?: number;
  best_deadlift_male?: number;
  best_deadlift_female?: number;
  best_total_male?: number;
  best_total_female?: number;

  // Moyennes
  avg_total_male?: number;
  avg_total_female?: number;
  avg_ipf_points?: number;

  created_at: string;
}

/**
 * Comparaison détaillée entre plusieurs compétitions
 */
export interface MultiCompetitionComparison {
  competitions: Array<{
    id: string;
    name: string;
    date: string;
    stats: CompetitionComparison;
  }>;

  // Tendances globales
  trend_participation: 'increasing' | 'decreasing' | 'stable';
  trend_performance: 'increasing' | 'decreasing' | 'stable';
  trend_success_rate: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Point de données pour les graphiques
 */
export interface ChartDataPoint {
  date: string;
  competition: string;
  squat?: number;
  bench?: number;
  deadlift?: number;
  total?: number;
  ipf_points?: number;
  wilks?: number;
  dots?: number;
}

/**
 * Statistiques détaillées d'un athlète
 */
export interface AthleteDetailedStats {
  athlete_id: string;
  athlete_name: string;

  // Vue d'ensemble
  total_competitions: number;
  total_lifts: number;
  successful_lifts: number;
  success_rate: number;

  // Records personnels
  pr_squat?: number;
  pr_bench?: number;
  pr_deadlift?: number;
  pr_total?: number;

  // Meilleur score
  best_ipf_points?: number;
  best_wilks?: number;
  best_dots?: number;

  // Progression moyenne par an
  avg_yearly_squat_progression?: number;
  avg_yearly_bench_progression?: number;
  avg_yearly_deadlift_progression?: number;
  avg_yearly_total_progression?: number;

  // Première et dernière compétition
  first_competition_date?: string;
  last_competition_date?: string;
  years_active: number;

  // Distribution des résultats
  best_lift: 'squat' | 'bench' | 'deadlift';
  strongest_relative: 'squat' | 'bench' | 'deadlift'; // Relativement au poids corporel
}

/**
 * Statistiques de compétition avancées
 */
export interface AdvancedCompetitionStats {
  competition_id: string;
  competition_name: string;

  // Participation
  total_athletes: number;
  male_athletes: number;
  female_athletes: number;

  // Par catégorie d'âge
  age_distribution: Record<string, number>;

  // Par division
  division_distribution: Record<string, number>;

  // Par catégorie de poids
  weight_class_distribution: Record<string, number>;

  // Taux de réussite par mouvement
  squat_success_rate: number;
  bench_success_rate: number;
  deadlift_success_rate: number;

  // Distribution des totaux
  total_distribution: {
    min: number;
    max: number;
    avg: number;
    median: number;
    q1: number; // 1er quartile
    q3: number; // 3e quartile
  };

  // Records battus
  records_broken: number;
  records_approached: number;
}

/**
 * Options pour les graphiques
 */
export interface ChartOptions {
  type: 'line' | 'bar' | 'area' | 'composed';
  metric: 'squat' | 'bench' | 'deadlift' | 'total' | 'ipf_points' | 'wilks' | 'dots';
  timeRange?: 'all' | '1year' | '2years' | '5years';
  showTrend?: boolean;
  compareWith?: string[]; // IDs d'autres athlètes pour comparaison
}
