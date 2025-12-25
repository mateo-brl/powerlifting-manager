import { Card, Button, Space, message } from 'antd';
import { DesktopOutlined, TeamOutlined, UsergroupAddOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useConfirmAction } from '../../../../shared/hooks/useConfirmAction';

export interface QuickActionsCardProps {
  isCompetitionActive: boolean;
  onOpenExternalDisplay: () => Promise<void>;
  onOpenSpottersDisplay: () => Promise<void>;
  onOpenWarmupDisplay: () => Promise<void>;
  onResetToStart: () => void;
  onSkipAttempt: () => void;
  onEndCompetition: () => void;
}

/**
 * Quick actions card with display and control buttons
 */
export const QuickActionsCard = ({
  isCompetitionActive,
  onOpenExternalDisplay,
  onOpenSpottersDisplay,
  onOpenWarmupDisplay,
  onResetToStart,
  onSkipAttempt,
  onEndCompetition,
}: QuickActionsCardProps) => {
  const { t } = useTranslation();
  const { confirmReset } = useConfirmAction();

  const handleReset = () => {
    confirmReset(t('live.attemptOrder'), () => {
      onResetToStart();
      message.success(t('live.messages.reset'));
    });
  };

  return (
    <Card title={t('live.quickActions.title')} size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          icon={<DesktopOutlined />}
          onClick={onOpenExternalDisplay}
          block
          style={{ background: '#722ed1', borderColor: '#722ed1' }}
        >
          {t('live.display.external')}
        </Button>
        <Button
          type="primary"
          icon={<TeamOutlined />}
          onClick={onOpenSpottersDisplay}
          block
          style={{ background: '#13c2c2', borderColor: '#13c2c2' }}
        >
          {t('live.display.spotters')}
        </Button>
        <Button
          type="primary"
          icon={<UsergroupAddOutlined />}
          onClick={onOpenWarmupDisplay}
          block
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          {t('live.display.warmup')}
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          block
        >
          {t('live.quickActions.resetToStart')}
        </Button>
        <Button
          onClick={onSkipAttempt}
          disabled={!isCompetitionActive}
          block
        >
          {t('live.quickActions.skipAttempt')}
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={onEndCompetition}
          block
          danger
          style={{ marginTop: 16 }}
        >
          {t('live.quickActions.endCompetition')}
        </Button>
      </Space>
    </Card>
  );
};
