import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Athlete } from '../types';
import { useAthleteStore } from '../stores/athleteStore';

interface AthleteListProps {
  competitionId: string;
}

export const AthleteList = ({ competitionId }: AthleteListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { athletes, loadAthletes, deleteAthlete } = useAthleteStore();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, [competitionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadAthletes(competitionId);
    } catch (error) {
      message.error(t('athlete.messages.error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAthlete(id);
      message.success(t('athlete.messages.deleted'));
    } catch (error) {
      message.error(t('athlete.messages.error'));
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = [t('athlete.fields.lastName'), t('athlete.fields.firstName'), t('athlete.fields.dateOfBirth'), t('athlete.fields.gender'), t('athlete.fields.weightClass'), t('athlete.fields.division'), t('athlete.fields.lotNumber'), t('athlete.fields.bodyweight')];
    const csvData = filteredAthletes.map((athlete) => [
      athlete.last_name,
      athlete.first_name,
      athlete.date_of_birth,
      athlete.gender,
      athlete.weight_class,
      athlete.division,
      athlete.lot_number || '',
      athlete.bodyweight || '',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `athletes_${competitionId}.csv`;
    link.click();
    message.success(t('athlete.messages.exportSuccess'));
  };

  const competitionAthletes = athletes.filter((a) => a.competition_id === competitionId);

  const filteredAthletes = competitionAthletes.filter((athlete) =>
    athlete.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
    athlete.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
    athlete.weight_class.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Athlete> = [
    {
      title: t('athlete.fields.lotNumber'),
      dataIndex: 'lot_number',
      key: 'lot_number',
      width: 80,
      render: (lot: number | null) => lot || '-',
      sorter: (a, b) => (a.lot_number || 999) - (b.lot_number || 999),
    },
    {
      title: t('athlete.fields.lastName'),
      dataIndex: 'last_name',
      key: 'last_name',
      sorter: (a, b) => a.last_name.localeCompare(b.last_name),
    },
    {
      title: t('athlete.fields.firstName'),
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
    },
    {
      title: t('athlete.fields.gender'),
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: string) => (
        <Tag color={gender === 'M' ? 'blue' : 'pink'}>{t(`athlete.gender.${gender}`)}</Tag>
      ),
      filters: [
        { text: t('athlete.gender.M'), value: 'M' },
        { text: t('athlete.gender.F'), value: 'F' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: t('athlete.fields.weightClass'),
      dataIndex: 'weight_class',
      key: 'weight_class',
      width: 120,
    },
    {
      title: t('athlete.fields.division'),
      dataIndex: 'division',
      key: 'division',
      width: 100,
      render: (division: string) => (
        <Tag color={division === 'raw' ? 'green' : 'purple'}>
          {t(`athlete.division.${division}`).toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: t('athlete.division.raw'), value: 'raw' },
        { text: t('athlete.division.equipped'), value: 'equipped' },
      ],
      onFilter: (value, record) => record.division === value,
    },
    {
      title: t('athlete.fields.ageCategory'),
      dataIndex: 'age_category',
      key: 'age_category',
      width: 120,
    },
    {
      title: t('athlete.fields.bodyweight'),
      dataIndex: 'bodyweight',
      key: 'bodyweight',
      width: 110,
      render: (weight: number | null) => weight ? `${weight} kg` : '-',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/competitions/${competitionId}/athletes/${record.id}/edit`)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.delete')}
            description={t('athlete.messages.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder={t('common.search')}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            disabled={filteredAthletes.length === 0}
          >
            {t('athlete.export')}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/competitions/${competitionId}/athletes/new`)}
          >
            {t('athlete.new')}
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAthletes}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `${t('athlete.total')} ${total}`,
        }}
      />
    </div>
  );
};
