import { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Select, Input, Button, Alert, Progress, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import {
  ProtestFormValues,
  PROTEST_TYPE_LABELS,
  PROTEST_DEADLINE_SECONDS,
  PROTEST_REASON_MIN_LENGTH,
} from '../types/protest';

const { TextArea } = Input;
const { Text } = Typography;

interface ProtestModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  competitionId: string;
  athleteId: string;
  athleteName: string;
  attemptId: string;
  attemptTimestamp: number; // Unix timestamp of when the attempt was validated
}

export const ProtestModal = ({
  visible,
  onClose,
  onSuccess,
  competitionId,
  athleteId,
  athleteName,
  attemptId,
  attemptTimestamp,
}: ProtestModalProps) => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm<ProtestFormValues>();
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(PROTEST_DEADLINE_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  const currentLang = i18n.language as 'fr' | 'en';

  // Calculate remaining time
  const calculateRemainingTime = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    const deadline = attemptTimestamp + PROTEST_DEADLINE_SECONDS;
    const remaining = Math.max(0, deadline - now);
    return remaining;
  }, [attemptTimestamp]);

  // Timer effect
  useEffect(() => {
    if (!visible) return;

    const updateTimer = () => {
      const remaining = calculateRemainingTime();
      setRemainingTime(remaining);
      setIsExpired(remaining === 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [visible, calculateRemainingTime]);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async (values: ProtestFormValues) => {
    if (isExpired) {
      return;
    }

    setLoading(true);
    try {
      await invoke('create_protest', {
        input: {
          competition_id: competitionId,
          athlete_id: athleteId,
          attempt_id: attemptId,
          protest_type: values.protest_type,
          reason: values.reason,
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create protest:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressStatus = () => {
    if (remainingTime <= 10) return 'exception';
    if (remainingTime <= 30) return 'active';
    return 'normal';
  };

  const getProgressColor = () => {
    if (remainingTime <= 10) return '#ff4d4f';
    if (remainingTime <= 30) return '#faad14';
    return '#1890ff';
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          {t('protest.title')}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      {/* Timer Display */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Space>
            <ClockCircleOutlined />
            <Text strong>{t('protest.timeRemaining')}</Text>
          </Space>
          <Text
            strong
            style={{
              fontSize: 20,
              color: getProgressColor(),
            }}
          >
            {remainingTime}s
          </Text>
        </div>
        <Progress
          percent={(remainingTime / PROTEST_DEADLINE_SECONDS) * 100}
          status={getProgressStatus()}
          showInfo={false}
          strokeColor={getProgressColor()}
        />
      </div>

      {isExpired ? (
        <Alert
          message={t('protest.expired')}
          description={t('protest.expiredDescription')}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          {/* Athlete Info */}
          <Alert
            message={t('protest.forAthlete', { name: athleteName })}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="protest_type"
              label={t('protest.type')}
              rules={[{ required: true, message: t('protest.typeRequired') }]}
            >
              <Select placeholder={t('protest.selectType')}>
                <Select.Option value="referee_decision">
                  {PROTEST_TYPE_LABELS.referee_decision[currentLang]}
                </Select.Option>
                <Select.Option value="equipment">
                  {PROTEST_TYPE_LABELS.equipment[currentLang]}
                </Select.Option>
                <Select.Option value="procedure">
                  {PROTEST_TYPE_LABELS.procedure[currentLang]}
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reason"
              label={t('protest.reason')}
              rules={[
                { required: true, message: t('protest.reasonRequired') },
                {
                  min: PROTEST_REASON_MIN_LENGTH,
                  message: t('protest.reasonMinLength', { count: PROTEST_REASON_MIN_LENGTH }),
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={t('protest.reasonPlaceholder')}
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={isExpired}
                  danger
                >
                  {t('protest.submit')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};
