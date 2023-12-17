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
              content: 'upload successfully',
              duration: 1, // notification timeout
              onClose: () => {
                form.resetFields(); // clear form
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
            <h1>Upload Dataset</h1>
          </div>
          <Card style={{ width: 400 }}>
            <Form form={form} onFinish={handleSubmit}>
              <Form.Item label="File" name="file">
                <Upload onChange={handleFileChange}>
                  <Button>Select File</Button>
                </Upload>
              </Form.Item>
              <Form.Item label="Type of Label" name="tagType">
                <Input />
              </Form.Item>
              <Form.Item label="Type of Sample" name="sampleType">
                <Select>
                  <Select.Option value="text">Text</Select.Option>
                  <Select.Option value="audio">Audio</Select.Option>
                  <Select.Option value="picture">Picture</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Description" name="desc">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  upload
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
