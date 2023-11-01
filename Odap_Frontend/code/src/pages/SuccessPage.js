import React, { useEffect } from 'react';
import { Layout, Card, Carousel, Typography, Steps} from 'antd';
import { useNavigate } from 'react-router-dom';
import cookie from 'react-cookies';
import MenuComponent from '../components/MenuList';

const { Content } = Layout;
const { Title } = Typography;
// const { TabPane } = Tabs;
const { Step } = Steps;

const SuccessPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (cookie.load('user') === undefined) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <MenuComponent />
            <Layout>
                <Content style={{ margin: '16px' }}>
                    <Card>
                        <Title level={2}>Welcome, {cookie.load('user')}!</Title>

                        <Carousel autoplay autoplaySpeed={4000}>
                            <div>
                                <h3>复旦大学计算机科学与技术学院</h3>
                            </div>
                            <div>
                                <h3>移动互联网课程项目</h3>
                            </div>
                            <div>
                                <h3>在线数据标注平台</h3>
                            </div>
                        </Carousel>
                        {/*<img src="/logo-1.png" alt="Logo" style={{ width: '500px', marginBottom: '20px' }} />*/}
                        <Steps current={0}>
                            <Step title="Login" description="You've logged in." />
                            <Step title="Upload" description="Upload your dataset." />
                            <Step title="Tag" description="Start tagging！" />
                        </Steps>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default SuccessPage;
