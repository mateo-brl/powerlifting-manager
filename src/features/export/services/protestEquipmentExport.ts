/**
 * Service d'export pour les protestations et la validation d'équipement
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../../../shared/utils/formatters';
import { Protest, PROTEST_TYPE_LABELS, PROTEST_STATUS_LABELS } from '../../competition-flow/types/protest';
import { AthleteEquipment } from '../../weigh-in/types/equipment';

interface ProtestExportOptions {
  language?: 'fr' | 'en';
  competitionName: string;
  competitionDate: string;
}

interface EquipmentExportOptions {
  language?: 'fr' | 'en';
  competitionName: string;
  competitionDate: string;
}

/**
 * Export des protestations en PDF
 */
export function exportProtestsToPDF(
  protests: Protest[],
  options: ProtestExportOptions
): void {
  const { language = 'fr', competitionName, competitionDate } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4',
  });

  const t = {
    fr: {
      title: 'RAPPORT DES PROTESTATIONS',
      competition: 'Compétition',
      date: 'Date',
      summary: 'Résumé',
      totalProtests: 'Total des protestations',
      accepted: 'Acceptées',
      rejected: 'Rejetées',
      pending: 'En attente',
      details: 'Détails des Protestations',
      time: 'Heure',
      type: 'Type',
      reason: 'Raison',
      status: 'Statut',
      juryNotes: 'Notes du jury',
      noProtests: 'Aucune protestation enregistrée',
      generatedOn: 'Généré le',
    },
    en: {
      title: 'PROTESTS REPORT',
      competition: 'Competition',
      date: 'Date',
      summary: 'Summary',
      totalProtests: 'Total protests',
      accepted: 'Accepted',
      rejected: 'Rejected',
      pending: 'Pending',
      details: 'Protest Details',
      time: 'Time',
      type: 'Type',
      reason: 'Reason',
      status: 'Status',
      juryNotes: 'Jury notes',
      noProtests: 'No protests recorded',
      generatedOn: 'Generated on',
    },
  }[language];

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, doc.internal.pageSize.width / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.competition}: ${competitionName}`, 20, 35);
  doc.text(`${t.date}: ${formatDate(competitionDate)}`, 20, 42);

  // Summary
  const accepted = protests.filter(p => p.status === 'accepted').length;
  const rejected = protests.filter(p => p.status === 'rejected').length;
  const pending = protests.filter(p => p.status === 'pending').length;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t.summary, 20, 55);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.totalProtests}: ${protests.length}`, 25, 63);
  doc.text(`${t.accepted}: ${accepted}`, 25, 70);
  doc.text(`${t.rejected}: ${rejected}`, 25, 77);
  doc.text(`${t.pending}: ${pending}`, 25, 84);

  if (protests.length === 0) {
    doc.setFontSize(12);
    doc.text(t.noProtests, 20, 100);
  } else {
    // Details table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.details, 20, 100);

    const tableData = protests.map(protest => [
      new Date(protest.timestamp * 1000).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US'),
      PROTEST_TYPE_LABELS[protest.protest_type][language],
      protest.reason.substring(0, 50) + (protest.reason.length > 50 ? '...' : ''),
      PROTEST_STATUS_LABELS[protest.status][language],
      protest.jury_notes || '-',
    ]);

    autoTable(doc, {
      startY: 105,
      head: [[t.time, t.type, t.reason, t.status, t.juryNotes]],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [235, 47, 150], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25 },
        4: { cellWidth: 40 },
      },
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.text(
    `${t.generatedOn} ${formatDate(new Date().toISOString())}`,
    doc.internal.pageSize.width - 20,
    doc.internal.pageSize.height - 10,
    { align: 'right' }
  );

  const filename = `protests_${competitionName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Export des protestations en CSV
 */
export function exportProtestsToCSV(
  protests: Protest[],
  options: ProtestExportOptions
): void {
  const { language = 'fr', competitionName } = options;

  const headers = language === 'fr'
    ? ['Heure', 'Type', 'Raison', 'Statut', 'Notes du jury', 'Délai respecté']
    : ['Time', 'Type', 'Reason', 'Status', 'Jury Notes', 'Within Deadline'];

  const rows = protests.map(protest => [
    new Date(protest.timestamp * 1000).toISOString(),
    PROTEST_TYPE_LABELS[protest.protest_type][language],
    `"${protest.reason.replace(/"/g, '""')}"`,
    PROTEST_STATUS_LABELS[protest.status][language],
    protest.jury_notes ? `"${protest.jury_notes.replace(/"/g, '""')}"` : '',
    protest.timestamp <= protest.protest_deadline ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No'),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `protests_${competitionName.replace(/\s+/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export de la validation d'équipement en PDF
 */
export function exportEquipmentToPDF(
  equipment: AthleteEquipment[],
  options: EquipmentExportOptions
): void {
  const { language = 'fr', competitionName, competitionDate } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'A4',
  });

  const t = {
    fr: {
      title: 'RAPPORT DE VALIDATION D\'ÉQUIPEMENT',
      competition: 'Compétition',
      date: 'Date',
      summary: 'Résumé',
      total: 'Total athlètes',
      validated: 'Validés',
      notValidated: 'Non validés',
      details: 'Détails par Athlète',
      athlete: 'Athlète',
      singlet: 'Combinaison',
      belt: 'Ceinture',
      kneesSleeves: 'Genouillères',
      wristWraps: 'Bandes poignets',
      shoes: 'Chaussures',
      status: 'Statut',
      validator: 'Validateur',
      validatedStatus: 'Validé',
      notValidatedStatus: 'Non validé',
      generatedOn: 'Généré le',
    },
    en: {
      title: 'EQUIPMENT VALIDATION REPORT',
      competition: 'Competition',
      date: 'Date',
      summary: 'Summary',
      total: 'Total athletes',
      validated: 'Validated',
      notValidated: 'Not validated',
      details: 'Details by Athlete',
      athlete: 'Athlete',
      singlet: 'Singlet',
      belt: 'Belt',
      kneesSleeves: 'Knee Sleeves',
      wristWraps: 'Wrist Wraps',
      shoes: 'Shoes',
      status: 'Status',
      validator: 'Validator',
      validatedStatus: 'Validated',
      notValidatedStatus: 'Not validated',
      generatedOn: 'Generated on',
    },
  }[language];

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, doc.internal.pageSize.width / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.competition}: ${competitionName}`, 14, 25);
  doc.text(`${t.date}: ${formatDate(competitionDate)}`, 14, 32);

  // Summary
  const validated = equipment.filter(e => e.equipment_validated).length;
  const notValidated = equipment.length - validated;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.summary, 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.total}: ${equipment.length}`, 20, 49);
  doc.text(`${t.validated}: ${validated}`, 20, 55);
  doc.text(`${t.notValidated}: ${notValidated}`, 20, 61);

  // Details table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.details, 14, 72);

  const tableData = equipment.map(eq => [
    eq.athlete_name,
    eq.equipment_singlet_brand || '-',
    eq.equipment_belt_brand || '-',
    eq.equipment_knee_sleeves_brand || '-',
    eq.equipment_wrist_wraps_brand || '-',
    eq.equipment_shoes_brand || '-',
    eq.equipment_validated ? t.validatedStatus : t.notValidatedStatus,
    eq.equipment_validator_name || '-',
  ]);

  autoTable(doc, {
    startY: 77,
    head: [[t.athlete, t.singlet, t.belt, t.kneesSleeves, t.wristWraps, t.shoes, t.status, t.validator]],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [19, 194, 194], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 40 },
      6: { halign: 'center' },
    },
  });

  // Footer
  doc.setFontSize(9);
  doc.text(
    `${t.generatedOn} ${formatDate(new Date().toISOString())}`,
    doc.internal.pageSize.width - 14,
    doc.internal.pageSize.height - 10,
    { align: 'right' }
  );

  const filename = `equipment_${competitionName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Export de la validation d'équipement en CSV
 */
export function exportEquipmentToCSV(
  equipment: AthleteEquipment[],
  options: EquipmentExportOptions
): void {
  const { competitionName } = options;

  const headers = [
    'Athlete',
    'Singlet Brand',
    'Singlet Description',
    'Belt Brand',
    'Belt Description',
    'Knee Sleeves Brand',
    'Knee Sleeves Description',
    'Wrist Wraps Brand',
    'Wrist Wraps Description',
    'Shoes Brand',
    'Shoes Description',
    'Validated',
    'Validator',
    'Validation Date',
  ];

  const rows = equipment.map(eq => [
    eq.athlete_name,
    eq.equipment_singlet_brand || '',
    eq.equipment_singlet || '',
    eq.equipment_belt_brand || '',
    eq.equipment_belt || '',
    eq.equipment_knee_sleeves_brand || '',
    eq.equipment_knee_sleeves || '',
    eq.equipment_wrist_wraps_brand || '',
    eq.equipment_wrist_wraps || '',
    eq.equipment_shoes_brand || '',
    eq.equipment_shoes || '',
    eq.equipment_validated ? 'Yes' : 'No',
    eq.equipment_validator_name || '',
    eq.equipment_validation_timestamp
      ? new Date(eq.equipment_validation_timestamp * 1000).toISOString()
      : '',
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `equipment_${competitionName.replace(/\s+/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export combiné: Résultats + Protestations + Équipement en PDF
 */
export function exportFullCompetitionReport(
  competitionName: string,
  competitionDate: string,
  protests: Protest[],
  equipment: AthleteEquipment[],
  options: { language?: 'fr' | 'en' } = {}
): void {
  const { language = 'fr' } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4',
  });

  const t = {
    fr: {
      title: 'RAPPORT COMPLET DE COMPÉTITION',
      protestSection: 'Section Protestations',
      equipmentSection: 'Section Équipement',
      totalProtests: 'Total protestations',
      acceptedProtests: 'Acceptées',
      rejectedProtests: 'Rejetées',
      totalAthletes: 'Total athlètes',
      validatedEquipment: 'Équipements validés',
      generatedOn: 'Généré le',
    },
    en: {
      title: 'FULL COMPETITION REPORT',
      protestSection: 'Protests Section',
      equipmentSection: 'Equipment Section',
      totalProtests: 'Total protests',
      acceptedProtests: 'Accepted',
      rejectedProtests: 'Rejected',
      totalAthletes: 'Total athletes',
      validatedEquipment: 'Validated equipment',
      generatedOn: 'Generated on',
    },
  }[language];

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, doc.internal.pageSize.width / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(competitionName, doc.internal.pageSize.width / 2, 30, { align: 'center' });
  doc.text(formatDate(competitionDate), doc.internal.pageSize.width / 2, 37, { align: 'center' });

  // Protests Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t.protestSection, 20, 55);

  const accepted = protests.filter(p => p.status === 'accepted').length;
  const rejected = protests.filter(p => p.status === 'rejected').length;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.totalProtests}: ${protests.length}`, 25, 65);
  doc.text(`${t.acceptedProtests}: ${accepted}`, 25, 72);
  doc.text(`${t.rejectedProtests}: ${rejected}`, 25, 79);

  // Equipment Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t.equipmentSection, 20, 95);

  const validatedEq = equipment.filter(e => e.equipment_validated).length;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.totalAthletes}: ${equipment.length}`, 25, 105);
  doc.text(`${t.validatedEquipment}: ${validatedEq} / ${equipment.length}`, 25, 112);

  // Footer
  doc.setFontSize(9);
  doc.text(
    `${t.generatedOn} ${formatDate(new Date().toISOString())}`,
    doc.internal.pageSize.width - 20,
    doc.internal.pageSize.height - 10,
    { align: 'right' }
  );

  const filename = `full_report_${competitionName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
