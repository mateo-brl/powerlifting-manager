import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Modal, Input, Space, Typography, Badge, Empty, Tabs, message } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import {
  Protest,
  ProtestStatus,
  PROTEST_TYPE_LABELS,
  PROTEST_STATUS_LABELS,
} from '../types/protest';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface JuryPanelProps {
  competitionId: string;
}

export const JuryPanel = ({ competitionId }: JuryPanelProps) => {
  const { t, i18n } = useTranslation();
  const [pendingProtests, setPendingProtests] = useState<Protest[]>([]);
  const [allProtests, setAllProtests] = useState<Protest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProtest, setSelectedProtest] = useState<Protest | null>(null);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [juryNotes, setJuryNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const currentLang = i18n.language as 'fr' | 'en';

  const loadPendingProtests = useCallback(async () => {
    try {
      const protests = await invoke<Protest[]>('get_pending_protests', {
        competitionId,
      });
      setPendingProtests(protests);
    } catch (error) {
      console.error('Failed to load pending protests:', error);
    }
  }, [competitionId]);

  const loadAllProtests = useCallback(async () => {
    try {
      const protests = await invoke<Protest[]>('get_protest_history', {
        competitionId,
      });
      setAllProtests(protests);
    } catch (error) {
      console.error('Failed to load protest history:', error);
    }
  }, [competitionId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPendingProtests(), loadAllProtests()]);
    setLoading(false);
  }, [loadPendingProtests, loadAllProtests]);

  useEffect(() => {
    loadData();

    // Auto-refresh every 15 seconds if there are pending protests (reduced from 5s for performance)
    const interval = setInterval(() => {
      if (pendingProtests.length > 0 || activeTab === 'pending') {
        loadPendingProtests();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [loadData, loadPendingProtests, pendingProtests.length, activeTab]);

  const handleResolve = async (decision: 'accepted' | 'rejected') => {
    if (!selectedProtest) return;

    setResolving(true);
    try {
      await invoke('resolve_protest', {
        input: {
          protest_id: selectedProtest.id,
          decision,
          jury_notes: juryNotes,
        },
      });

      message.success(
        decision === 'accepted'
          ? t('protest.acceptedSuccess')
          : t('protest.rejectedSuccess')
      );

      setResolveModalVisible(false);
      setSelectedProtest(null);
      setJuryNotes('');
      loadData();
    } catch (error) {
      console.error('Failed to resolve protest:', error);
      message.error(t('protest.resolveError'));
    } finally {
      setResolving(false);
    }
  };

  const openResolveModal = (protest: Protest) => {
    setSelectedProtest(protest);
    setJuryNotes('');
    setResolveModalVisible(true);
  };

  const openDetailModal = (protest: Protest) => {
    setSelectedProtest(protest);
    setDetailModalVisible(true);
  };

  const getStatusTag = (status: ProtestStatus) => {
    const colors: Record<ProtestStatus, string> = {
      pending: 'orange',
      accepted: 'green',
      rejected: 'red',
    };
    return (
      <Tag color={colors[status]}>
        {PROTEST_STATUS_LABELS[status][currentLang]}
      </Tag>
    );
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const columns = [
    {
      title: t('protest.time'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 100,
      render: (timestamp: number) => formatTimestamp(timestamp),
    },
    {
      title: t('protest.type'),
      dataIndex: 'protest_type',
      key: 'protest_type',
      width: 150,
      render: (type: keyof typeof PROTEST_TYPE_LABELS) => (
        <Tag>{PROTEST_TYPE_LABELS[type][currentLang]}</Tag>
      ),
    },
    {
      title: t('protest.reason'),
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => (
        <Text ellipsis={{ tooltip: reason }}>{reason}</Text>
      ),
    },
    {
      title: t('protest.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ProtestStatus) => getStatusTag(status),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Protest) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetailModal(record)}
          >
            {t('protest.viewDetails')}
          </Button>
          {record.status === 'pending' && (
            <Button
              size="small"
              type="primary"
              onClick={() => openResolveModal(record)}
            >
              {t('protest.resolve')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const historyColumns = [
    ...columns.slice(0, -1),
    {
      title: t('protest.juryDecision'),
      dataIndex: 'jury_decision',
      key: 'jury_decision',
      width: 120,
      render: (_decision: string | undefined, record: Protest) => (
        record.status !== 'pending' ? getStatusTag(record.status) : '-'
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      render: (_: unknown, record: Protest) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openDetailModal(record)}
        >
          {t('protest.viewDetails')}
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('protest.juryPanel')}</Title>
          {pendingProtests.length > 0 && (
            <Badge count={pendingProtests.length} style={{ backgroundColor: '#faad14' }} />
          )}
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={loadData}
          loading={loading}
        >
          {t('common.refresh')}
        </Button>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'pending',
            label: (
              <Space>
                {t('protest.pendingProtests')}
                {pendingProtests.length > 0 && (
                  <Badge count={pendingProtests.length} size="small" />
                )}
              </Space>
            ),
            children: pendingProtests.length > 0 ? (
              <Table
                dataSource={pendingProtests}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                aria-label={t('protest.aria.pendingTable')}
              />
            ) : (
              <Empty description={t('protest.noPendingProtests')} />
            ),
          },
          {
            key: 'history',
            label: t('protest.history'),
            children: allProtests.length > 0 ? (
              <Table
                dataSource={allProtests}
                columns={historyColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="small"
                aria-label={t('protest.aria.historyTable')}
              />
            ) : (
              <Empty description={t('protest.noProtestHistory')} />
            ),
          },
        ]}
      />

      {/* Resolve Modal */}
      <Modal
        title={t('protest.resolveProtest')}
        open={resolveModalVisible}
        onCancel={() => {
          setResolveModalVisible(false);
          setSelectedProtest(null);
          setJuryNotes('');
        }}
        footer={null}
        width={500}
      >
        {selectedProtest && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>{t('protest.type')}: </Text>
              <Tag>{PROTEST_TYPE_LABELS[selectedProtest.protest_type as keyof typeof PROTEST_TYPE_LABELS][currentLang]}</Tag>
            </div>
            <div>
              <Text strong>{t('protest.reason')}: </Text>
              <Text>{selectedProtest.reason}</Text>
            </div>
            <div>
              <Text strong>{t('protest.juryNotes')}: </Text>
              <TextArea
                rows={3}
                value={juryNotes}
                onChange={(e) => setJuryNotes(e.target.value)}
                placeholder={t('protest.juryNotesPlaceholder')}
                aria-label={t('protest.aria.juryNotes')}
              />
            </div>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                icon={<CloseOutlined />}
                danger
                onClick={() => handleResolve('rejected')}
                loading={resolving}
              >
                {t('protest.reject')}
              </Button>
              <Button
                icon={<CheckOutlined />}
                type="primary"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleResolve('accepted')}
                loading={resolving}
              >
                {t('protest.accept')}
              </Button>
            </Space>
          </Space>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={t('protest.protestDetails')}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedProtest(null);
        }}
        footer={
          <Button onClick={() => setDetailModalVisible(false)}>
            {t('common.close')}
          </Button>
        }
        width={500}
      >
        {selectedProtest && (
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <Text strong>{t('protest.time')}: </Text>
              <Text>{formatTimestamp(selectedProtest.timestamp)}</Text>
            </div>
            <div>
              <Text strong>{t('protest.deadline')}: </Text>
              <Text>{formatTimestamp(selectedProtest.protest_deadline)}</Text>
            </div>
            <div>
              <Text strong>{t('protest.type')}: </Text>
              <Tag>{PROTEST_TYPE_LABELS[selectedProtest.protest_type as keyof typeof PROTEST_TYPE_LABELS][currentLang]}</Tag>
            </div>
            <div>
              <Text strong>{t('protest.status')}: </Text>
              {getStatusTag(selectedProtest.status)}
            </div>
            <div>
              <Text strong>{t('protest.reason')}: </Text>
              <Text>{selectedProtest.reason}</Text>
            </div>
            {selectedProtest.jury_notes && (
              <div>
                <Text strong>{t('protest.juryNotes')}: </Text>
                <Text>{selectedProtest.jury_notes}</Text>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </Card>
  );
};
