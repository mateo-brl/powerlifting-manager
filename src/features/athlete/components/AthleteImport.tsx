import { useState } from 'react';
import { Card, Upload, Button, message, Table, Alert, Space } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { UploadProps } from 'antd';
import { useAthleteStore } from '../stores/athleteStore';

interface CsvRow {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  weight_class: string;
  division: string;
  age_category: string;
}

export const AthleteImport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { competitionId } = useParams<{ competitionId: string }>();
  const { createAthlete } = useAthleteStore();
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(false);

  const parseCSV = (text: string): CsvRow[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      if (row.first_name && row.last_name && row.date_of_birth && row.gender && row.weight_class) {
        rows.push({
          first_name: row.first_name,
          last_name: row.last_name,
          date_of_birth: row.date_of_birth,
          gender: row.gender.toUpperCase(),
          weight_class: row.weight_class,
          division: row.division || 'raw',
          age_category: row.age_category || 'Open',
        });
      }
    }

    return rows;
  };

  const uploadProps: UploadProps = {
    accept: '.csv',
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        if (data.length === 0) {
          message.error(t('athlete.messages.error'));
        } else {
          setParsedData(data);
          message.success(t('athlete.messages.imported', { count: data.length }));
        }
      };
      reader.readAsText(file);
      return false;
    },
    showUploadList: false,
  };

  const handleImport = async () => {
    if (!competitionId) {
      message.error(t('competition.messages.error'));
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of parsedData) {
      try {
        await createAthlete({
          competition_id: competitionId,
          ...row,
        });
        successCount++;
      } catch (error) {
        console.error('Failed to import athlete:', row, error);
        errorCount++;
      }
    }

    setLoading(false);

    if (successCount > 0) {
      message.success(t('athlete.messages.imported', { count: successCount }));
    }
    if (errorCount > 0) {
      message.warning(t('athlete.messages.error'));
    }

    if (errorCount === 0) {
      navigate(`/competitions/${competitionId}`);
    }
  };

  const columns = [
    { title: t('athlete.fields.firstName'), dataIndex: 'first_name', key: 'first_name' },
    { title: t('athlete.fields.lastName'), dataIndex: 'last_name', key: 'last_name' },
    { title: t('athlete.fields.dateOfBirth'), dataIndex: 'date_of_birth', key: 'date_of_birth' },
    { title: t('athlete.fields.gender'), dataIndex: 'gender', key: 'gender' },
    { title: t('athlete.fields.weightClass'), dataIndex: 'weight_class', key: 'weight_class' },
    { title: t('athlete.fields.division'), dataIndex: 'division', key: 'division' },
    { title: t('athlete.fields.ageCategory'), dataIndex: 'age_category', key: 'age_category' },
  ];

  return (
    <Card
      title={t('athlete.import')}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/competitions/${competitionId}`)}
        >
          {t('common.back')}
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message={t('athlete.import')}
          description={
            <div>
              <p>CSV format:</p>
              <code>first_name, last_name, date_of_birth, gender, weight_class, division, age_category</code>
              <p style={{ marginTop: 8 }}>Example:</p>
              <code>John,Doe,1990-05-15,M,83kg,raw,Open</code>
            </div>
          }
          type="info"
          showIcon
        />

        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>{t('common.import')}</Button>
        </Upload>

        {parsedData.length > 0 && (
          <>
            <Alert
              message={t('athlete.messages.imported', { count: parsedData.length })}
              type="success"
              showIcon
            />

            <Table
              columns={columns}
              dataSource={parsedData}
              rowKey={(_, index) => index?.toString() || ''}
              pagination={{ pageSize: 10 }}
            />

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleImport}
              loading={loading}
              size="large"
            >
              {t('athlete.import')} {parsedData.length}
            </Button>
          </>
        )}
      </Space>
    </Card>
  );
};
