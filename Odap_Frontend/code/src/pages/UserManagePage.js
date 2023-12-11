import React, { useEffect, useState} from 'react';
import { Table, Pagination, Layout, Button, Space, message, Card} from 'antd';
import axios from 'axios';
import { DeleteOutlined } from '@ant-design/icons';
import MenuComponent from '../components/MenuList';
import {useNavigate } from 'react-router-dom';



const UserManagePage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
      }, [currentPage]);
    
      const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/user_by_pages', {
                params: {
                    page_num: currentPage,
                    page_size: pageSize
                },
                withCredentials: true
            });
            if (response.data.code === 200) {
                const { data } = response.data;
                setUsers(data);
                setTotal(data.length);
            }
        }   catch (error) {
                console.error(error);
            }
      };

    const handleGoBack = () => {
        navigate('/index');
    };
    
    const handlePaginationChange = (page) => {
        setCurrentPage(page);
        fetchData();
    };

    const handleDelete = async(userName) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/del_user`, {
                responseType: 'blob',
                params: {
                  user_name: userName
                },
                withCredentials: true
            });
            const code = response.status;
            if (code === 200) {
                console.log(response);
                message.success('删除成功');
                fetchData();
            } else {
                message.error("删除失败", code);
                alert(code);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const columns = [
        {
          title: 'User Name',
          dataIndex: 'userName',
          key: 'userName',
        },
        {
          key: 'actions',
          width: 80,
          render: (text, record) => (
            <Space>
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.userName)}
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="primary" onClick={handleGoBack} style={{ margin: '10px' }}>
              Go Back
            </Button>
            <h1 style={{ textAlign: 'center', flex: 1 }}>用户列表</h1>
              </div>
              <Card>
                <Table dataSource={users} columns={columns} pagination={false} />
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


export default UserManagePage;