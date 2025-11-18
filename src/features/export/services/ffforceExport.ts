/**
 * Export au format FFForce (Fédération Française de Force)
 * Feuille de match informatique officielle
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { CompetitionResults, AthleteResult } from '../types';
import { formatDate } from '../../../shared/utils/formatters';

/**
 * Génère la feuille de match FFForce en PDF
 */
export function exportFFForceSheet(
  results: CompetitionResults,
  responsible: string = ''
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'A4',
  });

  const width = doc.internal.pageSize.width;

  // Logo/En-tête FFForce
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FÉDÉRATION FRANÇAISE DE FORCE', width / 2, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('FEUILLE DE MATCH INFORMATIQUE OFFICIELLE', width / 2, 23, {
    align: 'center',
  });

  // Informations de la compétition
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Compétition: ${results.competition_name}`, 14, 32);
  doc.text(`Date: ${formatDate(results.competition_date)}`, 14, 38);
  if (results.competition_location) {
    doc.text(`Lieu: ${results.competition_location}`, 14, 44);
  }
  if (responsible) {
    doc.text(`Responsable Technique: ${responsible}`, 14, 50);
  }

  // Regrouper par catégorie
  const categories = results.results.reduce((acc, athlete) => {
    const key = `${athlete.gender}-${athlete.weight_class}-${athlete.division}`;
    if (!acc[key]) {
      acc[key] = {
        label: `${athlete.gender === 'M' ? 'Hommes' : 'Femmes'} ${
          athlete.weight_class
        }kg - ${athlete.division.toUpperCase()}`,
        athletes: [],
      };
    }
    acc[key].athletes.push(athlete);
    return acc;
  }, {} as Record<string, { label: string; athletes: AthleteResult[] }>);

  let startY = 58;

  Object.values(categories).forEach((category) => {
    // Trier par classement
    const sorted = category.athletes.sort((a, b) => (b.total || 0) - (a.total || 0));

    // Vérifier si on a besoin d'une nouvelle page
    if (startY > 160) {
      doc.addPage();
      startY = 20;
    }

    // Titre de catégorie
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(category.label, 14, startY);

    // Tableau des résultats
    const headers = [
      'Rang',
      'N°',
      'Nom',
      'Prénom',
      'Catégorie Âge',
      'Poids',
      'Squat',
      'Dev. Couché',
      'Soulevé',
      'Total',
      'IPF Pts',
    ];

    const data = sorted.map((athlete, index) => [
      (index + 1).toString(),
      athlete.lot_number?.toString() || '-',
      athlete.last_name.toUpperCase(),
      athlete.first_name,
      athlete.age_category,
      athlete.bodyweight?.toFixed(2) || '-',
      `${athlete.best_squat || '-'}`,
      `${athlete.best_bench || '-'}`,
      `${athlete.best_deadlift || '-'}`,
      `${athlete.total || '-'}`,
      athlete.gl_points?.toFixed(2) || '-',
    ]);

    autoTable(doc, {
      startY: startY + 5,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 1.5,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [41, 98, 255], // Bleu FFForce
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 10 },
        2: { fontStyle: 'bold', cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { halign: 'center', cellWidth: 22 },
        5: { halign: 'right', cellWidth: 15 },
        6: { halign: 'right', cellWidth: 18 },
        7: { halign: 'right', cellWidth: 22 },
        8: { halign: 'right', cellWidth: 18 },
        9: { halign: 'right', fontStyle: 'bold', cellWidth: 18 },
        10: { halign: 'right', cellWidth: 18 },
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 12;
  });

  // Pied de page sur toutes les pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Ligne de signature
    const bottomY = doc.internal.pageSize.height - 25;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature du Directeur Technique:', 14, bottomY);
    doc.line(70, bottomY, 120, bottomY);

    doc.text('Signature du Délégué FFForce:', width - 110, bottomY);
    doc.line(width - 70, bottomY, width - 20, bottomY);

    // Numéro de page
    doc.setFontSize(8);
    doc.text(
      `Page ${i} / ${pageCount} - Généré le ${formatDate(new Date().toISOString())}`,
      width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Sauvegarder
  const filename = `ffforce_${results.competition_name.replace(/\s+/g, '_')}_${
    results.competition_date
  }.pdf`;
  doc.save(filename);
}

/**
 * Export CSV FFForce avec détail des tentatives
 */
export function exportFFForceDetailedCSV(results: CompetitionResults): void {
  const records = results.results.map((athlete) => {
    return {
      Numéro: athlete.lot_number || '',
      Nom: athlete.last_name.toUpperCase(),
      Prénom: athlete.first_name,
      DateNaissance: athlete.date_of_birth,
      Sexe: athlete.gender,
      CatégoriePoids: athlete.weight_class,
      CatégorieÂge: athlete.age_category,
      Division: athlete.division,
      PoidsCorp: athlete.bodyweight || '',
      HauteurChandelleSquat: athlete.squat_rack_height || '',
      HauteurChandelleBench: athlete.bench_rack_height || '',
      Squat1: athlete.squat_1 || '',
      Squat2: athlete.squat_2 || '',
      Squat3: athlete.squat_3 || '',
      MeilleurSquat: athlete.best_squat || '',
      Bench1: athlete.bench_1 || '',
      Bench2: athlete.bench_2 || '',
      Bench3: athlete.bench_3 || '',
      MeilleurBench: athlete.best_bench || '',
      Deadlift1: athlete.deadlift_1 || '',
      Deadlift2: athlete.deadlift_2 || '',
      Deadlift3: athlete.deadlift_3 || '',
      MeilleurDeadlift: athlete.best_deadlift || '',
      Total: athlete.total || '',
      PointsIPF: athlete.gl_points?.toFixed(2) || '',
      Rang: athlete.rank || '',
    };
  });

  const csv = Papa.unparse(records, {
    header: true,
    delimiter: ';', // Point-virgule pour compatibilité Excel français
  });

  // Télécharger
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM pour Excel
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `ffforce_detail_${results.competition_name.replace(/\s+/g, '_')}_${
      results.competition_date
    }.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Génère la feuille de pesée FFForce
 */
export function exportFFForceWeighInSheet(results: CompetitionResults): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4',
  });

  const width = doc.internal.pageSize.width;

  // En-tête
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FEUILLE DE PESÉE OFFICIELLE', width / 2, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Compétition: ${results.competition_name}`, 14, 25);
  doc.text(`Date: ${formatDate(results.competition_date)}`, 14, 31);

  // Regrouper par catégorie
  const categories = results.results.reduce((acc, athlete) => {
    const key = `${athlete.gender}-${athlete.weight_class}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(athlete);
    return acc;
  }, {} as Record<string, AthleteResult[]>);

  let startY = 40;

  Object.entries(categories).forEach(([category, athletes]) => {
    const [gender, weightClass] = category.split('-');

    if (startY > 240) {
      doc.addPage();
      startY = 20;
    }

    // Titre catégorie
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${gender === 'M' ? 'Hommes' : 'Femmes'} - ${weightClass} kg`,
      14,
      startY
    );

    // Tableau de pesée
    const headers = ['N°', 'Nom', 'Prénom', 'Poids', 'Conforme', 'Signature'];

    const data = athletes.map((athlete) => [
      athlete.lot_number?.toString() || '',
      athlete.last_name.toUpperCase(),
      athlete.first_name,
      athlete.bodyweight?.toFixed(2) || '________',
      '', // Case à cocher
      '', // Signature
    ]);

    autoTable(doc, {
      startY: startY + 5,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 98, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { fontStyle: 'bold', cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 20 },
        5: { cellWidth: 35 },
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 15;
  });

  // Signature
  doc.setFontSize(10);
  doc.text('Responsable de la pesée:', 14, doc.internal.pageSize.height - 20);
  doc.line(60, doc.internal.pageSize.height - 20, 120, doc.internal.pageSize.height - 20);

  const filename = `ffforce_pesee_${results.competition_name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
