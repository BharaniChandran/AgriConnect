import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/select-language" replace />} />
        <Route path="/select-language" element={<LanguageSelector />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
