import React, { useEffect, useState } from 'react';
import { Table, Pagination, Layout, Button, message, Space ,Card} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import MenuComponent from '../components/MenuList';
import { useNavigate } from 'react-router-dom';

const ManagePage = () => {
  const [datasets, setDatasets] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const navigate = useNavigate();

  const handleNameClick = (record) => {
    const datasetId = record._id;
    const sampleType = record.sample_type;
    navigate(`/manage/sample/?dataset_id=${datasetId}&sample_type=${sampleType}`);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/datasets', {
        params: {
          page_num: currentPage,
          page_size: pageSize,
        },
      });

      if (response.data.code === 200) {
        const { data } = response.data;
        setDatasets(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/count_datasets');
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
  }, []);

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
    fetchData();
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/del_dataset/${id}`, { withCredentials: true });
      const { code } = response.data;
      if (code === 200) {
        message.success('success', 1, fetchData);
      } else {
        message.error('fail to delete');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'dataset_name',
      key: 'dataset_name',
      render: (text, record) => (
        // eslint-disable-next-line
        <a onClick={() => handleNameClick(record)}>{text}</a>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: 'Sample Type',
      dataIndex: 'sample_type',
      key: 'sample_type',
    },
    {
      key: 'actions',
      width: 80,
      render: (text, record) => (
        <Space>
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <MenuComponent />
      <Layout>
        <div>
          <h1 style={{ textAlign: 'center' }}>Dataset List</h1>
          <Card>
          <Table dataSource={datasets} columns={columns} pagination={false} />

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePaginationChange}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            style={{ textAlign: 'center' }}
          />
          </Card>
        </div>
      </Layout>
    </Layout>
  );
};

export default ManagePage;
