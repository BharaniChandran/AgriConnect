import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import ReceiptModal from '../components/ReceiptModal';

export default function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeOrder, activeLot, orders, selectOrder } = useOrders();
  const { t } = useTranslation('common');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // 1. Resolve exact order & lot
  const currentOrder = location.state?.lot?.id 
    ? orders.find(o => o.id === location.state.lot.id) || location.state.lot
    : activeOrder || (orders && orders[0]) || {
      id: 'TX-892301',
      lot_id: 'lot-4829',
      crop: 'Tomato (Roma)',
      quantity: 1250,
      quality: 'Grade A',
      price_per_kg: 28.5,
      total_amount: 35625,
      location: 'Pimpalgaon Baswant APMC, Nashik',
      farmer_name: 'Ram Patil (Sahyadri Agro)',
      buyer_name: 'Ravi Verma (Green Grocers Ltd)',
      status: 'held_in_escrow'
    };

  const lot = currentOrder;
  const totalAmount = parseFloat(lot.total_amount || (lot.quantity * lot.price_per_kg) || 35625);
  const status = lot.status || 'held_in_escrow';

  const isFarmer = user?.role === 'farmer';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
      
      {/* Top Header with Order Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="font-display-md text-3xl md:text-4xl font-bold text-[#154212]">
            {isFarmer ? 'Escrow Payouts & Receipts' : (t('payment_status') || 'Escrow & Payment Status')}
          </h1>
          <p className="font-body-lg text-[#5B755D] mt-1">
            {isFarmer 
              ? 'Real-time MSAMB Escrow trust tracking and direct bank payout records.' 
              : (t('manage_account') || 'Track escrow security, inspection releases, and official invoices.')}
          </p>
        </div>

        {/* Order Selector Dropdown */}
        {orders && orders.length > 1 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#E8E2D9] shadow-sm">
            <span className="text-xs font-bold text-[#5B755D] pl-2 uppercase tracking-wider">Active Lot:</span>
            <select
              value={currentOrder.id}
              onChange={(e) => {
                selectOrder(e.target.value);
                const selected = orders.find(o => o.id === e.target.value);
                if (selected) {
                  navigate('/payment-status', { state: { txId: selected.id, lot: selected }, replace: true });
                }
              }}
              className="bg-[#F7F4F0] text-sm font-bold text-[#154212] py-1.5 px-3 rounded-xl border border-[#E8E2D9] focus:outline-none cursor-pointer"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  #{o.id} • {o.crop} ({o.quantity}kg)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Escrow Banner & Live Process Tracker */}
        <div className="lg:col-span-8 flex flex-col space-y-8">
          
          {/* Main Escrow Hero Card */}
          <section className="bg-gradient-to-r from-[#154212] to-[#0E2C14] rounded-3xl p-8 relative overflow-hidden shadow-lg border border-[#2A6B25] text-white">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  MSAMB Escrow Secured
                </div>
                <h2 className="font-display-sm text-2xl font-bold mb-1">
                  {status === 'released_to_farmer' 
                    ? 'Funds Released & Settled' 
                    : (status === 'disputed' ? 'Disputed Escrow Hold' : (t('held_amount') || 'Escrow Locked Payout'))}
                </h2>
                <p className="font-body-md text-[#E8E2D9] text-sm max-w-lg">
                  {status === 'released_to_farmer'
                    ? 'Payment has been successfully disbursed from MSAMB Trust to the farmer bank account.'
                    : (status === 'disputed' 
                        ? 'Produce inspection issue reported. Funds held securely pending APMC officer resolution.'
                        : (t('held') || 'Payment is safely locked in government-backed escrow pending visual delivery inspection.'))}
                </p>
              </div>

              <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/25 shrink-0 shadow-md">
                <span className="material-symbols-outlined text-white text-[28px]">
                  {status === 'released_to_farmer' ? 'verified' : (status === 'disputed' ? 'gavel' : 'lock')}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 relative z-10 flex flex-wrap justify-between items-end gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#A6E89B] font-bold block mb-1">Current Payout Value</span>
                <span className="font-display-md text-4xl md:text-5xl font-bold tracking-tight">{formatCurrency(totalAmount)}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="bg-white text-[#154212] font-label-md font-bold px-5 py-2.5 rounded-xl shadow hover:bg-[#EFEBE3] transition-all flex items-center gap-2 cursor-pointer text-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  View & Print Receipt
                </button>
              </div>
            </div>
          </section>
          
          {/* Dynamic 3-Step Lifecycle Status Tracker */}
          <section className="bg-white border border-[#E8E2D9] rounded-3xl p-8 shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2A6B25]">timeline</span>
              Live Trade & Escrow Lifecycle
            </h3>

            <div className="flex flex-col md:flex-row justify-between relative mt-4 pt-4">
              <div className="hidden md:block absolute top-10 left-16 right-16 h-1.5 bg-[#E8E2D9] z-0 rounded-full"></div>
              <div 
                className="hidden md:block absolute top-10 left-16 h-1.5 bg-[#2A6B25] z-0 rounded-full transition-all duration-700"
                style={{ 
                  width: status === 'released_to_farmer' ? '100%' : (status === 'under_review' || status === 'disputed' ? '50%' : '25%') 
                }}
              ></div>
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center flex-1 mb-8 md:mb-0 text-center">
                <div className="w-14 h-14 rounded-full bg-[#154212] text-white flex items-center justify-center shadow-md mb-3 border-4 border-white">
                  <span className="material-symbols-outlined text-[24px]">lock</span>
                </div>
                <span className="font-label-lg font-bold text-[#154212]">1. Escrow Locked</span>
                <span className="font-label-sm font-medium text-[#5B755D] mt-1 bg-[#FCFBF9] px-2.5 py-0.5 rounded-md border border-[#E8E2D9] text-xs">
                  Buyer Deposited
                </span>
              </div>
              
              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center flex-1 mb-8 md:mb-0 text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md mb-3 border-4 ${
                  status === 'under_review' || status === 'held_in_escrow'
                    ? 'bg-white border-[#2A6B25] text-[#2A6B25]' 
                    : (status === 'disputed' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-[#154212] border-white text-white')
                }`}>
                  <span className="material-symbols-outlined text-[24px]">
                    {status === 'disputed' ? 'report_problem' : (status === 'released_to_farmer' ? 'done' : 'local_shipping')}
                  </span>
                </div>
                <span className="font-label-lg font-bold text-[#154212]">
                  {status === 'disputed' ? '2. Dispute Filed' : '2. Transit & Inspection'}
                </span>
                <span className="font-label-sm font-bold text-[#2A6B25] mt-1 bg-[#EFEBE3] px-2.5 py-0.5 rounded-md text-xs">
                  {status === 'released_to_farmer' ? 'Inspected & Passed' : (status === 'disputed' ? 'Officer Review' : 'Active Delivery')}
                </span>
              </div>
              
              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center flex-1 text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border-4 ${
                  status === 'released_to_farmer'
                    ? 'bg-[#154212] border-white text-white shadow-md'
                    : 'bg-[#FCFBF9] border-[#E8E2D9] text-[#C6C0B5]'
                }`}>
                  <span className="material-symbols-outlined text-[24px]">check_circle</span>
                </div>
                <span className={`font-label-lg font-bold ${status === 'released_to_farmer' ? 'text-[#154212]' : 'text-[#C6C0B5]'}`}>
                  3. Payout Disbursed
                </span>
                <span className={`font-label-sm font-medium mt-1 px-2.5 py-0.5 rounded-md text-xs border ${
                  status === 'released_to_farmer' ? 'bg-green-50 text-green-800 border-green-200' : 'text-[#C6C0B5] border-[#E8E2D9]'
                }`}>
                  {status === 'released_to_farmer' ? 'Direct Bank Settlement' : 'Pending Buyer Sign-Off'}
                </span>
              </div>
            </div>

            <div className="mt-8 bg-[#FCFBF9] p-5 rounded-2xl border border-[#E8E2D9] flex items-start gap-4">
              <span className="material-symbols-outlined text-[#2A6B25] text-[24px] shrink-0 mt-0.5">verified_user</span>
              <p className="font-body-md text-[#334D35] text-sm leading-relaxed">
                <strong>MSAMB Security Protocol:</strong> Payout of {formatCurrency(totalAmount)} for <strong>{lot.crop}</strong> ({lot.quantity} kg) is safeguarded by the Maharashtra APMC Multi-Party Escrow Smart Protocol. If any dispute arises, an APMC administrator audits the lot before release.
              </p>
            </div>
          </section>
        </div>
        
        {/* Right Column: Transaction Details & Direct Actions */}
        <div className="lg:col-span-4 flex flex-col space-y-8">
          
          {/* Transaction Metadata Card */}
          <section className="bg-white border border-[#E8E2D9] rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5B755D]">receipt</span>
              {t('transaction_details') || 'Deal Specifications'}
            </h3>
            
            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
                <span className="text-xs font-bold text-[#5B755D] uppercase tracking-wider">Order / Lot ID</span>
                <span className="font-label-md font-bold font-mono text-[#154212]">#{lot.id} • #{lot.lot_id?.slice(-6)}</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
                <span className="text-xs font-bold text-[#5B755D] uppercase tracking-wider">{t('crop_type') || 'Crop'}</span>
                <span className="font-label-md font-bold text-[#154212]">{lot.crop}</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
                <span className="text-xs font-bold text-[#5B755D] uppercase tracking-wider">{t('quantity') || 'Net Quantity'}</span>
                <span className="font-label-md font-bold text-[#154212]">{lot.quantity} kg</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
                <span className="text-xs font-bold text-[#5B755D] uppercase tracking-wider">Agreed Rate</span>
                <span className="font-label-md font-bold text-[#154212]">{formatCurrency(lot.price_per_kg || 28.5)} / kg</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
                <span className="text-xs font-bold text-[#5B755D] uppercase tracking-wider">Origin Mandi</span>
                <span className="font-label-md font-bold text-[#154212] truncate max-w-[150px]">{lot.location || 'Nashik APMC'}</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span className="font-display-sm text-lg font-bold text-[#154212]">Total Amount</span>
                <span className="font-display-sm text-2xl font-bold text-[#154212]">{formatCurrency(totalAmount)}</span>
              </li>
            </ul>
          </section>
          
          {/* Quick Action Buttons */}
          <section className="bg-white border border-[#E8E2D9] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="font-display-sm text-xl font-bold text-[#154212] mb-2">Actions</h3>
            
            <button 
              onClick={() => setShowReceiptModal(true)}
              className="w-full bg-[#154212] text-white font-label-lg font-bold py-4 rounded-2xl shadow-md hover:bg-[#0E2C14] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined">download</span>
              {t('download_receipt') || 'Official Receipt & Invoice'}
            </button>

            {status !== 'released_to_farmer' && !isFarmer && (
              <button 
                onClick={() => navigate('/buyer-review', { state: { txId: lot.id, lot } })}
                className="w-full bg-[#EFEBE3] text-[#154212] font-label-lg font-bold py-3.5 rounded-2xl hover:bg-[#E2DDD3] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E8E2D9]"
              >
                <span className="material-symbols-outlined">fact_check</span>
                Inspect / Review Delivery
              </button>
            )}

            <button 
              onClick={() => navigate('/orders')}
              className="w-full bg-white border-2 border-[#154212] text-[#154212] font-label-lg font-bold py-3.5 rounded-2xl hover:bg-[#F7F4F0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              View All Orders & History
            </button>
          </section>

        </div>
      </div>

      {/* Official Receipt Modal */}
      <ReceiptModal 
        isOpen={showReceiptModal} 
        onClose={() => setShowReceiptModal(false)} 
        order={lot} 
        lot={lot}
      />

    </div>
  );
}
