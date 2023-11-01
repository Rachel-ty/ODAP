import React, { useState } from 'react';
import { Form, Select, Input, Button, Upload, Card, Layout, message } from 'antd';
import MenuComponent from '../components/MenuList';

function FileUploadForm() {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);

  const handleFileChange = (info) => {
    setFile(info.file.originFileObj);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tag_type', values.tagType);
      formData.append('sample_type', values.sampleType);
      formData.append('desc', values.desc);
      console.log(formData)
      fetch('http://localhost:8080/api/dataset', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => {
          const { code } = data;
          if (code === 200) {
            message.success({
              content: '上传成功',
              duration: 1, // 设置消息显示持续时间为1秒
              onClose: () => {
                form.resetFields(); // 清空表单数据
              },
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <MenuComponent />
      <Layout>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1>上传数据集</h1>
          </div>
          <Card style={{ width: 400 }}>
            <Form form={form} onFinish={handleSubmit}>
              <Form.Item label="文件" name="file">
                <Upload onChange={handleFileChange}>
                  <Button>Select File</Button>
                </Upload>
              </Form.Item>
              <Form.Item label="标签类型" name="tagType">
                <Input />
              </Form.Item>
              <Form.Item label="样本类型" name="sampleType">
                <Select>
                  <Select.Option value="文本">文本</Select.Option>
                  <Select.Option value="语音">语音</Select.Option>
                  <Select.Option value="图片">图片</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="描述" name="desc">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  上传
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Layout>
    </Layout>
  );
}

export default FileUploadForm;
