import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

function Register() {
    const [form] = Form.useForm();

    const onFinish = values => {
        axios.post('http://localhost:8080/api/user/register', values)
            .then(response => {
                const { code, error_msg } = response.data;
                if (code === 200) {
                    message.success('Registration successful');
                    
                } else {
                    message.error(error_msg);
                }
            })
            .catch(err => {
                console.log(err);
                message.error('Registration Failed');
            });
    };

    return (
        <Form
            form={form}
            name="register"
            onFinish={onFinish}
        >
            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords do not match!'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Register
                </Button>
            </Form.Item>
        </Form>
    );
}

export default Register;
