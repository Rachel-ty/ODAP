import React, { useEffect, useState, useRef } from 'react';
import { Layout, Button, Input, Card, message } from 'antd';
import axios from 'axios';
import MenuComponent from '../components/MenuList';
import { useLocation, useNavigate } from 'react-router-dom';

const { Content } = Layout;

const AudioTagPage = () => {
  const cardRef = useRef();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const datasetId = searchParams.get('dataset_id');
  const sampleId = searchParams.get('sample_id');
  const sampleName = searchParams.get('sample_name');
  const sampleType = searchParams.get('sample_type');

  let wx = 0;
  let wy = 0;

  const navigate = useNavigate();
  const [audioUrl, setAudioUrl] = useState('');
  const [tagList, setTagList] = useState([]);

  const handleGoBack = () => {
    navigate(`/manage/sample/?dataset_id=${datasetId}&sample_type=${sampleType}`);
  };

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchTagList();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/sample_data`, {
          responseType: 'blob',
          params: {
            sample_id: sampleId,
            dataset_id: datasetId,
            sample_type: sampleType,
          },
        });
        const blob = response.data;
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [sampleId, datasetId]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    setIsPlaying(true); // 设置初始状态为播放
  }, []);

  const fetchTagList = async () => {
    const response = await axios.get(`http://localhost:8080/api/tags`, {
      params: {
        sample_id: sampleId,
        dataset_id: datasetId,
      },
      withCredentials: true
    });
    if (response.data.code === 200) {
      setTagList(response.data.data);
    }
  };

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
    <Layout style={{ minHeight: '100vh' }}>
      <MenuComponent />
      <Layout>
        <Content style={{ padding: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Button type="primary" onClick={handleGoBack} style={{ marginRight: '10px' }}>
                Go Back
              </Button>
              <h1 style={{ textAlign: 'center', flex: 1 }}>{sampleName}标注</h1>
            </div>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
              <audio src={audioUrl} controls={isPlaying} style={{ marginBottom: '10px' }} />
              {isPlaying ? (
                  <Button onClick={handlePause}>Pause</Button>
              ) : (
                  <Button onClick={handlePlay}>Play</Button>
              )}
            </div>

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
        </Content>
      </Layout>
    </Layout>
  );
}

export default AudioTagPage;
