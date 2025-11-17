import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Competition } from '../types';
import { useCompetitionStore } from '../stores/competitionStore';
import { formatDate } from '../../../shared/utils/formatters';

export const CompetitionList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { competitions, loadCompetitions, deleteCompetition } = useCompetitionStore();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadCompetitions();
    } catch (error) {
      message.error(t('competition.messages.error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompetition(id);
      message.success(t('competition.messages.deleted'));
    } catch (error) {
      message.error(t('competition.messages.error'));
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'upcoming':
        return 'orange';
      default:
        return 'default';
    }
  };

  const filteredCompetitions = competitions.filter((comp) =>
    comp.name.toLowerCase().includes(searchText.toLowerCase()) ||
    comp.location?.toLowerCase().includes(searchText.toLowerCase()) ||
    comp.federation.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Competition> = [
    {
      title: t('competition.fields.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('competition.fields.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: t('competition.fields.location'),
      dataIndex: 'location',
      key: 'location',
      render: (location: string | null) => location || '-',
    },
    {
      title: t('competition.fields.federation'),
      dataIndex: 'federation',
      key: 'federation',
      filters: [
        { text: 'IPF', value: 'IPF' },
        { text: 'USAPL', value: 'USAPL' },
        { text: 'USPA', value: 'USPA' },
        { text: 'FFForce', value: 'FFForce' },
      ],
      onFilter: (value, record) => record.federation === value,
    },
    {
      title: t('competition.fields.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status || 'upcoming')}>
          {t(`competition.status.${status || 'upcoming'}`).toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: t('competition.status.upcoming'), value: 'upcoming' },
        { text: t('competition.status.in_progress'), value: 'active' },
        { text: t('competition.status.completed'), value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/competitions/${record.id}`)}
          >
            {t('competition.view')}
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/competitions/${record.id}/edit`)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.delete')}
            description={t('competition.messages.deleteConfirm')}
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/competitions/new')}
        >
          {t('competition.new')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCompetitions}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${t('competition.title')} ${total}`,
        }}
      />
    </div>
  );
};
