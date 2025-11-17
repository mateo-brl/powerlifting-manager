import { GlobalOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (value: string | number) => {
    i18n.changeLanguage(value as string);
  };

  return (
    <Segmented
      value={i18n.language}
      onChange={handleChange}
      options={[
        {
          label: (
            <div style={{ padding: '0 8px' }}>
              <GlobalOutlined style={{ marginRight: 4 }} />
              FR
            </div>
          ),
          value: 'fr',
        },
        {
          label: (
            <div style={{ padding: '0 8px' }}>
              <GlobalOutlined style={{ marginRight: 4 }} />
              EN
            </div>
          ),
          value: 'en',
        },
      ]}
    />
  );
};
