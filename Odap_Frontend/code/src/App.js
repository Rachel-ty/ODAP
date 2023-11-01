import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SuccessPage from './pages/SuccessPage';
import UploadPage from "./pages/UploadPage";
import ManagePage from './pages/ManagePage';
import SamplePage from './pages/SamplePage';
import TagPage from './pages/TagPage';
import TextTagPage from './pages/TextTagPage';
import AudioTagPage from './pages/AudioTagPage';
import UserManagePage from './pages/UserManagePage';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/index" element={<SuccessPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/manage" element={<ManagePage/>} />
        <Route path="/manage/sample" element={<SamplePage />} />
        <Route path="/manage/sample/tag" element={<TagPage />} />
        <Route path="/manage/sample/tagtext" element={<TextTagPage />} />
        <Route path="/manage/sample/tagaudio" element={<AudioTagPage />} />
        <Route path="/user_manage" element={<UserManagePage/>} />
      </Routes>
    </Router>
  );
}
export default App;
