import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { formatCurrency } from '../utils/formatters';
import { API_BASE_URL } from '../apiConfig';
import { getCropMedia } from '../utils/cropImages';

export default function AdminResolution() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { activeOrder, activeLot, resolveDispute, orders } = useOrders();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Dynamic order resolution
  const resolvedOrder = activeOrder || (orders && orders[0]) || {
    id: 'TX-892301',
    lot_id: 'lot-4829',
    crop: 'Tomato (Roma)',
    quantity: 1250,
    price_per_kg: 28.5,
    total_amount: 35625,
    farmer_name: 'Ram Patil (Sahyadri Agro)',
    buyer_name: 'Ravi Verma (Green Grocers Ltd)',
    location: 'Pimpalgaon Baswant APMC, Nashik',
    dispute: null
  };

  const txId = resolvedOrder.id;
  const cropMedia = getCropMedia(resolvedOrder.crop);
  const totalAmount = parseFloat(resolvedOrder.total_amount || (resolvedOrder.quantity * resolvedOrder.price_per_kg));
  
  const disputeData = resolvedOrder.dispute || {
    reason: 'Transit Damage & Quality Blemish',
    description: `Upon inspection at arrival, approximately 15% of the ${resolvedOrder.crop} showed signs of transit bruising and moisture mismatch. Requesting partial settlement.`,
    rejected_quantity_kg: Math.round(resolvedOrder.quantity * 0.15),
    photo_urls: [cropMedia.detail1 || cropMedia.primary, cropMedia.detail2 || cropMedia.primary]
  };

  const partialRefundAmount = parseFloat((disputeData.rejected_quantity_kg * resolvedOrder.price_per_kg).toFixed(2)) || parseFloat((totalAmount * 0.15).toFixed(2));
  const farmerReleaseAmount = parseFloat((totalAmount - partialRefundAmount).toFixed(2));

  const [notes, setNotes] = useState(`Evidence confirms transit damage of ~${disputeData.rejected_quantity_kg}kg (${resolvedOrder.crop}). Settlement awarded.`);

  const handleResolve = async (resolutionType) => {
    setLoading(true);
    setFeedback(null);

    // 1. Update in OrderContext
    resolveDispute(txId, resolutionType, notes);

    // 2. Call backend API if available
    try {
      await fetch(`${API_BASE_URL}/transactions/${txId}/dispute/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resolution: resolutionType, notes: notes })
      });
    } catch (e) {}

    setLoading(false);
    setFeedback({
      type: 'success',
      message: `Dispute resolved (${resolutionType.replace(/_/g, ' ')}). Escrow records updated accordingly.`
    });

    setTimeout(() => {
      navigate('/payment-status', { state: { txId, lot: resolvedOrder } });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-140px)]">
      {feedback && (
        <div className="p-4 rounded-xl flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 font-medium">
          <span className="material-symbols-outlined text-green-700">verified</span>
          <span>{feedback.message}</span>
        </div>
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4 flex-shrink-0">
        <div>
          <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span> Claim #{resolvedOrder.id} • Lot #{resolvedOrder.lot_id?.slice(-8)}
          </p>
          <h1 className="font-display-md text-4xl font-bold text-[#154212]">Dispute Resolution Center</h1>
        </div>
        <div className="flex gap-3">
          <span className="bg-[#EFEBE3] text-[#154212] border border-[#E8E2D9] px-4 py-2 rounded-xl font-label-md font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span> Live Session
          </span>
          <span className="bg-[#FFDAD6] text-[#93000A] border border-[#BA1A1A] px-4 py-2 rounded-xl font-label-md font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span> Active APMC Dispute
          </span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
        
        {/* Buyer's Claim */}
        <div className="lg:col-span-4 bg-white border border-[#E8E2D9] rounded-2xl flex flex-col shadow-sm overflow-hidden">
          <div className="bg-[#FCFBF9] p-6 border-b border-[#E8E2D9] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#2A6B25] text-[28px]">storefront</span>
              <h2 className="font-display-sm text-2xl font-bold text-[#154212]">Buyer's Claim</h2>
            </div>
            <span className="font-label-md font-bold text-[#5B755D] bg-white border border-[#E8E2D9] px-3 py-1.5 rounded-lg truncate max-w-[140px]">
              {resolvedOrder.buyer_name}
            </span>
          </div>
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="mb-8">
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Produce & Issue</h3>
              <p className="font-body-md text-[#334D35] bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9] leading-relaxed">
                {disputeData.description}
              </p>
            </div>
            <div className="mb-8">
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Evidence Provided</h3>
              <div className="grid grid-cols-2 gap-4">
                <img alt="Damaged produce 1" className="w-full h-36 object-cover rounded-xl border-2 border-[#E8E2D9] hover:border-[#154212] transition-colors" src={disputeData.photo_urls?.[0] || cropMedia.primary} />
                <img alt="Damaged produce 2" className="w-full h-36 object-cover rounded-xl border-2 border-[#E8E2D9] hover:border-[#154212] transition-colors" src={disputeData.photo_urls?.[1] || cropMedia.detail1 || cropMedia.primary} />
              </div>
            </div>
            <div>
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Affected Quantity & Value</h3>
              <div className="flex items-center justify-between bg-[#EFEBE3] p-5 rounded-xl border border-[#E8E2D9]">
                <span className="font-body-lg font-bold text-[#154212]">Claim Amount ({disputeData.rejected_quantity_kg} kg)</span>
                <span className="font-display-sm text-2xl font-bold text-[#BA1A1A]">{formatCurrency(partialRefundAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer's Response */}
        <div className="lg:col-span-4 bg-white border border-[#E8E2D9] rounded-2xl flex flex-col shadow-sm overflow-hidden">
          <div className="bg-[#FCFBF9] p-6 border-b border-[#E8E2D9] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#154212] text-[28px]">agriculture</span>
              <h2 className="font-display-sm text-2xl font-bold text-[#154212]">Farmer's Dispatch</h2>
            </div>
            <span className="font-label-md font-bold text-[#5B755D] bg-white border border-[#E8E2D9] px-3 py-1.5 rounded-lg truncate max-w-[140px]">
              {resolvedOrder.farmer_name}
            </span>
          </div>
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="mb-8">
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Mandi Origin & Dispatch Statement</h3>
              <p className="font-body-md text-[#334D35] bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9] leading-relaxed">
                The {resolvedOrder.crop} lot ({resolvedOrder.quantity} kg) was verified Grade A upon departure from {resolvedOrder.location}. Transit route followed standard APMC logistics protocol.
              </p>
            </div>
            <div className="mb-8">
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Verification Badges</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-[#E8E2D9] rounded-xl p-4 flex flex-col items-center justify-center bg-[#FCFBF9] hover:bg-[#F7F4F0] hover:border-[#154212] transition-colors text-center h-36 cursor-pointer">
                  <span className="material-symbols-outlined text-[36px] text-[#2A6B25] mb-2">description</span>
                  <span className="font-label-sm font-bold text-[#154212]">MSAMB Ingestion Pass</span>
                </div>
                <div className="border-2 border-[#E8E2D9] rounded-xl p-4 flex flex-col items-center justify-center bg-[#FCFBF9] hover:bg-[#F7F4F0] hover:border-[#154212] transition-colors text-center h-36 cursor-pointer">
                  <span className="material-symbols-outlined text-[36px] text-[#2A6B25] mb-2">local_shipping</span>
                  <span className="font-label-sm font-bold text-[#154212]">Agro-Transit GPS Log</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Accepted Portion Escrow</h3>
              <div className="flex items-center justify-between bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9]">
                <span className="font-body-lg font-bold text-[#154212]">Disbursable to Farmer</span>
                <span className="font-display-sm text-2xl font-bold text-[#154212]">{formatCurrency(farmerReleaseAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4 bg-white border border-[#E8E2D9] rounded-2xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-[#E8E2D9] bg-[#FCFBF9] rounded-t-2xl">
            <h2 className="font-display-sm text-xl font-bold text-[#154212] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2A6B25]">admin_panel_settings</span> APMC Officer Ruling
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-5">
            <div className="bg-[#EFEBE3] p-5 rounded-xl border border-[#E8E2D9]">
              <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-1">Total Locked Escrow Payout</p>
              <p className="font-display-sm text-3xl font-bold text-[#154212]">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-[#5B755D] mt-1">Secured in MSAMB Maharashtra Escrow Gateway</p>
            </div>
            
            <label className="flex flex-col gap-2 flex-1">
              <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">Officer Settlement Notes</span>
              <textarea 
                className="w-full bg-[#FCFBF9] border-2 border-[#E8E2D9] rounded-xl p-4 font-body-md text-[#334D35] focus:outline-none focus:bg-white focus:border-[#154212] resize-none min-h-[100px] transition-colors" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add justification for dispute verdict..."
              ></textarea>
            </label>
            
            <div className="mt-auto flex flex-col gap-3">
              <button disabled={loading} onClick={() => handleResolve('partial_settlement')} className="w-full bg-[#154212] text-white py-3.5 px-4 rounded-xl font-label-lg font-bold shadow-md hover:bg-[#0E2C14] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">done_all</span> {loading ? 'Processing...' : `Award Partial Refund (${formatCurrency(partialRefundAmount)})`}
              </button>
              <button disabled={loading} onClick={() => handleResolve('full_refund')} className="w-full bg-white border-2 border-[#BA1A1A] text-[#BA1A1A] py-3.5 px-4 rounded-xl font-label-lg font-bold hover:bg-[#FFDAD6] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">restart_alt</span> {loading ? 'Processing...' : 'Award Full Refund to Buyer'}
              </button>
              <button disabled={loading} onClick={() => handleResolve('release_all_to_farmer')} className="w-full bg-white border-2 border-[#154212] text-[#154212] py-3.5 px-4 rounded-xl font-label-lg font-bold hover:bg-[#F7F4F0] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">check_circle</span> Dismiss Claim (Full Payout to Farmer)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
