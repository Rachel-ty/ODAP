import React, { useEffect, useState, useRef } from 'react';
import { Layout, Button, Input, Card, message } from 'antd';
import axios from 'axios';
import MenuComponent from '../components/MenuList';
import { useLocation, useNavigate } from 'react-router-dom';

const TagPage = () => {
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
  const [imageUrl, setImageUrl] = useState('');
  const [tagList, setTagList] = useState([]);
  const [mouseDown, setMouseDown] = useState(false);
  const [rectangleStart, setRectangleStart] = useState({ x: 0, y: 0 });
  const [rectangleEnd, setRectangleEnd] = useState({ x: 0, y: 0 });
  const [inputTag, setInputTag] = useState(false);
  const [imageElement, setImageElement] = useState(null);

  const handleGoBack = () => {
    navigate(`/manage/sample/?dataset_id=${datasetId}&sample_type=${sampleType}`);
  };

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
        const imageUrl = URL.createObjectURL(blob);
        setImageUrl(imageUrl);
      } catch (error) {
        console.error(error);
      }
    };

    wx = document.getElementById('left-card').offsetWidth;
    wy = document.getElementById('left-card').offsetHeight;

    fetchData();
    fetchTagList();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMouseDown(false);
        setInputTag(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sampleId, datasetId]);

  const fetchTagList = async () => {
    const response = await axios.get(`http://localhost:8080/api/tags`, {
      params: {
        sample_id: sampleId,
        dataset_id: datasetId,
      },
    });
    if (response.data.code === 200) {
      response.data.data.forEach((tag) => {
        tag.begin_pos = JSON.parse(tag.begin_pos);
        tag.end_pos = JSON.parse(tag.end_pos);
      });
      setTagList(response.data.data);
    }
  };

  const handleMouseUp = async () => {
    setMouseDown(false);
    setInputTag(true);
  };

  const handleTagSubmit = async (tag) => {
    setInputTag(false);
    const response = await axios.post(
      `http://localhost:8080/api/tag/`,
      {
        dataset_id: datasetId,
        sample_id: sampleId,
        begin_pos: JSON.stringify([rectangleStart.x, rectangleStart.y]),
        end_pos: JSON.stringify([rectangleEnd.x, rectangleEnd.y]),
        tag,
      },
      {
        withCredentials: true,
      }
    );
    if (response.data.code === 200) {
      fetchTagList();
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/del_tag/${id}`, { withCredentials: true });
      const { code } = response.data;
      if (code === 200) {
        message.success('删除成功', 1, fetchTagList);
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button type="primary" onClick={handleGoBack} style={{ margin: '10px' }}>
            Go Back
          </Button>
          <h1 style={{ textAlign: 'center', flex: 1 }}>{sampleName}</h1>
        </div>
        <div style={{ display: 'flex', alignItems:'stretch', flex: '1' }}>
          <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
            <Card
              id="left-card"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '1000px',
                height: '700px',
                position: 'relative',
              }}
            >
              <img
                draggable="false"
                ref={setImageElement}
                src={imageUrl}
                onMouseDown={(e) => {
                  setMouseDown(true);
                  const rect = e.target.getBoundingClientRect();
                  const scaleX = e.target.width / rect.width;
                  const scaleY = e.target.height / rect.height;
                  setRectangleStart({
                    x: (e.clientX - rect.left) * scaleX + 248,
                    y: (e.clientY - rect.top) * scaleY + 98,
                  });
                  setRectangleEnd({
                    x: (e.clientX - rect.left) * scaleX + 248,
                    y: (e.clientY - rect.top) * scaleY + 98,
                  });
                }}
                onMouseMove={(e) => {
                  if (mouseDown) {
                    const rect = e.target.getBoundingClientRect();
                    const scaleX = e.target.width / rect.width;
                    const scaleY = e.target.height / rect.height;
                    setRectangleEnd({
                      x: (e.clientX - rect.left) * scaleX + 248,
                      y: (e.clientY - rect.top) * scaleY + 98,
                    });
                  }
                }}
                onMouseUp={handleMouseUp}
                style={{
                  cursor: 'crosshair',
                  width: '500px',
                  objectFit: 'cover',
                  position: 'relative',
                }}
              />
              {mouseDown && (
                <div
                  style={{
                    border: '1px solid red',
                    position: 'absolute',
                    left: rectangleStart.x,
                    top: rectangleStart.y,
                    width: rectangleEnd.x - rectangleStart.x,
                    height: rectangleEnd.y - rectangleStart.y,
                  }}
                />
              )}
              {inputTag && (
                <Input
                  autoFocus
                  onBlur={(e) => handleTagSubmit(e.target.value)}
                  onPressEnter={(e) => handleTagSubmit(e.target.value)}
                  style={{ position: 'absolute', left: rectangleEnd.x, top: rectangleEnd.y, width: '200px' }}
                />
              )}
              {tagList.map((tagItem, index) => (
                <div
                
                  key={index}
                  style={{
                    border: '1px solid red',
                    position: 'absolute',
                    left: tagItem.begin_pos[0],
                    top: tagItem.begin_pos[1],
                    width: tagItem.end_pos[0] - tagItem.begin_pos[0],
                    height: tagItem.end_pos[1] - tagItem.begin_pos[1],
                  }}
                >

                  {/* {index + 1} */}
                  <Button
  type="link"
  danger
  style={{
    backgroundColor: '#ff0000',
    color: '#ffffff',
    padding: '2px 4px', // 调整按钮的内边距
    fontSize: '5px', // 调整按钮的字体大小
  }}
  onClick={() => handleDelete(tagItem.tag_id)}
>
  {index + 1}. DEL
</Button>
                </div>
              ))}
            </Card>
          </div>
          <div style={{ flex: '1', padding: '0px', maxWidth: '400px', overflow: 'auto' }}>
            <Card
  id="right-card"
  style={{
    height: '100%',
    overflow: 'auto',
    minHeight: '700px',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fontSize: '20px',
  }}
>
  {tagList.map((tagItem, index) => (
    <div key={index}>
      <div>{`${index + 1}. ${tagItem.tag}`}</div>
    </div>
  ))}
</Card>
          </div>
        </div>
      </Layout>
    </Layout>
  );
};

export default TagPage;
