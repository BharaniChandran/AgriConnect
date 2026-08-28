import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';
import { getCropMedia } from '../utils/cropImages';
import ReceiptModal from '../components/ReceiptModal';

export default function OrdersList() {
  const { user } = useAuth();
  const { orders, activeOrderId, selectOrder } = useOrders();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'disputed'
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  const isBuyer = user?.role === 'buyer';

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return order.status === 'held_in_escrow' || order.status === 'under_review';
    if (filter === 'completed') return order.status === 'released_to_farmer';
    if (filter === 'disputed') return order.status === 'disputed' || order.status === 'refunded' || order.status === 'partially_refunded';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'released_to_farmer':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {t('released') || 'Escrow Released & Paid'}
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Dispute Under Review
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
            Inspection in Progress
          </span>
        );
      case 'held_in_escrow':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Escrow Locked & In Transit
          </span>
        );
    }
  };

  const handleOrderAction = (order, targetScreen) => {
    selectOrder(order.id);
    navigate(targetScreen, { state: { txId: order.id, lot: order } });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-md text-3xl md:text-4xl font-bold text-[#154212]">
            {isBuyer ? 'My Orders & Deliveries' : 'Active Deals & Orders'}
          </h1>
          <p className="font-body-lg text-[#5B755D] mt-1">
            {isBuyer 
              ? 'Track your produce purchases, inspect deliveries, manage disputes, and download receipts.' 
              : 'Monitor buyer purchases, dispatch produce to mandis, and verify escrow payouts.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-[#EFEBE3] p-1.5 rounded-2xl border border-[#E8E2D9] text-xs font-bold">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${filter === 'all' ? 'bg-[#154212] text-white shadow-sm' : 'text-[#334D35] hover:bg-white/50'}`}
          >
            All ({orders.length})
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${filter === 'active' ? 'bg-[#154212] text-white shadow-sm' : 'text-[#334D35] hover:bg-white/50'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${filter === 'completed' ? 'bg-[#154212] text-white shadow-sm' : 'text-[#334D35] hover:bg-white/50'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter('disputed')}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${filter === 'disputed' ? 'bg-[#154212] text-white shadow-sm' : 'text-[#334D35] hover:bg-white/50'}`}
          >
            Disputes
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E8E2D9] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EFEBE3] text-[#154212] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <h3 className="font-display-sm text-2xl font-bold text-[#154212]">No Orders Found</h3>
          <p className="text-sm text-[#5B755D] max-w-md mx-auto">
            {isBuyer 
              ? 'You have not purchased any crop lots in this category yet. Visit the Marketplace to explore live listings.' 
              : 'No buyer orders match this filter yet.'}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#154212] text-white font-label-lg font-bold rounded-xl hover:bg-[#0E2C14] transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => {
            const cropMedia = getCropMedia(order.crop);
            const isSelected = order.id === activeOrderId;

            return (
              <div 
                key={order.id}
                className={`bg-white rounded-3xl border-2 transition-all p-6 md:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                  isSelected ? 'border-[#154212] ring-2 ring-[#154212]/20 bg-gradient-to-r from-white to-[#FAF8F5]' : 'border-[#E8E2D9] hover:border-[#154212]/40'
                }`}
              >
                {/* Left: Produce Image & Details */}
                <div className="flex items-start md:items-center gap-5 w-full lg:w-auto">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-[#E8E2D9] shrink-0 shadow-sm relative">
                    <img src={cropMedia.primary} alt={order.crop} className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute top-1 left-1 bg-[#154212] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[#5B755D] uppercase">
                        #{order.id} • Lot #{order.lot_id?.slice(-8)}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>

                    <h3 className="font-display-sm text-2xl font-bold text-[#154212]">
                      {order.crop}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5B755D]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">scale</span>
                        <strong>{order.quantity} kg</strong> ({order.quality || 'Grade A'})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">payments</span>
                        ₹{order.price_per_kg}/kg
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {order.location}
                      </span>
                    </div>

                    <p className="text-xs text-[#334D35]">
                      <strong>{isBuyer ? 'Farmer:' : 'Buyer:'}</strong> {isBuyer ? order.farmer_name : order.buyer_name}
                    </p>
                  </div>
                </div>

                {/* Right: Total Value & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E8E2D9]">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B755D] block">Total Escrow Value</span>
                    <span className="font-display-sm text-2xl md:text-3xl font-bold text-[#154212]">
                      {formatCurrency(order.total_amount || (order.quantity * order.price_per_kg))}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {/* Action 1: Review Delivery / Inspect */}
                    {isBuyer && (order.status === 'held_in_escrow' || order.status === 'under_review') && (
                      <button 
                        onClick={() => handleOrderAction(order, '/buyer-review')}
                        className="px-4 py-2.5 bg-[#154212] text-white font-label-md font-bold rounded-xl hover:bg-[#0E2C14] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">fact_check</span>
                        Review Delivery
                      </button>
                    )}

                    {/* Action 2: Track Escrow / Payment Status */}
                    <button 
                      onClick={() => handleOrderAction(order, '/payment-status')}
                      className="px-4 py-2.5 bg-white border border-[#154212] text-[#154212] font-label-md font-bold rounded-xl hover:bg-[#F7F4F0] transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                      Escrow Details
                    </button>

                    {/* Action 3: View Official Receipt */}
                    <button 
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="px-4 py-2.5 bg-[#EFEBE3] text-[#154212] font-label-md font-bold rounded-xl hover:bg-[#E2DDD3] transition-all flex items-center gap-1.5 cursor-pointer border border-[#E8E2D9] text-xs"
                      title="Download Official Receipt"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      Receipt
                    </button>

                    {/* Action 4: Dispute details if disputed */}
                    {order.status === 'disputed' && (
                      <button 
                        onClick={() => handleOrderAction(order, '/dispute-notification')}
                        className="px-4 py-2.5 bg-[#FFDAD6] text-[#93000A] font-label-md font-bold rounded-xl hover:bg-[#FFB4AB] transition-all flex items-center gap-1.5 cursor-pointer border border-[#BA1A1A] text-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        View Dispute
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal 
        isOpen={Boolean(selectedReceiptOrder)} 
        onClose={() => setSelectedReceiptOrder(null)} 
        order={selectedReceiptOrder} 
      />

    </div>
  );
}
