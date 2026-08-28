import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { rtdb } from '../firebaseClient';
import { ref as dbRef, set as dbSet } from 'firebase/database';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('agriconnect_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
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
        status: 'held_in_escrow', // 'held_in_escrow' | 'under_review' | 'released_to_farmer' | 'disputed' | 'refunded'
        created_at: new Date(Date.now() - 3600000).toISOString(),
        dispute: null
      }
    ];
  });

  const [activeOrderId, setActiveOrderId] = useState(() => {
    try {
      const active = localStorage.getItem('agriconnect_active_order_id');
      if (active) return active;
    } catch {}
    return 'TX-892301';
  });

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agriconnect_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  // Save activeOrderId to localStorage
  useEffect(() => {
    try {
      if (activeOrderId) {
        localStorage.setItem('agriconnect_active_order_id', activeOrderId);
      }
    } catch (e) {}
  }, [activeOrderId]);

  // Find active order and lot
  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0] || null;
  const activeLot = activeOrder ? {
    lot_id: activeOrder.lot_id,
    crop: activeOrder.crop,
    quantity: activeOrder.quantity,
    quality: activeOrder.quality || 'Grade A',
    price_per_kg: activeOrder.price_per_kg,
    location: activeOrder.location,
    farmer_name: activeOrder.farmer_name,
    buyer_name: activeOrder.buyer_name,
    status: activeOrder.status,
    created_at: activeOrder.created_at
  } : null;

  // Select an order as active
  const selectOrder = (orderId) => {
    setActiveOrderId(orderId);
    try {
      localStorage.setItem('agriconnect_active_order_id', orderId);
    } catch {}
  };

  // Create a new purchase order for any chosen lot
  const createPurchaseOrder = (lot, buyerUser) => {
    const orderId = `TX-${Date.now().toString().slice(-6)}`;
    const qty = parseFloat(lot.quantity || 1000);
    const rate = parseFloat(lot.price_per_kg || 28.5);
    const total = parseFloat((qty * rate).toFixed(2));

    const newOrder = {
      id: orderId,
      lot_id: lot.lot_id || `lot-${Date.now().toString().slice(-4)}`,
      crop: lot.crop || 'Fresh Produce',
      quantity: qty,
      quality: lot.quality || 'Grade A',
      price_per_kg: rate,
      total_amount: total,
      location: lot.location || 'Nashik APMC, Maharashtra',
      farmer_name: lot.farmer_name || 'Farmer Partner',
      buyer_name: buyerUser?.name || 'APMC Registered Buyer',
      status: 'held_in_escrow',
      created_at: new Date().toISOString(),
      dispute: null
    };

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== orderId)]);
    setActiveOrderId(orderId);

    // Save latest deal for backward compatibility
    try {
      localStorage.setItem('agriconnect_latest_deal', JSON.stringify({ lot, tx: newOrder }));
      localStorage.setItem('agriconnect_buyer_transactions', JSON.stringify([newOrder, ...orders]));
    } catch {}

    // Sync to Realtime DB
    try {
      dbSet(dbRef(rtdb, `transactions/${orderId}`), newOrder).catch(() => {});
    } catch {}

    return newOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus, extraData = {}) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus,
          ...extraData,
          updated_at: new Date().toISOString()
        };
      }
      return order;
    }));
  };

  // Accept delivery & release escrow
  const acceptDelivery = (orderId) => {
    const targetId = orderId || activeOrderId;
    updateOrderStatus(targetId, 'released_to_farmer');

    // Broadcast acceptance in real-time
    try {
      const channel = supabase.channel('agriconnect_marketplace');
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          const target = orders.find(o => o.id === targetId);
          channel.send({
            type: 'broadcast',
            event: 'lot_accepted',
            payload: {
              lotId: target?.lot_id,
              crop: target?.crop,
              quantity: target?.quantity,
              payout: target?.total_amount
            }
          });
        }
      });
    } catch {}
  };

  // Raise dispute on an order
  const raiseDispute = (orderId, disputeData) => {
    const targetId = orderId || activeOrderId;
    updateOrderStatus(targetId, 'disputed', {
      dispute: {
        ...disputeData,
        created_at: new Date().toISOString(),
        status: 'under_admin_review'
      }
    });
  };

  // Resolve dispute
  const resolveDispute = (orderId, resolution, notes = '') => {
    const targetId = orderId || activeOrderId;
    const finalStatus = resolution === 'full_refund' ? 'refunded' : (resolution === 'partial_settlement' ? 'partially_refunded' : 'released_to_farmer');
    updateOrderStatus(targetId, finalStatus, {
      resolution: {
        type: resolution,
        notes: notes,
        resolved_at: new Date().toISOString()
      }
    });
  };

  return (
    <OrderContext.Provider value={{
      orders,
      activeOrderId,
      activeOrder,
      activeLot,
      selectOrder,
      createPurchaseOrder,
      updateOrderStatus,
      acceptDelivery,
      raiseDispute,
      resolveDispute
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
