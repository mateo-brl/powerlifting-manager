import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { Competition } from '../types';
import { useCompetitionStore } from '../stores/competitionStore';
import { formatDate } from '../../../shared/utils/formatters';

export const CompetitionList = () => {
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
      message.error('Failed to load competitions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompetition(id);
      message.success('Competition deleted successfully');
    } catch (error) {
      message.error('Failed to delete competition');
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string | null) => location || '-',
    },
    {
      title: 'Federation',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status || 'upcoming')}>
          {(status || 'upcoming').toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Upcoming', value: 'upcoming' },
        { text: 'Active', value: 'active' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/competitions/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/competitions/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete competition"
            description="Are you sure you want to delete this competition? This will also delete all athletes and attempts."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
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
          placeholder="Search competitions..."
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
          New Competition
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
          showTotal: (total) => `Total ${total} competitions`,
        }}
      />
    </div>
  );
};
