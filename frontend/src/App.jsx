import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';
import Dashboard from './components/Dashboard';
import RejectLot from './components/RejectLot';
import ResolutionCenter from './components/ResolutionCenter';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/select-language" replace />} />
        <Route path="/select-language" element={<LanguageSelector />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reject" element={<RejectLot />} />
        <Route path="/resolve" element={<ResolutionCenter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
