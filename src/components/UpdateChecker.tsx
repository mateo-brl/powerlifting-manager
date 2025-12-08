import { useEffect, useState } from 'react';
import { Modal, Button, Progress, Typography, Space, message } from 'antd';
import { CloudDownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const { Text, Paragraph } = Typography;

interface UpdateInfo {
  version: string;
  date?: string;
  body?: string;
}

export function UpdateChecker() {
  const { t } = useTranslation();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await check();
      if (update) {
        setUpdateAvailable(true);
        setUpdateInfo({
          version: update.version,
          date: update.date,
          body: update.body,
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.log('Update check failed:', error);
      // Silently fail - don't bother the user if update check fails
    }
  };

  const downloadUpdate = async () => {
    if (!updateAvailable) return;

    setDownloading(true);
    setDownloadProgress(0);

    try {
      const update = await check();
      if (update) {
        let totalSize = 0;
        let downloadedSize = 0;

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              totalSize = event.data.contentLength || 0;
              setDownloadProgress(0);
              break;
            case 'Progress':
              downloadedSize += event.data.chunkLength;
              if (totalSize > 0) {
                setDownloadProgress(Math.min((downloadedSize / totalSize) * 100, 99));
              }
              break;
            case 'Finished':
              setDownloadProgress(100);
              setDownloaded(true);
              break;
          }
        });
      }
    } catch (error) {
      console.error('Download failed:', error);
      message.error(t('update.downloadError'));
      setDownloading(false);
    }
  };

  const handleRelaunch = async () => {
    try {
      await relaunch();
    } catch (error) {
      console.error('Relaunch failed:', error);
      message.error(t('update.relaunchError'));
    }
  };

  const handleClose = () => {
    if (!downloading) {
      setModalVisible(false);
    }
  };

  const handleRemindLater = () => {
    setModalVisible(false);
    message.info(t('update.remindLater'));
  };

  if (!updateAvailable) return null;

  return (
    <Modal
      title={
        <Space>
          <CloudDownloadOutlined />
          {t('update.title')}
        </Space>
      }
      open={modalVisible}
      onCancel={handleClose}
      footer={null}
      closable={!downloading}
      maskClosable={!downloading}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>{t('update.newVersion')}: </Text>
          <Text code>{updateInfo?.version}</Text>
        </div>

        {updateInfo?.body && (
          <div>
            <Text strong>{t('update.releaseNotes')}:</Text>
            <Paragraph
              style={{
                maxHeight: 200,
                overflow: 'auto',
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              {updateInfo.body}
            </Paragraph>
          </div>
        )}

        {downloading && (
          <div>
            <Text>{t('update.downloading')}...</Text>
            <Progress percent={Math.round(downloadProgress)} status="active" />
          </div>
        )}

        {downloaded ? (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRelaunch}
            block
            size="large"
          >
            {t('update.restartNow')}
          </Button>
        ) : (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleRemindLater} disabled={downloading}>
              {t('update.later')}
            </Button>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={downloadUpdate}
              loading={downloading}
            >
              {t('update.downloadInstall')}
            </Button>
          </Space>
        )}
      </Space>
    </Modal>
  );
}
