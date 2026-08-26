import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LanguageSelector from './screens/LanguageSelector';
import BuyerReview from './screens/BuyerReview';
import LotConfirmation from './screens/LotConfirmation';
import DisputeNotification from './screens/DisputeNotification';
import AdminResolution from './screens/AdminResolution';
import Settings from './screens/Settings';
import PaymentStatus from './screens/PaymentStatus';
import RejectionFlow from './screens/RejectionFlow';

function App() {
  const isLangSet = localStorage.getItem('agriconnect_lang_set');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLangSet ? <Navigate to="/buyer-review" /> : <LanguageSelector />} />
        <Route path="/language" element={<LanguageSelector />} />
        <Route path="/buyer-review" element={<BuyerReview />} />
        <Route path="/lot-confirmation" element={<LotConfirmation />} />
        <Route path="/dispute-notification" element={<DisputeNotification />} />
        <Route path="/admin-resolution" element={<AdminResolution />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/rejection-flow" element={<RejectionFlow />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
