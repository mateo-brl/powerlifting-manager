/**
 * Composant de notification visuelle pour les records
 */

import React, { useEffect, useState } from 'react';
import { Alert, Badge, Tag, Space, Card } from 'antd';
import {
  TrophyOutlined,
  ThunderboltOutlined,
  FireOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RecordCheck, RecordType } from '../types';
import { generateRecordMessage } from '../services/recordDetection';

interface RecordNotificationProps {
  recordCheck: RecordCheck;
  athleteName: string;
  liftType: 'squat' | 'bench' | 'deadlift' | 'total';
  recordType?: RecordType;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

const RecordNotification: React.FC<RecordNotificationProps> = ({
  recordCheck,
  athleteName,
  liftType,
  recordType = 'national',
  onClose,
  autoClose = false,
  autoCloseDuration = 10000,
}) => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, visible, onClose]);

  if (!recordCheck.hasRecord || !visible) {
    return null;
  }

  const message = generateRecordMessage(
    recordCheck,
    athleteName,
    liftType,
    i18n.language as 'fr' | 'en'
  );

  if (!message) {
    return null;
  }

  const recordTypeLabels = {
    fr: {
      world: 'Mondial',
      national: 'National',
      regional: 'Régional',
      personal: 'Personnel',
    },
    en: {
      world: 'World',
      national: 'National',
      regional: 'Regional',
      personal: 'Personal',
    },
  };

  const recordTypeLabel =
    recordTypeLabels[i18n.language as 'fr' | 'en'][recordType];

  // Notification pour nouveau record
  if (recordCheck.isNewRecord) {
    return (
      <Alert
        message={
          <Space>
            <TrophyOutlined style={{ fontSize: 20, color: '#faad14' }} />
            <strong>{message}</strong>
          </Space>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <Tag color="gold" icon={<StarOutlined />}>
              {t('records.newRecord', 'Nouveau Record')} {recordTypeLabel}
            </Tag>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              {t('records.previousRecord', 'Ancien record')}:{' '}
              <strong>{recordCheck.record?.weight_kg}kg</strong> par{' '}
              {recordCheck.record?.athlete_name}
              <br />
              {t('records.improvement', 'Amélioration')}:{' '}
              <strong style={{ color: '#52c41a' }}>
                +{recordCheck.difference?.toFixed(1)}kg
              </strong>
            </div>
          </div>
        }
        type="success"
        showIcon
        closable
        onClose={() => {
          setVisible(false);
          onClose?.();
        }}
        style={{
          backgroundColor: '#f6ffed',
          border: '2px solid #52c41a',
          animation: 'pulse 2s infinite',
        }}
      />
    );
  }

  // Notification pour record approché
  if (recordCheck.isApproached) {
    return (
      <Alert
        message={
          <Space>
            <ThunderboltOutlined style={{ fontSize: 18, color: '#faad14' }} />
            <strong>{message}</strong>
          </Space>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <Tag color="orange" icon={<FireOutlined />}>
              {t('records.recordApproached', 'Record Approché')} {recordTypeLabel}
            </Tag>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              {t('records.currentRecord', 'Record actuel')}:{' '}
              <strong>{recordCheck.record?.weight_kg}kg</strong> par{' '}
              {recordCheck.record?.athlete_name}
              <br />
              {t('records.distance', 'Distance')}:{' '}
              <strong style={{ color: '#faad14' }}>
                {Math.abs(recordCheck.difference!).toFixed(1)}kg
              </strong>
            </div>
          </div>
        }
        type="warning"
        showIcon
        closable
        onClose={() => {
          setVisible(false);
          onClose?.();
        }}
        style={{
          backgroundColor: '#fffbe6',
          border: '2px solid #faad14',
        }}
      />
    );
  }

  return null;
};

/**
 * Badge de record pour afficher à côté des tentatives
 */
export const RecordBadge: React.FC<{
  recordCheck: RecordCheck;
  recordType: RecordType;
}> = ({ recordCheck, recordType }) => {
  if (!recordCheck.hasRecord) {
    return null;
  }

  if (recordCheck.isNewRecord) {
    return (
      <Badge
        count={
          <Tag color="gold" icon={<TrophyOutlined />} style={{ margin: 0 }}>
            NEW {recordType.toUpperCase()} RECORD
          </Tag>
        }
      />
    );
  }

  if (recordCheck.isApproached) {
    return (
      <Badge
        count={
          <Tag color="orange" icon={<ThunderboltOutlined />} style={{ margin: 0 }}>
            -{Math.abs(recordCheck.difference!).toFixed(1)}kg
          </Tag>
        }
      />
    );
  }

  return null;
};

/**
 * Panneau de tous les records pour un athlète/tentative
 */
export const RecordPanel: React.FC<{
  recordChecks: { [key in RecordType]?: RecordCheck };
  athleteName: string;
  liftType: 'squat' | 'bench' | 'deadlift' | 'total';
}> = ({ recordChecks, athleteName, liftType }) => {
  const { t } = useTranslation();

  const hasAnyRecord = Object.values(recordChecks).some(
    (check) => check?.isNewRecord || check?.isApproached
  );

  if (!hasAnyRecord) {
    return null;
  }

  return (
    <Card
      size="small"
      title={t('records.title', 'État des Records')}
      style={{ marginTop: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {Object.entries(recordChecks).map(([type, check]) => {
          if (!check || (!check.isNewRecord && !check.isApproached)) {
            return null;
          }

          return (
            <RecordNotification
              key={type}
              recordCheck={check}
              athleteName={athleteName}
              liftType={liftType}
              recordType={type as RecordType}
            />
          );
        })}
      </Space>
    </Card>
  );
};

export default RecordNotification;

// CSS pour l'animation pulse
const style = document.createElement('style');
style.innerHTML = `
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
  }
}
`;
document.head.appendChild(style);
