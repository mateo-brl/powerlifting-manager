import { Layout as AntLayout, Menu, Typography, Button, Tooltip } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TrophyOutlined, HomeOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useThemeContext } from '../theme/ThemeContext';
import { colors } from '../theme';

const { Header, Content, Footer } = AntLayout;
const { Title } = Typography;

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useThemeContext();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: t('layout.menu.dashboard'),
      onClick: () => navigate('/'),
    },
    {
      key: '/competitions',
      icon: <TrophyOutlined />,
      label: t('layout.menu.competitions'),
      onClick: () => navigate('/competitions'),
    },
  ];

  const selectedKey = menuItems.find(item =>
    location.pathname === item.key || location.pathname.startsWith(item.key + '/')
  )?.key || '/';

  const headerBg = isDark ? colors.bgDark : colors.primary;
  const contentBg = isDark ? colors.bgDark : colors.bgSecondary;
  const cardBg = isDark ? colors.bgDarkSecondary : colors.bgPrimary;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: headerBg,
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TrophyOutlined style={{ fontSize: '24px', color: '#fff' }} />
          <Title level={3} style={{ margin: 0, color: '#fff' }}>
            {t('layout.appName')}
          </Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0, marginLeft: '24px', background: 'transparent' }}
          />
          <Tooltip title={isDark ? t('layout.lightMode') : t('layout.darkMode')}>
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{ color: '#fff', fontSize: '18px' }}
            />
          </Tooltip>
          <LanguageSwitcher />
        </div>
      </Header>

      <Content style={{ padding: '24px', background: contentBg }}>
        <div style={{
          background: cardBg,
          padding: '24px',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 134px)'
        }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: headerBg, color: '#fff' }}>
        Powerlifting Manager ©{new Date().getFullYear()} - Made with Tauri & React
      </Footer>
    </AntLayout>
  );
};
