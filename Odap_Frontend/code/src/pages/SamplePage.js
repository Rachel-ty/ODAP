import React, { useEffect, useState } from 'react';
import { Table, Pagination, Layout, Button, Space, message, Card, Image } from 'antd';
import axios from 'axios';
import { DeleteOutlined } from '@ant-design/icons';
import MenuComponent from '../components/MenuList';
import { useLocation, useNavigate } from 'react-router-dom';
import { Content } from 'antd/es/layout/layout';

const SamplePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const datasetId = searchParams.get('dataset_id');
  const sampleType = searchParams.get('sample_type');
  const [datasets, setDatasets] = useState([]);
  const [total, setTotal] = useState(0); // all samples
  const [tagProgress,setTagProgress]=useState(0); // the portion of salmples that have been tagged
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const typeIsText = sampleType == "text";
  const typeIsImage = sampleType == "picture";
  const typeIsAudio = sampleType == "audio";
  const navigate = useNavigate();

  const handleNameClick = (record) => {
    const datasetId = record.datasetId;
    const sampleId = record.id;
    const sampleName = record.name;
    const sampleContent = record.content;
    if (typeIsText) {
      navigate(`/manage/sample/tagtext/?dataset_id=${datasetId}&sample_id=${sampleId}&sample_type=${sampleType}&sample_content=${sampleContent}`);
    }
    else if(typeIsImage){
      navigate(`/manage/sample/tag/?dataset_id=${datasetId}&sample_id=${sampleId}&sample_name=${sampleName}&sample_type=${sampleType}`);
    }
    else{
      navigate(`/manage/sample/tagaudio/?dataset_id=${datasetId}&sample_id=${sampleId}&sample_name=${sampleName}&sample_type=${sampleType}`);
    }
  };

  const handleGoBack = () => {
    navigate('/manage');
  };


  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/samples', {
        params: {
          page_num: currentPage,
          page_size: pageSize,
          dataset_id: datasetId,
          sample_type: sampleType,
        }
      });

      if (response.data.code === 200) {
        const { data } = response.data;
        setDatasets(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTotalTagged = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/count_tagged_samples/', {
        params: {
          dataset_id: datasetId,
        },
      });
      if (response.data.code === 200) {
        const { data } = response.data;
        if(total != 0){
          setTagProgress(Math.floor((data / total) * 100));
        }
        else{
          setTagProgress(0);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };



  const fetchTotalCount = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/count_samples/', {
        params: {
          dataset_id: datasetId,
          sample_type: sampleType,
        },
      });
      if (response.data.code === 200) {
        const { data } = response.data;
        setTotal(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTotalCount();
    // eslint-disable-next-line
  }, []);

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
    fetchData();
  };

  const handleDelete = async (id) => {
    // try {
    //   const response = await axios.delete(`http://localhost:8080/api/dataset/${id}`, {
    //     headers: {
    //       'Content-Type': undefined, 
    //     },
    //   });
    //   const { code } = response.data;
    //   if (code === 200) {
    //     message.success('success', 1, fetchData);
    //   } else {
    //     message.error('fail to delete');
    //   }
    // } catch (error) {
    //   console.error(error);
    // }
    message.error('You are not allowed to delete the sample', 1);
  };

  const columnIV = [ // for picture and audio data
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
          // eslint-disable-next-line
          <a onClick={() => handleNameClick(record, Content)}>{text}</a>
      ),
    },
    {
      title: 'Thumbnail',
      dataIndex: 'name',
      key: 'thumbnail',
      render: (text, record) => {
        if (text.endsWith('.jpg')) {
          return <Image src={`http://localhost:8080/api/sample_data?sample_id=${record.id}&dataset_id=${datasetId}&sample_type=${sampleType}`} width={100} />;
        }
        return null;
      },
    },
    {
      key: 'actions',
      width: 80,
      render: (text, record) => (
          <Space>
            <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
            />
          </Space>
      ),
    },
  ];

  const columnT = [ // for text data
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => (
          // eslint-disable-next-line
          <a onClick={() => handleNameClick(record)}>{text}</a>
      ),
    },

    {
      key: 'actions',
      width: 80,
      render: (text, record) => (
          <Space>
            <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
            />
          </Space>
      ),
    },
  ];
  fetchTotalTagged()
  return (
      <Layout style={{ minHeight: '100vh' }}>
        <MenuComponent />
        <Layout>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button type="primary" onClick={handleGoBack} style={{ margin: '10px' }}>
            Go Back
          </Button>
          <h1 style={{ textAlign: 'center', flex: 1 }}>Sample List</h1>
          <h3 style={{ textAlign: 'center', flex: 1 }}>Annotation Progress: {tagProgress}%</h3>
        </div>
            <Card>
              <Table dataSource={datasets} columns={typeIsText? columnT : columnIV} pagination={false} />
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePaginationChange}
                    showSizeChanger={false}
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                />
              </div>
            </Card>
          </div>
        </Layout>
      </Layout>
  );
};

export default SamplePage;
