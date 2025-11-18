/**
 * Générateur de certificats et diplômes
 */

import jsPDF from 'jspdf';
import { AthleteResult, CompetitionResults } from '../types';
import { formatDate } from '../../../shared/utils/formatters';

/**
 * Génère un certificat de podium (1er, 2ème, 3ème place)
 */
export function generatePodiumCertificate(
  athlete: AthleteResult,
  competition: {
    name: string;
    date: string;
    location?: string;
    federation: string;
  },
  rank: number,
  language: 'fr' | 'en' = 'fr'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'A4',
  });

  const width = doc.internal.pageSize.width;
  const height = doc.internal.pageSize.height;

  // Couleurs selon le rang
  const colors = {
    1: { r: 255, g: 215, b: 0 },   // Or
    2: { r: 192, g: 192, b: 192 }, // Argent
    3: { r: 205, g: 127, b: 50 },  // Bronze
  };

  const color = colors[rank as keyof typeof colors] || colors[1];

  // Bordure décorative
  doc.setLineWidth(3);
  doc.setDrawColor(color.r, color.g, color.b);
  doc.rect(10, 10, width - 20, height - 20);

  doc.setLineWidth(1);
  doc.setDrawColor(color.r * 0.7, color.g * 0.7, color.b * 0.7);
  doc.rect(15, 15, width - 30, height - 30);

  const t = {
    fr: {
      certificate: 'CERTIFICAT DE MÉRITE',
      awarded: 'est décerné à',
      performance: 'Pour sa remarquable performance',
      rank: rank === 1 ? '1ère Place' : rank === 2 ? '2ème Place' : '3ème Place',
      category: 'Catégorie',
      total: 'Total',
      date: 'Date',
      location: 'Lieu',
      federation: 'Fédération',
      signature: 'Signature',
    },
    en: {
      certificate: 'CERTIFICATE OF ACHIEVEMENT',
      awarded: 'is awarded to',
      performance: 'For outstanding performance',
      rank: rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place',
      category: 'Category',
      total: 'Total',
      date: 'Date',
      location: 'Location',
      federation: 'Federation',
      signature: 'Signature',
    },
  }[language];

  // Titre principal
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color.r, color.g, color.b);
  doc.text(t.certificate, width / 2, 35, { align: 'center' });

  // Texte "décerné à"
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(t.awarded, width / 2, 55, { align: 'center' });

  // Nom de l'athlète
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `${athlete.first_name} ${athlete.last_name.toUpperCase()}`,
    width / 2,
    75,
    { align: 'center' }
  );

  // Ligne décorative sous le nom
  doc.setLineWidth(0.5);
  doc.setDrawColor(color.r, color.g, color.b);
  doc.line(width / 2 - 60, 78, width / 2 + 60, 78);

  // Performance
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text(t.performance, width / 2, 92, { align: 'center' });

  // Rang
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color.r, color.g, color.b);
  doc.text(t.rank, width / 2, 108, { align: 'center' });

  // Détails de la compétition
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(competition.name, width / 2, 125, { align: 'center' });

  doc.setFontSize(11);
  const categoryText = `${t.category}: ${
    athlete.gender === 'M' ? (language === 'fr' ? 'Hommes' : 'Men') : (language === 'fr' ? 'Femmes' : 'Women')
  } ${athlete.weight_class}kg - ${athlete.division.toUpperCase()}`;
  doc.text(categoryText, width / 2, 135, { align: 'center' });

  doc.text(`${t.total}: ${athlete.total} kg`, width / 2, 143, { align: 'center' });

  // Informations en bas
  doc.setFontSize(10);
  const bottomY = height - 30;
  doc.text(`${t.date}: ${formatDate(competition.date)}`, 30, bottomY);
  if (competition.location) {
    doc.text(`${t.location}: ${competition.location}`, 30, bottomY + 7);
  }
  doc.text(`${t.federation}: ${competition.federation}`, 30, bottomY + 14);

  // Signature
  doc.text(t.signature, width - 70, bottomY + 7);
  doc.line(width - 70, bottomY + 10, width - 30, bottomY + 10);

  return doc;
}

/**
 * Génère tous les certificats pour les podiums d'une compétition
 */
export function generateAllPodiumCertificates(
  results: CompetitionResults,
  language: 'fr' | 'en' = 'fr'
): void {
  // Regrouper par catégorie
  const categories = results.results.reduce((acc, athlete) => {
    const key = `${athlete.gender}-${athlete.weight_class}-${athlete.division}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(athlete);
    return acc;
  }, {} as Record<string, AthleteResult[]>);

  // Pour chaque catégorie, générer les certificats pour le top 3
  Object.values(categories).forEach((athletes) => {
    const sorted = athletes.sort((a, b) => (b.total || 0) - (a.total || 0));
    const podium = sorted.slice(0, 3);

    podium.forEach((athlete, index) => {
      const rank = index + 1;
      const doc = generatePodiumCertificate(
        athlete,
        {
          name: results.competition_name,
          date: results.competition_date,
          location: results.competition_location,
          federation: results.federation,
        },
        rank,
        language
      );

      const filename = `certificate_${athlete.last_name}_${athlete.first_name}_${rank}place.pdf`;
      doc.save(filename);
    });
  });
}

/**
 * Génère un certificat de participation
 */
export function generateParticipationCertificate(
  athlete: AthleteResult,
  competition: {
    name: string;
    date: string;
    location?: string;
    federation: string;
  },
  language: 'fr' | 'en' = 'fr'
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'A4',
  });

  const width = doc.internal.pageSize.width;
  const height = doc.internal.pageSize.height;

  // Bordure
  doc.setLineWidth(2);
  doc.setDrawColor(66, 139, 202);
  doc.rect(10, 10, width - 20, height - 20);

  doc.setLineWidth(0.5);
  doc.rect(13, 13, width - 26, height - 26);

  const t = {
    fr: {
      certificate: 'CERTIFICAT DE PARTICIPATION',
      text1: 'Certifie que',
      text2: 'a participé à la compétition',
      category: 'Catégorie',
      total: 'Total réalisé',
      date: 'Date',
      location: 'Lieu',
      signature: 'Signature du Directeur Technique',
    },
    en: {
      certificate: 'CERTIFICATE OF PARTICIPATION',
      text1: 'This certifies that',
      text2: 'has participated in the competition',
      category: 'Category',
      total: 'Total achieved',
      date: 'Date',
      location: 'Location',
      signature: 'Technical Director Signature',
    },
  }[language];

  // Titre
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(66, 139, 202);
  doc.text(t.certificate, width / 2, 40, { align: 'center' });

  // Texte
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(t.text1, width / 2, 65, { align: 'center' });

  // Nom
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `${athlete.first_name} ${athlete.last_name.toUpperCase()}`,
    width / 2,
    80,
    { align: 'center' }
  );

  // Suite du texte
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(t.text2, width / 2, 100, { align: 'center' });

  // Nom de la compétition
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(competition.name, width / 2, 115, { align: 'center' });

  // Détails
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const categoryText = `${t.category}: ${
    athlete.gender === 'M' ? (language === 'fr' ? 'Hommes' : 'Men') : (language === 'fr' ? 'Femmes' : 'Women')
  } ${athlete.weight_class}kg`;
  doc.text(categoryText, width / 2, 130, { align: 'center' });
  doc.text(`${t.total}: ${athlete.total} kg`, width / 2, 138, { align: 'center' });

  // Bas de page
  doc.setFontSize(10);
  const bottomY = height - 30;
  doc.text(`${t.date}: ${formatDate(competition.date)}`, 30, bottomY);
  if (competition.location) {
    doc.text(`${t.location}: ${competition.location}`, 30, bottomY + 7);
  }

  // Signature
  doc.text(t.signature, width - 80, bottomY + 7);
  doc.line(width - 80, bottomY + 10, width - 30, bottomY + 10);

  const filename = `participation_${athlete.last_name}_${athlete.first_name}.pdf`;
  doc.save(filename);
}
