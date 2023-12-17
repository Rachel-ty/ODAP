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
          }
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
      withCredentials: true
    });
    if (response.data.code === 200) {
      response.data.data.forEach((tag) => {
        tag.begin_pos = JSON.parse(tag.begin_pos);
        tag.end_pos = JSON.parse(tag.end_pos);
      });
      setTagList(response.data.data);
    }
  };

  const handleMouseUp = async (e) => {
    const rect = e.target.getBoundingClientRect();
    const scaleX = e.target.naturalWidth / rect.width;
    const scaleY = e.target.naturalHeight / rect.height;
    setRectangleEnd({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
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
        message.success('success', 1, fetchTagList);
      } else {
        message.error('fail to delete');
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
              ref={cardRef}
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
                  const rect = e.target.getBoundingClientRect();
                  const scaleX = e.target.naturalWidth / rect.width;
                  const scaleY = e.target.naturalHeight / rect.height;
                  setRectangleStart({
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY,
                  });
                  setMouseDown(true);
                }}
                onMouseMove={(e) => {
                  if (mouseDown) {
                    const rect = e.target.getBoundingClientRect();
                    const scaleX = e.target.naturalWidth / rect.width;
                    const scaleY = e.target.naturalHeight / rect.height;
                    setRectangleEnd({
                      x: (e.clientX - rect.left) * scaleX ,
                      y: (e.clientY - rect.top) * scaleY ,
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
              {mouseDown &&(
                <div
                  style={{
                    border: '1px solid red',
                    position: 'absolute',
                    left: `${Math.min(rectangleStart.x, rectangleEnd.x)}px`,
                    top: `${Math.min(rectangleStart.y, rectangleEnd.y)}px`,
                    width: `${Math.abs(rectangleEnd.x - rectangleStart.x)}px`,
                    height: `${Math.abs(rectangleEnd.y - rectangleStart.y)}px`,
                  }}
                />
              )}
              {inputTag && (
                <Input
                  autoFocus
                  onBlur={(e) => {
                    handleTagSubmit(e.target.value);
                    setInputTag(false); // hide the input box
                  }}
                  onPressEnter={(e) => {
                    handleTagSubmit(e.target.value);
                    setInputTag(false); // hide the input box
                  }}
                  style={{
                    position: 'absolute',
                    left: `${Math.min(rectangleStart.x, rectangleEnd.x)}px`,
                    top: `${Math.min(rectangleStart.y, rectangleEnd.y)}px`, // place the input box under the rectangle
                    width: '200px',
                  }}
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
    padding: '2px 4px', 
    fontSize: '5px',
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
