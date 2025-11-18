/**
 * Composant de gestion des plateformes multi-compétition
 */

import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Badge,
  Tooltip,
  Progress,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Platform, PlatformStats } from '../types';

interface PlatformManagementProps {
  competitionId: string;
  platforms: Platform[];
  platformStats: PlatformStats[];
  onCreatePlatform: (platform: Omit<Platform, 'id' | 'created_at'>) => Promise<void>;
  onUpdatePlatform: (id: string, updates: Partial<Platform>) => Promise<void>;
  onDeletePlatform: (id: string) => Promise<void>;
  onSyncPlatforms: () => Promise<void>;
}

const PlatformManagement: React.FC<PlatformManagementProps> = ({
  competitionId,
  platforms,
  platformStats,
  onCreatePlatform,
  onUpdatePlatform,
  onDeletePlatform,
  onSyncPlatforms,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();

      if (editingPlatform) {
        await onUpdatePlatform(editingPlatform.id, values);
        message.success(t('platform.updateSuccess', 'Plateforme mise à jour'));
      } else {
        await onCreatePlatform({
          competition_id: competitionId,
          name: values.name,
          location: values.location,
          active: values.active ?? true,
        });
        message.success(t('platform.createSuccess', 'Plateforme créée'));
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingPlatform(null);
    } catch (error) {
      console.error('Error saving platform:', error);
      message.error(t('platform.saveError', 'Erreur lors de la sauvegarde'));
    }
  };

  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    form.setFieldsValue(platform);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t('platform.deleteConfirm', 'Supprimer la plateforme ?'),
      content: t(
        'platform.deleteWarning',
        'Tous les athlètes et tentatives associés seront dissociés de cette plateforme.'
      ),
      okText: t('common.delete', 'Supprimer'),
      okType: 'danger',
      cancelText: t('common.cancel', 'Annuler'),
      onOk: async () => {
        try {
          await onDeletePlatform(id);
          message.success(t('platform.deleteSuccess', 'Plateforme supprimée'));
        } catch (error) {
          message.error(t('platform.deleteError', 'Erreur lors de la suppression'));
        }
      },
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSyncPlatforms();
      message.success(t('platform.syncSuccess', 'Synchronisation réussie'));
    } catch (error) {
      message.error(t('platform.syncError', 'Erreur de synchronisation'));
    } finally {
      setSyncing(false);
    }
  };

  const getStats = (platformId: string): PlatformStats | undefined => {
    return platformStats.find((s) => s.platform_id === platformId);
  };

  const columns = [
    {
      title: t('platform.name', 'Nom'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Platform) => (
        <Space>
          <EnvironmentOutlined />
          <strong>{text}</strong>
          {!record.active && (
            <Tag color="default">{t('platform.inactive', 'Inactive')}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('platform.location', 'Emplacement'),
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => text || '-',
    },
    {
      title: t('platform.status', 'État'),
      key: 'status',
      render: (_: any, record: Platform) => {
        const stats = getStats(record.id);
        if (!stats) {
          return (
            <Tag icon={<CloseCircleOutlined />} color="default">
              {t('platform.noData', 'Pas de données')}
            </Tag>
          );
        }

        const progress = Math.round(
          (stats.athletes_completed / stats.total_athletes) * 100
        );

        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Progress
                percent={progress}
                size="small"
                status={progress === 100 ? 'success' : 'active'}
              />
            </div>
            <Space>
              <Tag color="blue">
                {stats.athletes_in_progress} {t('platform.inProgress', 'en cours')}
              </Tag>
              <Tag color="green">
                {stats.athletes_completed} {t('platform.completed', 'terminés')}
              </Tag>
            </Space>
          </Space>
        );
      },
    },
    {
      title: t('platform.currentLift', 'Mouvement actuel'),
      key: 'currentLift',
      render: (_: any, record: Platform) => {
        const stats = getStats(record.id);
        if (!stats?.current_lift_type) {
          return '-';
        }

        const liftColors = {
          squat: 'blue',
          bench: 'green',
          deadlift: 'red',
        };

        return (
          <Tag color={liftColors[stats.current_lift_type]}>
            {stats.current_lift_type.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: t('platform.athletes', 'Athlètes'),
      key: 'athletes',
      render: (_: any, record: Platform) => {
        const stats = getStats(record.id);
        return (
          <Badge count={stats?.total_athletes || 0} showZero color="#1890ff" />
        );
      },
    },
    {
      title: t('common.actions', 'Actions'),
      key: 'actions',
      render: (_: any, record: Platform) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            {t('common.edit', 'Modifier')}
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>
            {t('common.delete', 'Supprimer')}
          </Button>
        </Space>
      ),
    },
  ];

  const activePlatforms = platforms.filter((p) => p.active).length;

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <EnvironmentOutlined style={{ fontSize: 20 }} />
            {t('platform.management', 'Gestion des Plateformes')}
          </Space>
        }
        extra={
          <Space>
            <Tooltip title={t('platform.syncAll', 'Synchroniser toutes les plateformes')}>
              <Button
                icon={<SyncOutlined spin={syncing} />}
                onClick={handleSync}
                loading={syncing}
                disabled={platforms.length < 2}
              >
                {t('platform.sync', 'Synchroniser')}
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingPlatform(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              {t('platform.add', 'Ajouter Plateforme')}
            </Button>
          </Space>
        }
      >
        {platforms.length > 1 && (
          <Alert
            message={t('platform.multiPlatformActive', 'Mode Multi-Plateformes Actif')}
            description={t(
              'platform.multiPlatformDesc',
              `${activePlatforms} plateforme(s) active(s). Les résultats sont fusionnés automatiquement.`
            )}
            type="info"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          dataSource={platforms}
          columns={columns}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: t(
              'platform.noPlat forms',
              'Aucune plateforme. Créez-en une pour commencer.'
            ),
          }}
        />
      </Card>

      <Modal
        title={
          editingPlatform
            ? t('platform.edit', 'Modifier la Plateforme')
            : t('platform.create', 'Créer une Plateforme')
        }
        open={isModalVisible}
        onOk={handleCreateOrUpdate}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingPlatform(null);
        }}
        okText={t('common.save', 'Enregistrer')}
        cancelText={t('common.cancel', 'Annuler')}
      >
        <Form form={form} layout="vertical" initialValues={{ active: true }}>
          <Form.Item
            name="name"
            label={t('platform.name', 'Nom')}
            rules={[
              {
                required: true,
                message: t('platform.nameRequired', 'Le nom est requis'),
              },
            ]}
          >
            <Input placeholder={t('platform.namePlaceholder', 'ex: Plateforme A')} />
          </Form.Item>

          <Form.Item name="location" label={t('platform.location', 'Emplacement')}>
            <Input
              placeholder={t(
                'platform.locationPlaceholder',
                'ex: Salle principale'
              )}
            />
          </Form.Item>

          <Form.Item
            name="active"
            label={t('platform.active', 'Active')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlatformManagement;
