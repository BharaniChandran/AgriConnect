import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';
import { getCropMedia } from '../utils/cropImages';

export default function LotConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');
  const lot = location.state?.lot || {
    crop: 'Tomato (Roma)',
    quantity: 1500,
    quality: 'Grade A',
    price_per_kg: 28.5,
    location: 'Pimpalgaon APMC, Nashik, Maharashtra'
  };

  const cropMedia = getCropMedia(lot.crop);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-8 rounded-2xl border border-[#E8E2D9] shadow-sm">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#154212] shrink-0 shadow-sm">
          <img src={cropMedia.primary} alt={lot.crop} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-display-md text-4xl font-bold text-[#154212] mb-2">{lot.crop} Lot Confirmed</h1>
          <p className="font-body-lg text-[#5B755D] max-w-2xl leading-relaxed">
            Your {lot.crop} lot ({lot.quantity} kg @ {formatCurrency(lot.price_per_kg)}/kg) has been registered and broadcasted to verified APMC buyers in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-8">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
            <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-8 flex items-center">
              <span className="material-symbols-outlined mr-3 text-[#2A6B25]">agriculture</span>
              Lot Summary
            </h2>
            <div className="grid grid-cols-2 gap-y-8 gap-x-6">
              <div className="bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9]">
                <span className="block font-label-sm font-bold text-[#5B755D] mb-2 uppercase tracking-wider">{t('crop_type') || 'Crop'}</span>
                <span className="block font-body-lg text-[#154212] font-bold">{lot.crop}</span>
              </div>
              <div className="bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9]">
                <span className="block font-label-sm font-bold text-[#5B755D] mb-2 uppercase tracking-wider">{t('quantity') || 'Quantity'}</span>
                <span className="block font-body-lg text-[#154212] font-bold">{lot.quantity} kg</span>
              </div>
              <div className="bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9]">
                <span className="block font-label-sm font-bold text-[#5B755D] mb-2 uppercase tracking-wider">{t('grade') || 'Grade'}</span>
                <span className="block font-body-lg text-[#154212] font-bold bg-[#EFEBE3] inline-block px-3 py-1 rounded-md">{lot.quality || 'Grade A'}</span>
              </div>
              <div className="bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9]">
                <span className="block font-label-sm font-bold text-[#5B755D] mb-2 uppercase tracking-wider">{t('base_rate') || 'Base Price'}</span>
                <span className="block font-body-lg text-[#154212] font-bold text-2xl">{formatCurrency(lot.price_per_kg || 28.5)} <span className="text-lg font-medium text-[#5B755D]">/ kg</span></span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm relative overflow-hidden group">
            <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center relative z-10">
              <span className="material-symbols-outlined mr-3 text-[#2A6B25]">storefront</span>
              Designated Hub
            </h2>
            <div className="flex items-start space-x-5 relative z-10">
              <div className="w-16 h-16 rounded-xl bg-[#EFEBE3] border-2 border-[#154212] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#154212] text-[32px]">map</span>
              </div>
              <div>
                <h3 className="font-display-sm text-xl font-bold text-[#154212] mb-1">{lot.location || 'Pimpalgaon APMC'}</h3>
                <p className="font-body-md text-[#5B755D] mb-4">Nashik District APMC Market Yard, Gate 1.</p>
                <button className="inline-flex items-center font-label-lg font-bold text-[#154212] hover:text-[#2A6B25] transition-colors bg-[#F7F4F0] px-4 py-2 rounded-lg">
                  <span className="material-symbols-outlined mr-2 text-[20px]">directions</span>
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-8">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
            <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-8">What Happens Next?</h2>
            <div className="relative">
              <div className="absolute left-[19px] top-4 bottom-8 w-1 bg-[#E8E2D9] rounded-full"></div>
              
              <div className="flex mb-10 relative group">
                <div className="w-10 h-10 rounded-full bg-[#154212] flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-white">
                  <span className="material-symbols-outlined text-white text-[20px]">done</span>
                </div>
                <div className="ml-5">
                  <h3 className="font-label-lg font-bold text-[#154212] text-xl">Lot Confirmed</h3>
                  <p className="font-body-sm font-medium text-[#5B755D] mt-1.5 leading-relaxed">Your details have been saved securely.</p>
                </div>
              </div>
              
              <div className="flex mb-10 relative group">
                <div className="w-10 h-10 rounded-full bg-white border-[3px] border-[#154212] flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-white">
                  <span className="material-symbols-outlined text-[#154212] text-[20px]">local_shipping</span>
                </div>
                <div className="ml-5">
                  <h3 className="font-label-lg font-bold text-[#154212] text-xl">Arrange Transport</h3>
                  <p className="font-body-sm font-medium text-[#5B755D] mt-1.5 leading-relaxed">Book a vehicle to move your produce to the mandi.</p>
                </div>
              </div>
              
              <div className="flex relative group">
                <div className="w-10 h-10 rounded-full bg-white border-[3px] border-[#E8E2D9] flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-white">
                  <span className="material-symbols-outlined text-[#C6C0B5] text-[20px]">receipt_long</span>
                </div>
                <div className="ml-5">
                  <h3 className="font-label-lg font-bold text-[#C6C0B5] text-xl">Quality Check & Payment</h3>
                  <p className="font-body-sm font-medium text-[#C6C0B5] mt-1.5 leading-relaxed">Produce is assessed at the hub before final payment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={() => navigate('/payment-status')} className="w-full py-4 bg-[#154212] text-white font-label-lg font-bold rounded-xl shadow-md flex items-center justify-center hover:bg-[#0E2C14] active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined mr-2">local_shipping</span>
              Book Transport Now
            </button>
            <button onClick={() => navigate('/')} className="w-full py-4 bg-white text-[#154212] border-2 border-[#154212] font-label-lg font-bold rounded-xl flex items-center justify-center hover:bg-[#F7F4F0] active:scale-[0.98] transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
