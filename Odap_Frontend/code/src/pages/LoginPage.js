import React from 'react';
import { Card, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = React.useState(false);

    const handleLogin = (userData) => {
        navigate('/index', { state: { userData } });
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
            <img src="/logo-1.png" alt="Logo" style={{ width: '500px', marginBottom: '20px' }} />
            <Card style={{ width: 500 }}>
                <h2>Login</h2>
                <LoginForm onLogin={handleLogin} showModal={showModal} />
            </Card>
            <Modal title="Register" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
                <RegisterForm />
            </Modal>
        </div>
    );

};

export default LoginPage;
