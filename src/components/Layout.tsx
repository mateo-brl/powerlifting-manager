import { Layout as AntLayout, Menu, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TrophyOutlined, HomeOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = AntLayout;
const { Title } = Typography;

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: '/competitions',
      icon: <TrophyOutlined />,
      label: 'Competitions',
      onClick: () => navigate('/competitions'),
    },
  ];

  const selectedKey = menuItems.find(item =>
    location.pathname === item.key || location.pathname.startsWith(item.key + '/')
  )?.key || '/';

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#001529',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TrophyOutlined style={{ fontSize: '24px', color: '#fff' }} />
          <Title level={3} style={{ margin: 0, color: '#fff' }}>
            Powerlifting Manager
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, marginLeft: '24px' }}
        />
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 134px)'
        }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
        Powerlifting Manager ©{new Date().getFullYear()} - Made with Tauri & React
      </Footer>
    </AntLayout>
  );
};
