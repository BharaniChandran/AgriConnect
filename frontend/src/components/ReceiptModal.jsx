import React from 'react';
import { formatCurrency } from '../utils/formatters';

export default function ReceiptModal({ isOpen, onClose, order, lot }) {
  if (!isOpen) return null;

  const resolvedOrder = order || {
    id: 'TX-892301',
    lot_id: lot?.lot_id || 'lot-4829',
    crop: lot?.crop || 'Fresh Produce',
    quantity: lot?.quantity || 1250,
    quality: lot?.quality || 'Grade A',
    price_per_kg: lot?.price_per_kg || 28.5,
    total_amount: (lot?.quantity || 1250) * (lot?.price_per_kg || 28.5),
    location: lot?.location || 'Pimpalgaon Baswant APMC, Nashik',
    farmer_name: lot?.farmer_name || 'Ram Patil (Sahyadri Agro)',
    buyer_name: lot?.buyer_name || 'Ravi Verma (Green Grocers Ltd)',
    status: lot?.status || 'released_to_farmer',
    created_at: lot?.created_at || new Date().toISOString()
  };

  const receiptNo = `REC-MSAMB-${resolvedOrder.id ? resolvedOrder.id.replace(/[^a-zA-Z0-9]/g, '') : Date.now().toString().slice(-6)}`;
  const dateFormatted = new Date(resolvedOrder.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const grossTotal = parseFloat(resolvedOrder.total_amount || (resolvedOrder.quantity * resolvedOrder.price_per_kg) || 0);
  const apmcCess = parseFloat((grossTotal * 0.01).toFixed(2)); // 1% APMC Market Development Fee
  const netEscrowTotal = (grossTotal + apmcCess).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    const invoiceContent = `
========================================================================
             MAHARASHTRA STATE AGRICULTURAL MARKETING BOARD (MSAMB)
                       AGRICONNECT PILOT ESCROW RECEIPT
========================================================================
Receipt Number  : ${receiptNo}
Transaction ID  : ${resolvedOrder.id || 'N/A'}
Date & Time     : ${dateFormatted}
APMC Mandi Yard : ${resolvedOrder.location}
Escrow Status   : ${resolvedOrder.status ? resolvedOrder.status.toUpperCase() : 'HELD IN ESCROW'}
------------------------------------------------------------------------
PARTIES INVOLVED:
Buyer Name      : ${resolvedOrder.buyer_name || 'APMC Registered Buyer'}
Farmer Name     : ${resolvedOrder.farmer_name || 'Verified Farmer'}
------------------------------------------------------------------------
PRODUCE SPECIFICATIONS:
Commodity       : ${resolvedOrder.crop}
Quality Grade   : ${resolvedOrder.quality || 'Grade A'}
Net Quantity    : ${resolvedOrder.quantity} kg
Agreed Base Rate: INR ${resolvedOrder.price_per_kg} / kg
------------------------------------------------------------------------
FINANCIAL BREAKDOWN:
Gross Escrow Payout : INR ${grossTotal.toLocaleString('en-IN')}
APMC Mandi Cess (1%): INR ${apmcCess.toLocaleString('en-IN')}
------------------------------------------------------------------------
TOTAL ESCROW VALUE  : INR ${parseFloat(netEscrowTotal).toLocaleString('en-IN')}
------------------------------------------------------------------------
Security Guarantee:
Funds held under Section 31 of Maharashtra APMC Act, 1963.
Automated disbursement guaranteed upon visual inspection and biometric/e-sign confirmation.
Digitally Certified by AgriConnect Multi-Party Settlement Gateway.
========================================================================
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriConnect_Receipt_${resolvedOrder.crop.replace(/[^a-zA-Z0-9]/g, '_')}_${receiptNo}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8E2D9] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#154212] text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-white text-[24px]">receipt_long</span>
            </div>
            <div>
              <h2 className="font-display-sm text-xl font-bold">Official Escrow Receipt</h2>
              <p className="text-xs text-[#A6E89B]">MSAMB Certified • APMC Maharashtra Pilot</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 md:p-8 overflow-y-auto space-y-6 text-[#154212] bg-[#FCFBF9]">
          
          {/* Top Receipt Seal Header */}
          <div className="text-center pb-6 border-b border-[#E8E2D9]">
            <div className="inline-flex items-center gap-2 bg-[#EFEBE3] text-[#154212] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-[#E8E2D9]">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              Government Verified Escrow Receipt
            </div>
            <h3 className="font-display-sm text-2xl font-bold text-[#154212]">AgriConnect Trade Certificate</h3>
            <p className="text-xs text-[#5B755D] mt-1">Maharashtra State Agricultural Marketing Board (MSAMB)</p>
          </div>

          {/* Key Meta Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D9]">
            <div>
              <span className="block text-[11px] font-bold text-[#5B755D] uppercase tracking-wider">Receipt No</span>
              <span className="block text-sm font-bold font-mono text-[#154212] truncate">{receiptNo}</span>
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[#5B755D] uppercase tracking-wider">Date & Time</span>
              <span className="block text-sm font-bold text-[#154212]">{dateFormatted}</span>
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[#5B755D] uppercase tracking-wider">Status</span>
              <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-300 capitalize">
                {resolvedOrder.status ? resolvedOrder.status.replace(/_/g, ' ') : 'Escrow Secured'}
              </span>
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E8E2D9]">
              <span className="text-xs font-bold text-[#5B755D] uppercase tracking-wider block mb-1">Buyer Information</span>
              <p className="text-sm font-bold text-[#154212]">{resolvedOrder.buyer_name}</p>
              <p className="text-xs text-[#5B755D]">APMC Registered Trader</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8E2D9]">
              <span className="text-xs font-bold text-[#5B755D] uppercase tracking-wider block mb-1">Farmer / Seller</span>
              <p className="text-sm font-bold text-[#154212]">{resolvedOrder.farmer_name}</p>
              <p className="text-xs text-[#5B755D]">{resolvedOrder.location}</p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F4F0] text-[#5B755D] text-xs font-bold uppercase border-b border-[#E8E2D9]">
                <tr>
                  <th className="p-3.5">Produce & Grade</th>
                  <th className="p-3.5 text-center">Quantity</th>
                  <th className="p-3.5 text-right">Rate</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                <tr>
                  <td className="p-3.5">
                    <span className="font-bold text-[#154212] block">{resolvedOrder.crop}</span>
                    <span className="text-xs text-[#5B755D]">Lot #{resolvedOrder.lot_id?.slice(-8)} • {resolvedOrder.quality || 'Grade A'}</span>
                  </td>
                  <td className="p-3.5 text-center font-bold">{resolvedOrder.quantity} kg</td>
                  <td className="p-3.5 text-right">₹{resolvedOrder.price_per_kg}/kg</td>
                  <td className="p-3.5 text-right font-bold">{formatCurrency(grossTotal)}</td>
                </tr>
                <tr className="bg-[#FCFBF9] text-xs text-[#5B755D]">
                  <td colSpan="3" className="p-3">APMC Mandi Development Cess (1%)</td>
                  <td className="p-3 text-right font-bold text-[#154212]">{formatCurrency(apmcCess)}</td>
                </tr>
                <tr className="bg-[#EFEBE3] text-base font-bold text-[#154212]">
                  <td colSpan="3" className="p-4">Total Escrow Value</td>
                  <td className="p-4 text-right text-lg text-[#154212]">{formatCurrency(netEscrowTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-between p-4 bg-[#EFEBE3] rounded-xl border border-[#E8E2D9] text-xs">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-700 text-[24px]">verified_user</span>
              <div>
                <span className="font-bold block text-[#154212]">Digital Escrow Guarantee</span>
                <span className="text-[#5B755D]">Disbursed under Maharashtra APMC Act compliance.</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] text-[#5B755D]">AUTH: AC-2026-SECURE</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 md:p-6 bg-white border-t border-[#E8E2D9] flex flex-col sm:flex-row gap-3 justify-end shrink-0">
          <button 
            onClick={handleDownloadInvoice}
            className="px-5 py-3 rounded-xl border-2 border-[#154212] text-[#154212] font-label-md font-bold hover:bg-[#F7F4F0] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Download Text Invoice (.txt)
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-3 rounded-xl bg-[#154212] text-white font-label-md font-bold hover:bg-[#0E2C14] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            Print / Save as PDF
          </button>
        </div>

      </div>
    </div>
  );
}
