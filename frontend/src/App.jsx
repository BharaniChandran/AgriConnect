import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LanguageSelector from './screens/LanguageSelector'
import BuyerReview from './screens/BuyerReview'
import LotConfirmation from './screens/LotConfirmation'
import DisputeNotification from './screens/DisputeNotification'
import AdminResolution from './screens/AdminResolution'
import Settings from './screens/Settings'
import PaymentStatus from './screens/PaymentStatus'
import RejectionFlow from './screens/RejectionFlow'
import AuthScreen from './screens/AuthScreen'
import FarmerDashboard from './screens/FarmerDashboard'
import BuyerDashboard from './screens/BuyerDashboard'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F7F4F0] text-[#154212]">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <Layout>{children}</Layout>;
};

const DashboardRouter = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'farmer') return <Layout><FarmerDashboard /></Layout>;
  if (user.role === 'buyer') return <Layout><BuyerDashboard /></Layout>;
  if (user.role === 'admin') return <Navigate to="/admin-resolution" replace />;
  return <Navigate to="/login" replace />;
};

const LanguageCheck = ({ children }) => {
  const isLangSet = localStorage.getItem('agriconnect_lang_set');
  if (!isLangSet) return <Navigate to="/language" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LanguageCheck><DashboardRouter /></LanguageCheck>} />
          <Route path="/login" element={<LanguageCheck><AuthScreen initialTab="login" /></LanguageCheck>} />
          <Route path="/register" element={<LanguageCheck><AuthScreen initialTab="register" /></LanguageCheck>} />
          <Route path="/language" element={<LanguageSelector />} />
          <Route path="/settings" element={<LanguageCheck><ProtectedRoute><Settings /></ProtectedRoute></LanguageCheck>} />
          
          <Route path="/buyer-review" element={<LanguageCheck><ProtectedRoute allowedRoles={['buyer']}><BuyerReview /></ProtectedRoute></LanguageCheck>} />
          <Route path="/lot-confirmation" element={<LanguageCheck><ProtectedRoute allowedRoles={['buyer', 'farmer']}><LotConfirmation /></ProtectedRoute></LanguageCheck>} />
          <Route path="/rejection-flow" element={<LanguageCheck><ProtectedRoute allowedRoles={['buyer']}><RejectionFlow /></ProtectedRoute></LanguageCheck>} />
          <Route path="/payment-status" element={<LanguageCheck><ProtectedRoute><PaymentStatus /></ProtectedRoute></LanguageCheck>} />
          
          <Route path="/dispute-notification" element={<LanguageCheck><ProtectedRoute allowedRoles={['admin']}><DisputeNotification /></ProtectedRoute></LanguageCheck>} />
          <Route path="/admin-resolution" element={<LanguageCheck><ProtectedRoute allowedRoles={['admin']}><AdminResolution /></ProtectedRoute></LanguageCheck>} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;
