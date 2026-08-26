import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';

export default function RejectLot() {
  const { t } = useTranslation();
  const [reason, setReason] = useState('quality_mismatch');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [photos, setPhotos] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((reason === 'quality_mismatch' || reason === 'spoilage') && photos.length === 0) {
      alert('Please upload evidence photos for quality issues.');
      return;
    }
    alert('Dispute submitted successfully');
    // In real app, call API to POST /transactions/{id}/reject
  };

  return (
    <div className="page-container dark-theme flex-center">
      <div className="card glass-card fade-in">
        <h1 className="title">{t('reject_lot')}</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>{t('reason')}</label>
            <select value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}>
              <option value="quality_mismatch">{t('quality_mismatch')}</option>
              <option value="quantity_mismatch">{t('quantity_mismatch')}</option>
              <option value="spoilage">{t('spoilage')}</option>
              <option value="wrong_item">{t('wrong_item')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>
          
          <div>
            <label>{t('description')}</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              placeholder={t('description')}
            />
          </div>

          <div>
            <label>{t('rejected_quantity')}</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>

          <div>
            <label>{t('upload_evidence')}</label>
            <input 
              type="file" 
              multiple 
              onChange={e => setPhotos(Array.from(e.target.files))}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>

          <button type="submit" className="primary-btn">{t('submit')}</button>
        </form>
      </div>
    </div>
  );
}
