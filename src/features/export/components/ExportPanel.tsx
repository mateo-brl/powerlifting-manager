/**
 * Panneau d'export pour les résultats de compétition
 */

import React, { useState } from 'react';
import { Card, Button, Space, Select, message, Divider, Alert } from 'antd';
import {
  FilePdfOutlined,
  FileExcelOutlined,
  TrophyOutlined,
  DownloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CompetitionResults } from '../types';
import {
  exportResultsToPDF,
  exportPrintableSheet,
  generateAllPodiumCertificates,
  generateParticipationCertificate,
  exportToOpenPowerliftingCSV,
  validateOpenPowerliftingData,
  exportFFForceSheet,
  exportFFForceDetailedCSV,
  exportFFForceWeighInSheet,
} from '../services';

interface ExportPanelProps {
  results: CompetitionResults;
  responsible?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ results, responsible }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);
  const [exportLanguage, setExportLanguage] = useState<'fr' | 'en'>(
    i18n.language as 'fr' | 'en'
  );

  const handleExport = async (type: string, exportFn: () => void) => {
    setLoading(type);
    try {
      await exportFn();
      message.success(t('export.success'));
    } catch (error) {
      console.error('Export error:', error);
      message.error(t('export.error'));
    } finally {
      setLoading(null);
    }
  };

  const handleOpenPowerliftingExport = () => {
    const validation = validateOpenPowerliftingData(results);
    if (!validation.valid) {
      message.error({
        content: (
          <div>
            <p>Données incomplètes pour OpenPowerlifting:</p>
            <ul>
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        ),
        duration: 10,
      });
      return;
    }

    handleExport('openpowerlifting', () => exportToOpenPowerliftingCSV(results));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title={t('export.title', 'Exports & Documents Officiels')} bordered={false}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Sélection de la langue */}
          <div>
            <label style={{ marginRight: 8 }}>
              {t('export.language', 'Langue des exports')}:
            </label>
            <Select
              value={exportLanguage}
              onChange={setExportLanguage}
              style={{ width: 120 }}
              options={[
                { value: 'fr', label: 'Français' },
                { value: 'en', label: 'English' },
              ]}
            />
          </div>

          <Divider>{t('export.results', 'Résultats de Compétition')}</Divider>

          {/* Exports PDF principaux */}
          <Space wrap>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              loading={loading === 'pdf-results'}
              onClick={() =>
                handleExport('pdf-results', () =>
                  exportResultsToPDF(results, {
                    language: exportLanguage,
                    includeGLPoints: true,
                  })
                )
              }
            >
              {t('export.pdfResults', 'Résultats PDF')}
            </Button>

            <Button
              icon={<FilePdfOutlined />}
              loading={loading === 'pdf-printable'}
              onClick={() =>
                handleExport('pdf-printable', () =>
                  exportPrintableSheet(results, { language: exportLanguage })
                )
              }
            >
              {t('export.printableSheets', 'Feuilles Imprimables')}
            </Button>
          </Space>

          <Divider>{t('export.official', 'Formats Officiels')}</Divider>

          {/* OpenPowerlifting */}
          <Card size="small" title="OpenPowerlifting" style={{ backgroundColor: '#f9f9f9' }}>
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                loading={loading === 'openpowerlifting'}
                onClick={handleOpenPowerliftingExport}
              >
                {t('export.openPowerliftingCSV', 'Export CSV OpenPowerlifting')}
              </Button>
              <span style={{ fontSize: 12, color: '#666' }}>
                Format standard pour archivage mondial
              </span>
            </Space>
          </Card>

          {/* FFForce */}
          <Card size="small" title="FFForce (France)" style={{ backgroundColor: '#f0f5ff' }}>
            <Space direction="vertical" size="middle">
              <Space wrap>
                <Button
                  icon={<FilePdfOutlined />}
                  loading={loading === 'ffforce-pdf'}
                  onClick={() =>
                    handleExport('ffforce-pdf', () =>
                      exportFFForceSheet(results, responsible)
                    )
                  }
                >
                  {t('export.ffforceSheet', 'Feuille de Match FFForce')}
                </Button>

                <Button
                  icon={<FileExcelOutlined />}
                  loading={loading === 'ffforce-csv'}
                  onClick={() =>
                    handleExport('ffforce-csv', () => exportFFForceDetailedCSV(results))
                  }
                >
                  {t('export.ffforceCSV', 'Export CSV Détaillé')}
                </Button>

                <Button
                  icon={<SafetyCertificateOutlined />}
                  loading={loading === 'ffforce-weighin'}
                  onClick={() =>
                    handleExport('ffforce-weighin', () =>
                      exportFFForceWeighInSheet(results)
                    )
                  }
                >
                  {t('export.weighInSheet', 'Feuille de Pesée')}
                </Button>
              </Space>
              <Alert
                message="Documents officiels FFForce"
                description="Feuille de match informatique et feuille de pesée conformes aux exigences de la Fédération Française de Force."
                type="info"
                showIcon
              />
            </Space>
          </Card>

          <Divider>{t('export.certificates', 'Certificats & Diplômes')}</Divider>

          {/* Certificats */}
          <Space wrap>
            <Button
              type="primary"
              icon={<TrophyOutlined />}
              loading={loading === 'podium-certificates'}
              onClick={() =>
                handleExport('podium-certificates', () =>
                  generateAllPodiumCertificates(results, exportLanguage)
                )
              }
              style={{ backgroundColor: '#faad14' }}
            >
              {t('export.podiumCertificates', 'Certificats Podium (Top 3)')}
            </Button>

            <Button
              icon={<SafetyCertificateOutlined />}
              loading={loading === 'participation'}
              onClick={() => {
                results.results.forEach((athlete) => {
                  generateParticipationCertificate(
                    athlete,
                    {
                      name: results.competition_name,
                      date: results.competition_date,
                      location: results.competition_location,
                      federation: results.federation,
                    },
                    exportLanguage
                  );
                });
                message.success(t('export.success'));
              }}
            >
              {t('export.participationCertificates', 'Certificats de Participation')}
            </Button>
          </Space>

          <Alert
            message={t('export.note', 'Note')}
            description={t(
              'export.noteDescription',
              'Les certificats sont générés au format PDF avec bordures décoratives or/argent/bronze pour le podium.'
            )}
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default ExportPanel;
