import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <ConfigProvider locale={frFR}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#001529', padding: '0 24px' }}>
          <Title level={3} style={{ color: 'white', margin: '16px 0' }}>
            Powerlifting Manager
          </Title>
        </Header>
        <Content style={{ padding: '24px' }}>
          <div style={{ background: 'white', padding: 24, minHeight: 360 }}>
            <Title level={2}>Bienvenue dans Powerlifting Manager</Title>
            <p>Application de gestion de compétitions de powerlifting</p>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
