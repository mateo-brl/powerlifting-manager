import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

const { confirm } = Modal;

export type ConfirmType = 'danger' | 'warning' | 'info';

interface ConfirmOptions {
  title: string;
  content?: string;
  type?: ConfirmType;
  okText?: string;
  cancelText?: string;
  onOk: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Hook for showing confirmation dialogs before destructive actions
 */
export function useConfirmAction() {
  const { t } = useTranslation();

  const showConfirm = useCallback((options: ConfirmOptions) => {
    const {
      title,
      content,
      type = 'warning',
      okText = t('common.confirm'),
      cancelText = t('common.cancel'),
      onOk,
      onCancel,
    } = options;

    const isDanger = type === 'danger';

    confirm({
      title,
      icon: <ExclamationCircleOutlined style={{ color: isDanger ? '#ff4d4f' : '#faad14' }} />,
      content,
      okText,
      okType: isDanger ? 'primary' : 'default',
      okButtonProps: isDanger ? { danger: true } : undefined,
      cancelText,
      centered: true,
      maskClosable: true,
      onOk,
      onCancel,
    });
  }, [t]);

  // Shortcut for delete confirmation
  const confirmDelete = useCallback((
    itemName: string,
    onDelete: () => void | Promise<void>,
    additionalMessage?: string
  ) => {
    showConfirm({
      title: t('confirm.deleteTitle', { item: itemName }),
      content: additionalMessage || t('confirm.deleteMessage'),
      type: 'danger',
      okText: t('common.delete'),
      onOk: onDelete,
    });
  }, [showConfirm, t]);

  // Shortcut for end competition confirmation
  const confirmEndCompetition = useCallback((
    onEnd: () => void | Promise<void>
  ) => {
    showConfirm({
      title: t('confirm.endCompetitionTitle'),
      content: t('confirm.endCompetitionMessage'),
      type: 'warning',
      okText: t('confirm.endCompetitionOk'),
      onOk: onEnd,
    });
  }, [showConfirm, t]);

  // Shortcut for reset confirmation
  const confirmReset = useCallback((
    itemName: string,
    onReset: () => void | Promise<void>
  ) => {
    showConfirm({
      title: t('confirm.resetTitle', { item: itemName }),
      content: t('confirm.resetMessage'),
      type: 'warning',
      okText: t('confirm.resetOk'),
      onOk: onReset,
    });
  }, [showConfirm, t]);

  return {
    showConfirm,
    confirmDelete,
    confirmEndCompetition,
    confirmReset,
  };
}
