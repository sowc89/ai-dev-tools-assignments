import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import { Toaster } from 'react-hot-toast'; // Optional: for notifications

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<EditorPage />} />
      </Routes>
    </>
  );
}

export default App;
