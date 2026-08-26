import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';

export default function ResolutionCenter() {
  const { t } = useTranslation();
  const [resolution, setResolution] = useState('partial_refund');

  const handleResolve = () => {
    alert(`Dispute resolved with: ${t(resolution)}`);
    // Real app calls POST /transactions/{id}/dispute/resolve
  };

  return (
    <div className="page-container dark-theme flex-center">
      <div className="card glass-card fade-in">
        <h1 className="title">Resolution Center</h1>
        <div style={{ marginBottom: '2rem' }}>
          <h3>Buyer's Claim</h3>
          <p>Reason: {t('quality_mismatch')}</p>
          <p>Quantity: 150 kg</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>Select Resolution</label>
          <select value={resolution} onChange={e => setResolution(e.target.value)} style={{ padding: '0.5rem' }}>
            <option value="partial_refund">{t('partial_refund')}</option>
            <option value="full_refund">{t('full_refund')}</option>
            <option value="buyer_accepts">{t('buyer_accepts')}</option>
            <option value="farmer_resale">{t('farmer_resale')}</option>
          </select>
          <button className="primary-btn" onClick={handleResolve}>Apply Resolution</button>
        </div>
      </div>
    </div>
  );
}
