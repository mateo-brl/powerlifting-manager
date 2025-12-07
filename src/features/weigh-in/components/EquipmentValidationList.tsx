import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, Typography, Modal, Select, Badge, Empty, message } from 'antd';
import { CheckCircleOutlined, WarningOutlined, ReloadOutlined, SafetyOutlined, ExportOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { AthleteEquipment } from '../types/equipment';
import { EquipmentValidator } from './EquipmentValidator';
import { isIPFApproved } from '../../../shared/constants/ipfEquipment';

const { Title, Text } = Typography;

interface EquipmentValidationListProps {
  competitionId: string;
}

type FilterStatus = 'all' | 'validated' | 'non_validated';

export const EquipmentValidationList = ({ competitionId }: EquipmentValidationListProps) => {
  const { t } = useTranslation();
  const [allEquipment, setAllEquipment] = useState<AthleteEquipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteEquipment | null>(null);
  const [validatorModalVisible, setValidatorModalVisible] = useState(false);

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const equipment = await invoke<AthleteEquipment[]>('get_all_equipment', {
        competitionId,
      });
      setAllEquipment(equipment);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const filteredEquipment = allEquipment.filter((eq) => {
    if (filterStatus === 'validated') return eq.equipment_validated;
    if (filterStatus === 'non_validated') return !eq.equipment_validated;
    return true;
  });

  const stats = {
    total: allEquipment.length,
    validated: allEquipment.filter((eq) => eq.equipment_validated).length,
    nonValidated: allEquipment.filter((eq) => !eq.equipment_validated).length,
  };

  const hasNonIPFEquipment = (equipment: AthleteEquipment) => {
    const checks = [
      { brand: equipment.equipment_singlet_brand, category: 'singlets' as const },
      { brand: equipment.equipment_belt_brand, category: 'belts' as const },
      { brand: equipment.equipment_knee_sleeves_brand, category: 'knee_sleeves' as const },
      { brand: equipment.equipment_wrist_wraps_brand, category: 'wrist_wraps' as const },
      { brand: equipment.equipment_shoes_brand, category: 'shoes' as const },
    ];

    return checks.some(({ brand, category }) => brand && !isIPFApproved(category, brand));
  };

  const getEquipmentSummary = (equipment: AthleteEquipment) => {
    const items: string[] = [];
    if (equipment.equipment_singlet_brand) items.push(equipment.equipment_singlet_brand);
    if (equipment.equipment_belt_brand) items.push(equipment.equipment_belt_brand);
    if (equipment.equipment_knee_sleeves_brand) items.push(equipment.equipment_knee_sleeves_brand);
    if (equipment.equipment_wrist_wraps_brand) items.push(equipment.equipment_wrist_wraps_brand);
    if (equipment.equipment_shoes_brand) items.push(equipment.equipment_shoes_brand);
    return items.length > 0 ? items.join(', ') : '-';
  };

  const handleOpenValidator = (athlete: AthleteEquipment) => {
    setSelectedAthlete(athlete);
    setValidatorModalVisible(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Athlete',
      'Singlet',
      'Singlet Brand',
      'Belt',
      'Belt Brand',
      'Knee Sleeves',
      'Knee Sleeves Brand',
      'Wrist Wraps',
      'Wrist Wraps Brand',
      'Shoes',
      'Shoes Brand',
      'Validated',
      'Validator',
      'Validation Date',
    ];

    const rows = allEquipment.map((eq) => [
      eq.athlete_name,
      eq.equipment_singlet || '',
      eq.equipment_singlet_brand || '',
      eq.equipment_belt || '',
      eq.equipment_belt_brand || '',
      eq.equipment_knee_sleeves || '',
      eq.equipment_knee_sleeves_brand || '',
      eq.equipment_wrist_wraps || '',
      eq.equipment_wrist_wraps_brand || '',
      eq.equipment_shoes || '',
      eq.equipment_shoes_brand || '',
      eq.equipment_validated ? 'Yes' : 'No',
      eq.equipment_validator_name || '',
      eq.equipment_validation_timestamp
        ? new Date(eq.equipment_validation_timestamp * 1000).toISOString()
        : '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment_validation_${competitionId}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    message.success(t('equipment.exportSuccess'));
  };

  const columns = [
    {
      title: t('athlete.title'),
      dataIndex: 'athlete_name',
      key: 'athlete_name',
      width: 200,
    },
    {
      title: t('equipment.equipment'),
      key: 'equipment',
      render: (_: unknown, record: AthleteEquipment) => (
        <Text ellipsis={{ tooltip: getEquipmentSummary(record) }} style={{ maxWidth: 300 }}>
          {getEquipmentSummary(record)}
        </Text>
      ),
    },
    {
      title: t('equipment.ipfCompliance'),
      key: 'ipf_compliance',
      width: 150,
      render: (_: unknown, record: AthleteEquipment) => (
        hasNonIPFEquipment(record) ? (
          <Tag icon={<WarningOutlined />} color="warning">
            {t('equipment.nonCompliant')}
          </Tag>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success">
            {t('equipment.compliant')}
          </Tag>
        )
      ),
    },
    {
      title: t('equipment.status'),
      key: 'status',
      width: 150,
      render: (_: unknown, record: AthleteEquipment) => (
        record.equipment_validated ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            {t('equipment.validated')}
          </Tag>
        ) : (
          <Tag color="default">{t('equipment.notValidated')}</Tag>
        )
      ),
    },
    {
      title: t('equipment.validator'),
      dataIndex: 'equipment_validator_name',
      key: 'validator',
      width: 150,
      render: (name: string | undefined) => name || '-',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: AthleteEquipment) => (
        <Button
          size="small"
          type={record.equipment_validated ? 'default' : 'primary'}
          icon={<SafetyOutlined />}
          onClick={() => handleOpenValidator(record)}
        >
          {record.equipment_validated ? t('equipment.view') : t('equipment.validate')}
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <SafetyOutlined />
          <Title level={4} style={{ margin: 0 }}>{t('equipment.validationList')}</Title>
        </Space>
      }
      extra={
        <Space>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: t('equipment.filterAll') },
              { value: 'validated', label: t('equipment.filterValidated') },
              { value: 'non_validated', label: t('equipment.filterNonValidated') },
            ]}
          />
          <Button icon={<ExportOutlined />} onClick={handleExportCSV}>
            {t('common.export')} CSV
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadEquipment} loading={loading}>
            {t('common.refresh')}
          </Button>
        </Space>
      }
    >
      {/* Stats */}
      <Space style={{ marginBottom: 16 }} size="large">
        <Badge
          count={stats.total}
          style={{ backgroundColor: '#1890ff' }}
          overflowCount={999}
        >
          <Tag style={{ padding: '4px 12px' }}>{t('equipment.total')}</Tag>
        </Badge>
        <Badge
          count={stats.validated}
          style={{ backgroundColor: '#52c41a' }}
          overflowCount={999}
        >
          <Tag color="success" style={{ padding: '4px 12px' }}>{t('equipment.validated')}</Tag>
        </Badge>
        <Badge
          count={stats.nonValidated}
          style={{ backgroundColor: stats.nonValidated > 0 ? '#faad14' : '#d9d9d9' }}
          overflowCount={999}
        >
          <Tag color={stats.nonValidated > 0 ? 'warning' : 'default'} style={{ padding: '4px 12px' }}>
            {t('equipment.notValidated')}
          </Tag>
        </Badge>
      </Space>

      {filteredEquipment.length > 0 ? (
        <Table
          dataSource={filteredEquipment}
          columns={columns}
          rowKey="weigh_in_id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="small"
        />
      ) : (
        <Empty description={t('equipment.noEquipment')} />
      )}

      {/* Validator Modal */}
      <Modal
        title={t('equipment.validationTitle')}
        open={validatorModalVisible}
        onCancel={() => {
          setValidatorModalVisible(false);
          setSelectedAthlete(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        {selectedAthlete && (
          <EquipmentValidator
            weighInId={selectedAthlete.weigh_in_id}
            athleteName={selectedAthlete.athlete_name}
            initialEquipment={selectedAthlete}
            onSaved={() => {
              loadEquipment();
              setValidatorModalVisible(false);
              setSelectedAthlete(null);
            }}
          />
        )}
      </Modal>
    </Card>
  );
};
