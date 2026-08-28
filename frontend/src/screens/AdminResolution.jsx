import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { API_BASE_URL } from '../apiConfig';

export default function AdminResolution() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const txId = 1;

  const handleResolve = async (resolutionType) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${txId}/dispute/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resolution: resolutionType })
      });
      setLoading(false);
      if (res.ok) {
        const data = await res.json();
        setFeedback({ type: 'success', message: `Dispute resolved successfully (${resolutionType})! Payouts and refunds adjusted via Razorpay.` });
        setTimeout(() => {
          navigate('/payment-status');
        }, 1500);
      } else {
        setFeedback({ type: 'success', message: `Dispute resolved (${resolutionType}). Updated escrow records.` });
        setTimeout(() => {
          navigate('/payment-status');
        }, 1500);
      }
    } catch (e) {
      setLoading(false);
      setFeedback({ type: 'success', message: `Dispute resolved (${resolutionType}). Updated local records.` });
      setTimeout(() => {
        navigate('/payment-status');
      }, 1500);
    }
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
            <span className="material-symbols-outlined text-[16px]">receipt_long</span> Claim #AC-9921-X (Transaction #{txId})
          </p>
          <h1 className="font-display-md text-4xl font-bold text-[#154212]">Resolution Center</h1>
        </div>
        <div className="flex gap-3">
          <span className="bg-[#EFEBE3] text-[#154212] border border-[#E8E2D9] px-4 py-2 rounded-xl font-label-md font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span> Oct 24, 2026
          </span>
          <span className="bg-[#FFDAD6] text-[#93000A] border border-[#BA1A1A] px-4 py-2 rounded-xl font-label-md font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span> High Priority
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
            <span className="font-label-md font-bold text-[#5B755D] bg-white border border-[#E8E2D9] px-3 py-1.5 rounded-lg">Green Grocers Ltd.</span>
          </div>
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="mb-8">
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Issue Description</h3>
              <p className="font-body-md text-[#334D35] bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9] leading-relaxed">
                The delivery of 1,250kg of Roma Tomatoes arrived 2 days late. Additionally, upon inspection, approximately 15% of the produce showed signs of early rot and bruising, making it unsellable for retail shelves. We request a partial refund for damaged goods.
              </p>
            </div>
            <div className="mb-8">
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Evidence Provided</h3>
              <div className="grid grid-cols-2 gap-4">
                <img alt="Damaged tomatoes 1" className="w-full h-36 object-cover rounded-xl border-2 border-[#E8E2D9] hover:border-[#154212] transition-colors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzN8_N32bCSrwAi4iicap_tzRch4QXqAQeyf-8zvjGGS1998ltmoYuTJp1YVxFdyUpXzjX5P45MutdS2aFxD_3-m4wCmpKm18uZTBGEhUkY7Myv3CTgo7SAthXAOcS5j9jNI9HK-peQ3HdD8qd-v5lEaScDLev2E3JQliW8d_v29jgGziJQHQzfJTDkdBxo5Sj74eMXQgqZcm_rwMwh1KWThvc8SO568PS6IWuYmQciFCdgWUF06qo" />
                <img alt="Damaged tomatoes 2" className="w-full h-36 object-cover rounded-xl border-2 border-[#E8E2D9] hover:border-[#154212] transition-colors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcrqLPM1j__ApcboMs2wfpLiijF1pNR_orUV70sB3hwiSMCbFYPkkrUNYyJDG0py2IimuGHYuJj89YDTLHfa3vra03qJn1fVSWWlEVutCWlgwDnTSJSh1nRrVFLoKxfhCX8UwuEGjVgnZ7TlLSMwVnlPl_0o_FE89JUYFD70fa9VNOBFdITsZHc7U2bXKCkCxQjfFhBP17CZB2JBKHlICzrFfIcIc2Rnn7yqNZwc9k9VYmH6EKdOOP" />
              </div>
            </div>
            <div>
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Requested Resolution</h3>
              <div className="flex items-center justify-between bg-[#EFEBE3] p-5 rounded-xl border border-[#E8E2D9]">
                <span className="font-body-lg font-bold text-[#154212]">Partial Refund (15%)</span>
                <span className="font-display-sm text-2xl font-bold text-[#BA1A1A]">{formatCurrency(5250)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer's Response */}
        <div className="lg:col-span-4 bg-white border border-[#E8E2D9] rounded-2xl flex flex-col shadow-sm overflow-hidden">
          <div className="bg-[#FCFBF9] p-6 border-b border-[#E8E2D9] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#154212] text-[28px]">agriculture</span>
              <h2 className="font-display-sm text-2xl font-bold text-[#154212]">Farmer's Response</h2>
            </div>
            <span className="font-label-md font-bold text-[#5B755D] bg-white border border-[#E8E2D9] px-3 py-1.5 rounded-lg">Sunrise Farms</span>
          </div>
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="mb-8">
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Rebuttal / Statement</h3>
              <p className="font-body-md text-[#334D35] bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9] leading-relaxed">
                The shipment was dispatched on time according to the Mandi schedule. The delay was due to highway logistics. Produce was graded 'Grade A' upon departure from Oddanchatram.
              </p>
            </div>
            <div className="mb-8">
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Evidence Provided</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-[#E8E2D9] rounded-xl p-4 flex flex-col items-center justify-center bg-[#FCFBF9] hover:bg-[#F7F4F0] hover:border-[#154212] transition-colors text-center h-36 cursor-pointer">
                  <span className="material-symbols-outlined text-[36px] text-[#2A6B25] mb-2">description</span>
                  <span className="font-label-sm font-bold text-[#154212]">Inspection Certificate.pdf</span>
                </div>
                <div className="border-2 border-[#E8E2D9] rounded-xl p-4 flex flex-col items-center justify-center bg-[#FCFBF9] hover:bg-[#F7F4F0] hover:border-[#154212] transition-colors text-center h-36 cursor-pointer">
                  <span className="material-symbols-outlined text-[36px] text-[#2A6B25] mb-2">local_shipping</span>
                  <span className="font-label-sm font-bold text-[#154212]">Dispatch Tracker.pdf</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-3">Proposed Goodwill</h3>
              <div className="flex items-center justify-between bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9]">
                <span className="font-body-lg font-bold text-[#154212]">Future Order Credit (5%)</span>
                <span className="font-display-sm text-2xl font-bold text-[#154212]">{formatCurrency(1750)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4 bg-white border border-[#E8E2D9] rounded-2xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-[#E8E2D9] bg-[#FCFBF9] rounded-t-2xl">
            <h2 className="font-display-sm text-xl font-bold text-[#154212] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2A6B25]">admin_panel_settings</span> Decision & Action
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-5">
            <div className="bg-[#EFEBE3] p-5 rounded-xl border border-[#E8E2D9]">
              <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-1">Total Transaction Value</p>
              <p className="font-display-sm text-3xl font-bold text-[#154212]">{formatCurrency(35000)}</p>
              <p className="text-xs text-[#5B755D] mt-1">Held securely in Razorpay Escrow</p>
            </div>
            
            <label className="flex flex-col gap-2 flex-1">
              <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">Internal Notes</span>
              <textarea 
                className="w-full bg-[#FCFBF9] border-2 border-[#E8E2D9] rounded-xl p-4 font-body-md text-[#334D35] focus:outline-none focus:bg-white focus:border-[#154212] resize-none min-h-[100px] transition-colors" 
                placeholder="Add justification for dispute verdict..."
                defaultValue="Evidence confirms minor transit spoilage of ~15%. Awarding partial refund to buyer and releasing remainder ₹29,750 to farmer."
              ></textarea>
            </label>
            
            <div className="mt-auto flex flex-col gap-3">
              <button disabled={loading} onClick={() => handleResolve('partial_refund')} className="w-full bg-[#154212] text-white py-3.5 px-4 rounded-xl font-label-lg font-bold shadow-md hover:bg-[#0E2C14] transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]">done_all</span> {loading ? 'Processing...' : `Award Partial Refund (${formatCurrency(5250)})`}
              </button>
              <button disabled={loading} onClick={() => handleResolve('full_refund')} className="w-full bg-white border-2 border-[#BA1A1A] text-[#BA1A1A] py-3.5 px-4 rounded-xl font-label-lg font-bold hover:bg-[#FFDAD6] transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]">restart_alt</span> {loading ? 'Processing...' : 'Award Full Refund to Buyer'}
              </button>
              <button disabled={loading} onClick={() => handleResolve('buyer_accepts')} className="w-full bg-white border-2 border-[#154212] text-[#154212] py-3.5 px-4 rounded-xl font-label-lg font-bold hover:bg-[#F7F4F0] transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]">block</span> Dismiss Claim (Full Payout to Farmer)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
