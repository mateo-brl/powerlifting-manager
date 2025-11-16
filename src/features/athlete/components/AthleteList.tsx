import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { Athlete } from '../types';
import { useAthleteStore } from '../stores/athleteStore';

interface AthleteListProps {
  competitionId: string;
}

export const AthleteList = ({ competitionId }: AthleteListProps) => {
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
      message.error('Failed to load athletes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAthlete(id);
      message.success('Athlete deleted successfully');
    } catch (error) {
      message.error('Failed to delete athlete');
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = ['Last Name', 'First Name', 'Date of Birth', 'Gender', 'Weight Class', 'Division', 'Lot Number', 'Bodyweight'];
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
    message.success('CSV exported successfully');
  };

  const competitionAthletes = athletes.filter((a) => a.competition_id === competitionId);

  const filteredAthletes = competitionAthletes.filter((athlete) =>
    athlete.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
    athlete.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
    athlete.weight_class.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Athlete> = [
    {
      title: 'Lot #',
      dataIndex: 'lot_number',
      key: 'lot_number',
      width: 80,
      render: (lot: number | null) => lot || '-',
      sorter: (a, b) => (a.lot_number || 999) - (b.lot_number || 999),
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
      sorter: (a, b) => a.last_name.localeCompare(b.last_name),
    },
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: string) => (
        <Tag color={gender === 'M' ? 'blue' : 'pink'}>{gender}</Tag>
      ),
      filters: [
        { text: 'Male', value: 'M' },
        { text: 'Female', value: 'F' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: 'Weight Class',
      dataIndex: 'weight_class',
      key: 'weight_class',
      width: 120,
    },
    {
      title: 'Division',
      dataIndex: 'division',
      key: 'division',
      width: 100,
      render: (division: string) => (
        <Tag color={division === 'raw' ? 'green' : 'purple'}>
          {division.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Raw', value: 'raw' },
        { text: 'Equipped', value: 'equipped' },
      ],
      onFilter: (value, record) => record.division === value,
    },
    {
      title: 'Age Category',
      dataIndex: 'age_category',
      key: 'age_category',
      width: 120,
    },
    {
      title: 'Bodyweight',
      dataIndex: 'bodyweight',
      key: 'bodyweight',
      width: 110,
      render: (weight: number | null) => weight ? `${weight} kg` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/competitions/${competitionId}/athletes/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete athlete"
            description="Are you sure you want to delete this athlete?"
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
          placeholder="Search athletes..."
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
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/competitions/${competitionId}/athletes/new`)}
          >
            Add Athlete
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
          showTotal: (total) => `Total ${total} athletes`,
        }}
      />
    </div>
  );
};
