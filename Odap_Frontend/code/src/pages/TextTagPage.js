import React, { useEffect, useState } from 'react';
import {Layout, Button, Input, message, Card } from 'antd';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import MenuComponent from '../components/MenuList';

const TextTagPage = () => {
  const [tagList, setTagList] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const datasetId = searchParams.get('dataset_id');
  const sampleId = searchParams.get('sample_id');
  const sampleType = searchParams.get('sample_type');
  const sampleContent = searchParams.get('sample_content');

  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(`/manage/sample/?dataset_id=${datasetId}&sample_type=${sampleType}`);
  };

  const fetchTagList = async () => {
    const response = await axios.get(`http://localhost:8080/api/tags`, {
      params: {
        sample_id: sampleId,
        dataset_id: datasetId,
      },
    });
    if (response.data.code === 200) {
      setTagList(response.data.data);
    }
  };

  useEffect(() => {
    fetchTagList();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const start = formData.get('start');
    const end = formData.get('end');
    const label = formData.get('label');
    const response = await axios.post(
        `http://localhost:8080/api/tag/`,
        {
          dataset_id: datasetId,
          sample_id: sampleId,
          begin_pos: start.toString(),
          end_pos: end.toString(),
          tag: label.toString(),
        },
        {
          withCredentials: true,
        }
    );
    if (response.data.code === 200) {
      fetchTagList();
    }
  };

  const handleDelete = async (tagData) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/del_tag/${tagData.tag_id}`, { withCredentials: true });
      const { code } = response.data;
      if (code === 200) {
        message.success('删除成功', 1);
        fetchTagList();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <Layout style={{ minHeight: '100vh', display: 'flex' }}>
        <MenuComponent />
        <Layout>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button type="primary" onClick={handleGoBack} style={{ margin: '10px' }}>
                Go Back
              </Button>
              <h1 style={{ textAlign: 'center', flex: 1 }}>文本数据标注</h1>
            </div>

            <Card title="Sample Content">
              <div style={{ height: '20vh', fontSize: '20px', fontFamily: 'Arial, sans-serif', overflow: 'auto' }}>
                {sampleContent}
              </div>
            </Card>

            <Card title="Add Tag" style={{ marginTop: '20px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Input type="text" name="start" placeholder="开始位置" style={{ marginBottom: '10px', width: '50%' }} />
                <Input type="text" name="end" placeholder="终止位置" style={{ marginBottom: '10px', width: '50%' }} />
                <Input type="text" name="label" placeholder="标签" style={{ marginBottom: '10px', width: '50%' }} />
                <Button type="primary" htmlType="submit">提交</Button>
              </form>
            </Card>

            <Card title="Tag List">
              <table style={{ borderSpacing: '10px', width: '100%' }}>
                <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>开始位置</th>
                  <th style={{ textAlign: 'center' }}>结束位置</th>
                  <th style={{ textAlign: 'center' }}>标签</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {tagList.map((tagData) => (
                    <tr key={tagData.tag_id}>
                      <td style={{ textAlign: 'center' }}>{tagData.begin_pos}</td>
                      <td style={{ textAlign: 'center' }}>{tagData.end_pos}</td>
                      <td style={{ textAlign: 'center' }}>{tagData.tag}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Button onClick={() => handleDelete(tagData)}>Delete</Button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </Card>
          </div>
        </Layout>
      </Layout>
  );
};

export default TextTagPage;
