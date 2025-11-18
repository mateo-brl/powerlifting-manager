/**
 * Service d'export PDF
 * Génère des PDF pour résultats, certificats, feuilles imprimables
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompetitionResults, AthleteResult, ExportOptions } from '../types';
import { formatDate, formatWeight } from '../../../shared/utils/formatters';

/**
 * Export des résultats de compétition en PDF
 */
export function exportResultsToPDF(
  results: CompetitionResults,
  options: ExportOptions = {}
): void {
  const {
    includeGLPoints = true,
    format = 'A4',
    language = 'fr',
  } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: format,
  });

  const translations = {
    fr: {
      title: 'RÉSULTATS DE COMPÉTITION',
      competition: 'Compétition',
      date: 'Date',
      location: 'Lieu',
      federation: 'Fédération',
      rank: 'Rang',
      name: 'Nom',
      gender: 'Sexe',
      weightClass: 'Catégorie',
      division: 'Division',
      bodyweight: 'Poids',
      squat: 'Squat',
      bench: 'Développé Couché',
      deadlift: 'Soulevé de Terre',
      total: 'Total',
      glPoints: 'Points GL',
    },
    en: {
      title: 'COMPETITION RESULTS',
      competition: 'Competition',
      date: 'Date',
      location: 'Location',
      federation: 'Federation',
      rank: 'Rank',
      name: 'Name',
      gender: 'Sex',
      weightClass: 'Weight Class',
      division: 'Division',
      bodyweight: 'Bodyweight',
      squat: 'Squat',
      bench: 'Bench Press',
      deadlift: 'Deadlift',
      total: 'Total',
      glPoints: 'GL Points',
    },
  };

  const t = translations[language];

  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, doc.internal.pageSize.width / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.competition}: ${results.competition_name}`, 14, 25);
  doc.text(`${t.date}: ${formatDate(results.competition_date)}`, 14, 32);
  if (results.competition_location) {
    doc.text(`${t.location}: ${results.competition_location}`, 14, 39);
  }
  doc.text(`${t.federation}: ${results.federation}`, 14, 46);

  // Regrouper par catégorie de poids et sexe
  const categories = results.results.reduce((acc, athlete) => {
    const key = `${athlete.gender}-${athlete.weight_class}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(athlete);
    return {};
  }, {} as Record<string, AthleteResult[]>);

  let startY = 55;

  Object.entries(categories).forEach(([category, athletes]) => {
    const [gender, weightClass] = category.split('-');

    // Titre de catégorie
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${gender === 'M' ? (language === 'fr' ? 'Hommes' : 'Men') : (language === 'fr' ? 'Femmes' : 'Women')} ${weightClass}kg`,
      14,
      startY
    );

    // Tableau des résultats
    const headers = [
      t.rank,
      t.name,
      t.bodyweight,
      t.squat,
      t.bench,
      t.deadlift,
      t.total,
    ];

    if (includeGLPoints) {
      headers.push(t.glPoints);
    }

    const data = athletes
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .map((athlete, index) => {
        const row = [
          (index + 1).toString(),
          `${athlete.last_name.toUpperCase()} ${athlete.first_name}`,
          formatWeight(athlete.bodyweight || 0),
          formatWeight(athlete.best_squat),
          formatWeight(athlete.best_bench),
          formatWeight(athlete.best_deadlift),
          formatWeight(athlete.total),
        ];

        if (includeGLPoints && athlete.gl_points) {
          row.push(athlete.gl_points.toFixed(2));
        }

        return row;
      });

    autoTable(doc, {
      startY: startY + 5,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right', fontStyle: 'bold' },
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 10;

    // Nouvelle page si nécessaire
    if (startY > doc.internal.pageSize.height - 30) {
      doc.addPage();
      startY = 15;
    }
  });

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} / ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Généré le ${formatDate(new Date().toISOString())}`,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  // Sauvegarde
  const filename = `results_${results.competition_name.replace(/\s+/g, '_')}_${
    new Date().toISOString().split('T')[0]
  }.pdf`;
  doc.save(filename);
}

/**
 * Génère une feuille de résultats imprimable (format A4)
 */
export function exportPrintableSheet(
  results: CompetitionResults,
  options: ExportOptions = {}
): void {
  const { language = 'fr' } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4',
  });

  const t = {
    fr: {
      title: 'Feuille de Résultats',
      athlete: 'Athlète',
      category: 'Catégorie',
      bodyweight: 'Poids de corps',
      attempt: 'Tentative',
      squat: 'SQUAT',
      bench: 'DÉVELOPPÉ COUCHÉ',
      deadlift: 'SOULEVÉ DE TERRE',
      best: 'Meilleur',
      total: 'TOTAL',
      signature: 'Signature Juge en Chef',
    },
    en: {
      title: 'Results Sheet',
      athlete: 'Athlete',
      category: 'Category',
      bodyweight: 'Bodyweight',
      attempt: 'Attempt',
      squat: 'SQUAT',
      bench: 'BENCH PRESS',
      deadlift: 'DEADLIFT',
      best: 'Best',
      total: 'TOTAL',
      signature: 'Head Judge Signature',
    },
  }[language];

  results.results.forEach((athlete, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // En-tête
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(t.title, 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`${t.athlete}: ${athlete.first_name} ${athlete.last_name.toUpperCase()}`, 20, 30);
    doc.text(`${t.category}: ${athlete.gender} ${athlete.weight_class}kg`, 20, 38);
    doc.text(`${t.bodyweight}: ${formatWeight(athlete.bodyweight || 0)}`, 20, 46);

    let yPos = 60;

    // Squat
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.squat, 20, yPos);

    autoTable(doc, {
      startY: yPos + 5,
      head: [[t.attempt, 'Poids (kg)', 'Résultat']],
      body: [
        ['1', athlete.squat_1?.toString() || '', ''],
        ['2', athlete.squat_2?.toString() || '', ''],
        ['3', athlete.squat_3?.toString() || '', ''],
        [t.best, athlete.best_squat?.toString() || '', ''],
      ],
      theme: 'grid',
      styles: { fontSize: 11 },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Bench Press
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.bench, 20, yPos);

    autoTable(doc, {
      startY: yPos + 5,
      head: [[t.attempt, 'Poids (kg)', 'Résultat']],
      body: [
        ['1', athlete.bench_1?.toString() || '', ''],
        ['2', athlete.bench_2?.toString() || '', ''],
        ['3', athlete.bench_3?.toString() || '', ''],
        [t.best, athlete.best_bench?.toString() || '', ''],
      ],
      theme: 'grid',
      styles: { fontSize: 11 },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Deadlift
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.deadlift, 20, yPos);

    autoTable(doc, {
      startY: yPos + 5,
      head: [[t.attempt, 'Poids (kg)', 'Résultat']],
      body: [
        ['1', athlete.deadlift_1?.toString() || '', ''],
        ['2', athlete.deadlift_2?.toString() || '', ''],
        ['3', athlete.deadlift_3?.toString() || '', ''],
        [t.best, athlete.best_deadlift?.toString() || '', ''],
      ],
      theme: 'grid',
      styles: { fontSize: 11 },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Total
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.total}: ${formatWeight(athlete.total)} kg`, 20, yPos);

    // Signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(t.signature, 20, 280);
    doc.line(20, 285, 100, 285);
  });

  const filename = `printable_sheets_${results.competition_name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
