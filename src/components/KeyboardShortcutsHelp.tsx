import { Modal, Table, Tag, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface ShortcutItem {
  key: string;
  description: string;
  category: string;
}

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
  shortcuts?: ShortcutItem[];
}

const defaultShortcuts: ShortcutItem[] = [
  { key: 'G', description: 'shortcuts.goodLift', category: 'competition' },
  { key: 'R', description: 'shortcuts.noLift', category: 'competition' },
  { key: 'N', description: 'shortcuts.nextAthlete', category: 'competition' },
  { key: 'Space', description: 'shortcuts.startStopTimer', category: 'timer' },
  { key: 'T', description: 'shortcuts.resetTimer', category: 'timer' },
  { key: 'P', description: 'shortcuts.pauseResume', category: 'competition' },
  { key: '?', description: 'shortcuts.showHelp', category: 'general' },
  { key: 'Escape', description: 'shortcuts.closeModal', category: 'general' },
];

export function KeyboardShortcutsHelp({ open, onClose, shortcuts = defaultShortcuts }: KeyboardShortcutsHelpProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('shortcuts.key'),
      dataIndex: 'key',
      key: 'key',
      width: 120,
      render: (key: string) => (
        <Tag
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '4px 12px',
            borderRadius: '4px',
          }}
        >
          {key}
        </Tag>
      ),
    },
    {
      title: t('shortcuts.action'),
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => <Text>{t(desc)}</Text>,
    },
  ];

  const categoryOrder = ['competition', 'timer', 'general'];
  const groupedShortcuts = categoryOrder.map(cat => ({
    category: cat,
    items: shortcuts.filter(s => s.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <Modal
      title={
        <span>
          <QuestionCircleOutlined style={{ marginRight: 8 }} />
          {t('shortcuts.title')}
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      {groupedShortcuts.map(group => (
        <div key={group.category} style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            {t(`shortcuts.category.${group.category}`)}
          </Text>
          <Table
            dataSource={group.items.map((item, idx) => ({ ...item, key: idx }))}
            columns={columns}
            pagination={false}
            size="small"
            showHeader={group.category === groupedShortcuts[0].category}
          />
        </div>
      ))}
      <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
        {t('shortcuts.hint')}
      </Text>
    </Modal>
  );
}
