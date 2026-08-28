import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';

export default function PaymentStatus() {
  const location = useLocation();
  const { t } = useTranslation('common');

  // Read dynamic lot passed via navigation state or localStorage
  let passedLot = location.state?.lot;
  if (!passedLot) {
    try {
      const stored = localStorage.getItem('agriconnect_farmer_lots');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) passedLot = parsed[0];
      }
    } catch {}
  }

  const lot = passedLot || {
    lot_id: 'LOT-8923-A',
    crop: 'Green Chilli',
    quantity: 1250,
    price_per_kg: 28.5
  };

  const totalAmount = parseFloat(lot.quantity || 1000) * parseFloat(lot.price_per_kg || 28.5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full">
      <div className="mb-8">
        <h1 className="font-display-md text-4xl font-bold text-[#154212]">{t('payment_status') || 'Payment Status'}</h1>
        <p className="font-body-lg text-[#5B755D] mt-2">{t('manage_account') || 'Track the status of your recent lot delivery payment.'}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col space-y-8">
          <section className="bg-[#154212] rounded-2xl p-8 relative overflow-hidden shadow-md">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h2 className="font-display-sm text-2xl font-bold text-white mb-1">{t('held_amount') || 'Held Amount'}</h2>
                <p className="font-body-md text-[#E8E2D9]">{t('held') || 'Payment is currently held in escrow pending quality verification.'}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <span className="material-symbols-outlined text-white">lock</span>
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <span className="font-display-md text-5xl font-bold text-white tracking-tight">{formatCurrency(totalAmount)}</span>
            </div>
          </section>
          
          <section className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-8">{t('payment_status') || 'Process Status'}</h3>
            <div className="flex flex-col md:flex-row justify-between relative mt-8 pt-4">
              <div className="hidden md:block absolute top-10 left-16 right-16 h-1.5 bg-[#E8E2D9] z-0 rounded-full"></div>
              <div className="hidden md:block absolute top-10 left-16 w-1/2 h-1.5 bg-[#2A6B25] z-0 rounded-full"></div>
              
              <div className="relative z-10 flex flex-col items-center flex-1 mb-8 md:mb-0">
                <div className="w-14 h-14 rounded-full bg-[#154212] text-white flex items-center justify-center shadow-md mb-4 border-4 border-white">
                  <span className="material-symbols-outlined text-[24px]">done</span>
                </div>
                <span className="font-label-lg font-bold text-[#154212] text-center text-lg">{t('held') || 'Held'}</span>
                <span className="font-label-sm font-medium text-[#5B755D] mt-2 text-center bg-[#FCFBF9] px-2 py-1 rounded-md border border-[#E8E2D9]">Today</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center flex-1 mb-8 md:mb-0">
                <div className="w-14 h-14 rounded-full bg-white text-[#2A6B25] flex items-center justify-center shadow-md mb-4 border-4 border-[#2A6B25]">
                  <span className="material-symbols-outlined animate-spin-slow text-[24px]">sync</span>
                </div>
                <span className="font-label-lg font-bold text-[#154212] text-center text-lg">{t('under_review') || 'Under Review'}</span>
                <span className="font-label-sm font-bold text-[#2A6B25] mt-2 text-center bg-[#EFEBE3] px-2 py-1 rounded-md">In Progress</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center flex-1">
                <div className="w-14 h-14 rounded-full bg-[#FCFBF9] text-[#C6C0B5] flex items-center justify-center mb-4 border-4 border-[#E8E2D9]">
                  <span className="material-symbols-outlined text-[24px]">check_circle</span>
                </div>
                <span className="font-label-lg font-bold text-[#C6C0B5] text-center text-lg">{t('released') || 'Released'}</span>
                <span className="font-label-sm font-medium text-[#C6C0B5] mt-2 text-center border border-[#E8E2D9] px-2 py-1 rounded-md">Pending Acceptance</span>
              </div>
            </div>
            <div className="mt-10 bg-[#FCFBF9] p-6 rounded-xl border border-[#E8E2D9]">
              <div className="flex items-start space-x-4">
                <span className="material-symbols-outlined text-[#2A6B25] mt-1 text-[24px]">info</span>
                <div>
                  <p className="font-body-md text-[#334D35] leading-relaxed">
                    Your payment of {formatCurrency(totalAmount)} for {lot.crop} ({lot.quantity} kg) is securely locked in Maharashtra APMC Escrow. Once delivery is accepted, funds are released directly to the farmer bank account.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <div className="lg:col-span-4 flex flex-col space-y-8">
          <section className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-6">{t('transaction_details') || 'Transaction Details'}</h3>
            <ul className="space-y-5">
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-4">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">Lot ID</span>
                <span className="font-label-lg font-bold text-[#154212]">#{lot.lot_id?.slice(-8) || 'LOT-8923'}</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-4">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('crop_type') || 'Crop Type'}</span>
                <span className="font-label-lg font-bold text-[#154212]">{lot.crop}</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-4">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('quantity') || 'Quantity'}</span>
                <span className="font-label-lg font-bold text-[#154212]">{lot.quantity} kg</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-4">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('base_rate') || 'Base Rate'}</span>
                <span className="font-label-lg font-bold text-[#154212]">{formatCurrency(lot.price_per_kg || 28.5)} / kg</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span className="font-display-sm text-xl font-bold text-[#154212]">{t('expected_total') || 'Expected Total'}</span>
                <span className="font-display-sm text-2xl font-bold text-[#154212]">{formatCurrency(totalAmount)}</span>
              </li>
            </ul>
          </section>
          
          <section className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-6">Actions</h3>
            <div className="flex flex-col space-y-4">
              <button className="w-full bg-[#154212] text-white font-label-lg font-bold py-4 rounded-xl shadow-md hover:bg-[#0E2C14] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined">download</span>
                {t('download_receipt') || 'Download Receipt'}
              </button>
              <button className="w-full bg-white border-2 border-[#154212] text-[#154212] font-label-lg font-bold py-4 rounded-xl hover:bg-[#F7F4F0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined">support_agent</span>
                {t('contact_support') || 'Contact Support'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
