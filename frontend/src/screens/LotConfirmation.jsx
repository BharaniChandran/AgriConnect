import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';
import { getCropMedia } from '../utils/cropImages';
import { supabase } from '../supabaseClient';
import { rtdb } from '../firebaseClient';
import { ref as dbRef, onValue } from 'firebase/database';

export default function LotConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');

  const initialLot = location.state?.lot || {
    lot_id: 'lot-4829',
    crop: 'Tomato (Roma)',
    quantity: 1500,
    quality: 'Grade A',
    price_per_kg: 28.5,
    location: 'Pimpalgaon Baswant APMC, Nashik, Maharashtra',
    status: 'awaiting_confirmation',
    confirmed_by_buyer: false
  };

  const [lot, setLot] = useState(initialLot);
  const [isConfirmed, setIsConfirmed] = useState(
    Boolean(initialLot.confirmed_by_buyer || initialLot.status === 'confirmed' || initialLot.status === 'sold')
  );
  const [buyerInfo, setBuyerInfo] = useState({
    buyerName: initialLot.buyer_name || initialLot.target_buyer?.name || 'Verified APMC Buyer',
    payout: (parseFloat(initialLot.quantity || 1000) * parseFloat(initialLot.price_per_kg || 28.5)).toFixed(2)
  });

  const cropMedia = getCropMedia(lot.crop);

  useEffect(() => {
    // 1. Subscribe to Supabase real-time broadcast channel
    const channel = supabase
      .channel('agriconnect_marketplace')
      .on('broadcast', { event: 'lot_purchased' }, (payload) => {
        const data = payload.payload;
        if (data) {
          if (!lot.lot_id || data.lot?.lot_id === lot.lot_id || data.lot?.crop === lot.crop) {
            setIsConfirmed(true);
            setBuyerInfo({
              buyerName: data.buyerName || 'Ravi (Buyer)',
              payout: data.transaction?.amount || (lot.quantity * lot.price_per_kg).toFixed(2)
            });
            setLot(prev => ({ ...prev, status: 'confirmed', confirmed_by_buyer: true }));
          }
        }
      })
      .on('broadcast', { event: 'lot_accepted' }, (payload) => {
        const data = payload.payload;
        if (data) {
          if (!lot.lot_id || data.lotId === lot.lot_id || data.crop === lot.crop) {
            setIsConfirmed(true);
            setBuyerInfo({
              buyerName: data.buyerName || 'Ravi (Buyer)',
              payout: data.payout || (lot.quantity * lot.price_per_kg).toFixed(2)
            });
            setLot(prev => ({ ...prev, status: 'confirmed', confirmed_by_buyer: true }));
          }
        }
      })
      .subscribe();

    // 2. Subscribe to Firebase Realtime Database
    let unsubscribeRtdb = null;
    if (lot.lot_id) {
      try {
        const lotRef = dbRef(rtdb, `crops_lots/${lot.lot_id}`);
        unsubscribeRtdb = onValue(lotRef, (snapshot) => {
          const val = snapshot.val();
          if (val && (val.status === 'sold' || val.status === 'confirmed' || val.status === 'held_in_escrow')) {
            setIsConfirmed(true);
            setLot(prev => ({ ...prev, status: 'confirmed', confirmed_by_buyer: true }));
          }
        });
      } catch (e) {
        console.warn('RTDB listen error:', e);
      }
    }

    return () => {
      supabase.removeChannel(channel);
      if (typeof unsubscribeRtdb === 'function') unsubscribeRtdb();
    };
  }, [lot.lot_id, lot.crop]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      {/* Top Status Header */}
      {!isConfirmed ? (
        <div className="text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-6 bg-gradient-to-r from-[#FCFBF9] to-[#F7F4F0] p-8 rounded-3xl border-2 border-amber-300 shadow-sm relative overflow-hidden">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-amber-100 border-2 border-amber-400 shrink-0">
            <span className="material-symbols-outlined text-[44px] text-amber-700 animate-spin">
              hourglass_top
            </span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-200/60 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
              Live on APMC Mandi Network — Awaiting Buyer Confirmation
            </div>
            <h1 className="font-display-md text-3xl md:text-4xl font-bold text-[#154212] mb-2">
              Waiting for Buyer Confirmation...
            </h1>
            <p className="font-body-lg text-[#5B755D] leading-relaxed">
              Your <strong>{lot.crop}</strong> lot ({lot.quantity} kg @ {formatCurrency(lot.price_per_kg)}/kg) is published live to verified Maharashtra APMC buyers. As soon as a buyer confirms and secures Escrow, this screen will update automatically in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-8 rounded-3xl border-2 border-green-500 shadow-md relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#154212] shrink-0 shadow-md">
            <img src={cropMedia.primary} alt={lot.crop} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-100 border border-green-300 text-green-900 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[16px] text-green-700">verified</span>
              Buyer Deal Confirmed & Escrow Locked
            </div>
            <h1 className="font-display-md text-3xl md:text-4xl font-bold text-[#154212] mb-2">
              🎉 {lot.crop} Lot Confirmed!
            </h1>
            <p className="font-body-lg text-[#5B755D] leading-relaxed">
              Buyer <strong>{buyerInfo.buyerName}</strong> has confirmed the lot and locked <strong>{formatCurrency(buyerInfo.payout)}</strong> in the MSAMB Escrow trust account. You may now arrange vehicle dispatch.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-8">
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 shadow-sm">
            <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-[#2A6B25]">agriculture</span>
              {t('lot_summary') || 'Produce Specifications'}
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-6">
              <div className="bg-[#FCFBF9] p-5 rounded-2xl border border-[#E8E2D9]">
                <span className="block font-label-sm font-bold text-[#5B755D] mb-1 uppercase tracking-wider">{t('crop_type') || 'Crop'}</span>
                <span className="block font-body-lg text-[#154212] font-bold text-xl">{lot.crop}</span>
              </div>
              <div className="bg-[#FCFBF9] p-5 rounded-2xl border border-[#E8E2D9]">
                <span className="block font-label-sm font-bold text-[#5B755D] mb-1 uppercase tracking-wider">{t('quantity') || 'Quantity'}</span>
                <span className="block font-body-lg text-[#154212] font-bold text-xl">{lot.quantity} kg</span>
              </div>
              <div className="bg-[#FCFBF9] p-5 rounded-2xl border border-[#E8E2D9]">
                <span className="block font-label-sm font-bold text-[#5B755D] mb-1 uppercase tracking-wider">{t('grade') || 'Grade'}</span>
                <span className="block font-body-lg text-[#154212] font-bold bg-[#EFEBE3] inline-block px-3 py-1 rounded-md">{lot.quality || 'Grade A'}</span>
              </div>
              <div className="bg-[#FCFBF9] p-5 rounded-2xl border border-[#E8E2D9]">
                <span className="block font-label-sm font-bold text-[#5B755D] mb-1 uppercase tracking-wider">{t('base_rate') || 'Base Price'}</span>
                <span className="block font-body-lg text-[#154212] font-bold text-2xl">{formatCurrency(lot.price_per_kg || 28.5)} <span className="text-sm font-medium text-[#5B755D]">/ kg</span></span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 shadow-sm relative overflow-hidden group">
            <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center">
              <span className="material-symbols-outlined mr-3 text-[#2A6B25]">storefront</span>
              Designated Maharashtra APMC Hub
            </h2>
            <div className="flex items-start space-x-5">
              <div className="w-16 h-16 rounded-2xl bg-[#EFEBE3] border-2 border-[#154212] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#154212] text-[32px]">map</span>
              </div>
              <div>
                <h3 className="font-display-sm text-xl font-bold text-[#154212] mb-1">{lot.location || 'Pimpalgaon Baswant APMC, Nashik'}</h3>
                <p className="font-body-md text-[#5B755D] mb-3">Maharashtra Mandi Yard, Direct Farmer Ingestion Gate.</p>
                <div className="inline-flex items-center gap-1 text-sm font-bold text-[#154212] bg-[#F7F4F0] px-3.5 py-1.5 rounded-lg border border-[#E8E2D9]">
                  <span className="material-symbols-outlined text-sm">near_me</span>
                  Within Optimized Driving Radius
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action & Steps Column */}
        <div className="md:col-span-5 space-y-8">
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 shadow-sm">
            <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6">
              {isConfirmed ? 'Next Steps for Farmer' : 'Confirmation Timeline'}
            </h2>
            <div className="relative">
              <div className="absolute left-[19px] top-4 bottom-8 w-1 bg-[#E8E2D9] rounded-full"></div>
              
              {/* Step 1 */}
              <div className="flex mb-8 relative group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-white ${
                  isConfirmed ? 'bg-[#154212] text-white' : 'bg-amber-500 text-white'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {isConfirmed ? 'done' : 'hourglass_top'}
                  </span>
                </div>
                <div className="ml-5">
                  <h3 className="font-label-lg font-bold text-[#154212] text-lg">
                    {isConfirmed ? 'Buyer Confirmed & Escrow Locked' : 'Waiting for Buyer Confirmation'}
                  </h3>
                  <p className="font-body-sm font-medium text-[#5B755D] mt-1 leading-relaxed">
                    {isConfirmed 
                      ? `${buyerInfo.buyerName} deposited ${formatCurrency(buyerInfo.payout)} into Escrow.`
                      : 'Live broadcast active. Waiting for buyer to click Buy.'}
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex mb-8 relative group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-white border-[3px] ${
                  isConfirmed ? 'bg-white border-[#154212] text-[#154212]' : 'bg-white border-[#E8E2D9] text-[#C6C0B5]'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                </div>
                <div className="ml-5">
                  <h3 className={`font-label-lg font-bold text-lg ${isConfirmed ? 'text-[#154212]' : 'text-[#C6C0B5]'}`}>
                    Arrange Transport & Dispatch
                  </h3>
                  <p className={`font-body-sm font-medium mt-1 leading-relaxed ${isConfirmed ? 'text-[#5B755D]' : 'text-[#C6C0B5]'}`}>
                    Book agro-logistics truck to transfer produce to the designated mandi.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex relative group">
                <div className="w-10 h-10 rounded-full bg-white border-[3px] border-[#E8E2D9] flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-white text-[#C6C0B5]">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
                <div className="ml-5">
                  <h3 className="font-label-lg font-bold text-[#C6C0B5] text-lg">
                    Delivery Inspection & Payout
                  </h3>
                  <p className="font-body-sm font-medium text-[#C6C0B5] mt-1 leading-relaxed">
                    Buyer accepts delivery, triggering immediate release of escrow funds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isConfirmed ? (
              <button 
                onClick={() => navigate('/payment-status', { state: { lot } })} 
                className="w-full py-4 bg-[#154212] text-white font-label-lg font-bold rounded-2xl shadow-lg flex items-center justify-center hover:bg-[#0E2C14] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined mr-2">local_shipping</span>
                Book Transport & View Escrow ({formatCurrency(buyerInfo.payout)})
              </button>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Listening for Buyer Confirmation in Real-Time
                </p>
                <p className="text-xs text-amber-700">You do not need to refresh. Screen updates automatically.</p>
              </div>
            )}
            <button 
              onClick={() => navigate('/')} 
              className="w-full py-4 bg-white text-[#154212] border-2 border-[#154212] font-label-lg font-bold rounded-2xl flex items-center justify-center hover:bg-[#F7F4F0] active:scale-[0.98] transition-all cursor-pointer"
            >
              Return to Farmer Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
