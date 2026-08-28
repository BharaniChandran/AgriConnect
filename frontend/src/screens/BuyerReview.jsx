import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';
import { API_BASE_URL } from '../apiConfig';
import { getCropMedia } from '../utils/cropImages';
import { supabase } from '../supabaseClient';
import { rtdb } from '../firebaseClient';
import { ref as dbRef, set as dbSet } from 'firebase/database';

export default function BuyerReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { t } = useTranslation('common');
  const [accepting, setAccepting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const txId = location.state?.txId || 1;
  
  let resolvedLot = location.state?.lot;
  if (!resolvedLot) {
    try {
      const latestDeal = localStorage.getItem('agriconnect_latest_deal');
      if (latestDeal) {
        const parsed = JSON.parse(latestDeal);
        if (parsed?.lot) resolvedLot = parsed.lot;
      }
      if (!resolvedLot) {
        const storedTxs = localStorage.getItem('agriconnect_buyer_transactions');
        if (storedTxs) {
          const parsedTxs = JSON.parse(storedTxs);
          if (parsedTxs.length > 0 && parsedTxs[0].lot) {
            resolvedLot = parsedTxs[0].lot;
          }
        }
      }
    } catch {}
  }

  const lot = resolvedLot || {
    lot_id: 'lot-4829',
    crop: 'Red Onion (Lasalgaon)',
    quantity: 1250,
    quality: 'Grade A',
    price_per_kg: 28.5,
    location: 'Lasalgaon APMC, Nashik',
    farmer_name: 'Ram Patil (Sahyadri Agro Farms)'
  };

  const cropMedia = getCropMedia(lot.crop);

  const handleAcceptLot = async () => {
    setAccepting(true);
    setFeedback(null);

    // 1. Broadcast acceptance in real time to farmer dashboard
    try {
      const channel = supabase.channel('agriconnect_marketplace');
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'lot_accepted',
            payload: {
              lotId: lot.lot_id,
              crop: lot.crop,
              quantity: lot.quantity,
              buyerName: user?.name || 'Ravi (Buyer)',
              payout: (lot.quantity * lot.price_per_kg).toFixed(2)
            }
          });
        }
      });
    } catch (e) {
      console.warn('Realtime acceptance broadcast note:', e);
    }

    // 2. Update status in Firebase Realtime Database
    try {
      dbSet(dbRef(rtdb, `crops_lots/${lot.lot_id}/status`), 'delivered_and_paid').catch(() => {});
      dbSet(dbRef(rtdb, `transactions/${txId}/status`), 'released_to_farmer').catch(() => {});
    } catch (e) {}

    // 3. Update status in Supabase
    try {
      await supabase.from('crops_lots').update({ status: 'sold' }).eq('lot_id', lot.lot_id);
    } catch (e) {}

    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${txId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Delivery accepted! Escrow payment released to farmer in real-time.' });
        setTimeout(() => {
          navigate('/payment-status', { state: { txId, lot } });
        }, 1200);
      } else {
        navigate('/payment-status', { state: { txId, lot } });
      }
    } catch (e) {
      console.warn('Accept lot error:', e);
      navigate('/payment-status', { state: { txId, lot } });
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {feedback && (
        <div className="p-4 rounded-xl flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 font-medium">
          <span className="material-symbols-outlined text-green-700">check_circle</span>
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-[#5B755D] mb-4 cursor-pointer hover:text-[#154212] transition-colors w-fit" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-lg font-bold">{t('back_to_lots') || 'Back to Marketplace'}</span>
          </div>
          <h2 className="font-display-md text-4xl font-bold text-[#154212]">
            {t('buyer_review_title') || 'Review Delivery'}: {lot.crop}
          </h2>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/rejection-flow', { state: { txId, lot } })} 
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl border-2 border-[#BA1A1A] text-[#BA1A1A] font-label-lg font-bold hover:bg-[#FFDAD6] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">report_problem</span>
            {t('reject') || 'Report Issue / Dispute'}
          </button>
          <button 
            disabled={accepting}
            onClick={handleAcceptLot} 
            className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-[#154212] text-white font-label-lg font-bold hover:bg-[#0E2C14] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">{accepting ? 'sync' : 'check_circle'}</span>
            {accepting ? 'Releasing Funds...' : (t('accept_lot') || 'Accept & Release Escrow')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4 bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-sm">
            <div className="col-span-2 h-72 rounded-xl overflow-hidden bg-[#FCFBF9] relative border border-[#E8E2D9]">
              <img alt={`${lot.crop} Arrival Photo`} className="w-full h-full object-cover" src={cropMedia.primary} />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E8E2D9] flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[#154212] text-sm">photo_camera</span>
                <span className="font-label-md font-bold text-[#154212]">Arrival Photo: {lot.crop}</span>
              </div>
            </div>
            <div className="col-span-1 flex flex-col gap-4">
              <div className="h-full flex-1 rounded-xl overflow-hidden bg-[#FCFBF9] border border-[#E8E2D9]">
                <img alt={`${lot.crop} Detail 1`} className="w-full h-full object-cover" src={cropMedia.detail1} />
              </div>
              <div className="h-full flex-1 rounded-xl overflow-hidden bg-[#FCFBF9] border border-[#E8E2D9]">
                <img alt={`${lot.crop} Detail 2`} className="w-full h-full object-cover" src={cropMedia.detail2} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E8E2D9] shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5B755D]">verified</span>
              {t('quality_specs') || 'Quality Specifications'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('variety') || 'Variety'}</span>
                <span className="font-body-lg font-medium text-[#154212]">{cropMedia.variety || 'Standard APMC'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('grade') || 'Grade'}</span>
                <span className="font-body-lg text-[#154212] font-bold">{lot.quality || 'Grade A'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('total_weight') || 'Total Weight'}</span>
                <span className="font-body-lg font-medium text-[#154212]">{lot.quantity ? `${lot.quantity} kg` : '1,250 kg'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('bags_crates') || 'Bags/Crates'}</span>
                <span className="font-body-lg font-medium text-[#154212]">{Math.max(1, Math.round((lot.quantity || 1250) / 25))} Crates/Bags</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#E8E2D9]">
              <h4 className="font-label-md font-bold text-[#154212] mb-3">{t('inspection_notes') || 'Inspection Notes'}</h4>
              <p className="font-body-md text-[#334D35] bg-[#FCFBF9] p-4 rounded-xl border border-[#E8E2D9] leading-relaxed">
                {cropMedia.specs || 'Visual inspection confirms uniform quality, moisture and grade tolerance within MSAMB APMC standards.'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#EFEBE3] border-2 border-[#154212] overflow-hidden flex items-center justify-center font-bold text-xl text-[#154212]">
                  {lot.farmer_name ? lot.farmer_name[0] : 'F'}
                </div>
                <div>
                  <h3 className="font-display-sm text-xl font-bold text-[#154212]">{lot.farmer_name || 'Ram Patil (Farmer)'}</h3>
                  <p className="font-body-sm font-medium text-[#5B755D] flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {lot.location || 'Nashik, Maharashtra'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1.5 bg-[#EFEBE3] rounded-md text-label-sm font-bold text-[#154212] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#2A6B25]">star</span> 4.9 Rating
              </span>
              <span className="px-3 py-1.5 bg-[#EFEBE3] rounded-md text-label-sm font-bold text-[#154212]">
                Verified Farmer
              </span>
            </div>
            <button className="w-full py-3.5 rounded-xl border-2 border-[#154212] text-[#154212] font-label-lg font-bold hover:bg-[#F7F4F0] transition-colors flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              {t('contact_farmer') || 'Contact Farmer'}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-sm flex-1">
            <h3 className="font-display-sm text-xl font-bold text-[#154212] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5B755D]">local_shipping</span>
              {t('logistics') || 'Logistics'}
            </h3>
            <div className="relative pl-6 border-l-2 border-[#E8E2D9] flex flex-col gap-6 ml-2">
              <div className="relative">
                <div className="absolute w-3 h-3 bg-[#154212] rounded-full -left-[1.75rem] top-1"></div>
                <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('dispatched') || 'Dispatched'}</p>
                <p className="font-body-sm font-medium text-[#154212] mt-1">Oct 24, 06:00 AM</p>
              </div>
              <div className="relative">
                <div className="absolute w-3 h-3 bg-[#2A6B25] rounded-full -left-[1.75rem] top-1"></div>
                <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('arrived_depot') || 'Arrived at Depot'}</p>
                <p className="font-body-sm font-bold text-[#154212] mt-1">Oct 24, 11:30 AM</p>
              </div>
              <div className="relative opacity-60">
                <div className="absolute w-3 h-3 bg-[#E8E2D9] rounded-full -left-[1.75rem] top-1 border-2 border-white"></div>
                <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('payment_cleared') || 'Payment Cleared'}</p>
                <p className="font-body-sm font-medium text-[#334D35] mt-1">Pending Acceptance</p>
              </div>
            </div>
            <div className="mt-8 bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9]">
              <div className="flex justify-between items-center mb-3">
                <span className="font-label-md font-bold text-[#154212]">Market Price Match</span>
                <span className="font-label-md font-bold text-[#2A6B25] flex items-center gap-1 bg-[#EFEBE3] px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span> +2%
                </span>
              </div>
              <div className="w-full bg-[#E8E2D9] rounded-full h-2">
                <div className="bg-[#154212] h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
