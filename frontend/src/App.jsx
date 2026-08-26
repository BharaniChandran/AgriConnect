import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BuyerReview from './screens/BuyerReview';
import LotConfirmation from './screens/LotConfirmation';
import DisputeNotification from './screens/DisputeNotification';
import AdminResolution from './screens/AdminResolution';
import Settings from './screens/Settings';
import PaymentStatus from './screens/PaymentStatus';
import RejectionFlow from './screens/RejectionFlow';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/buyer-review" />} />
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
