import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';
import { API_BASE_URL } from '../apiConfig';
import { supabase } from '../supabaseClient';
import { db as firestoreDb } from '../firebaseClient';
import { collection, onSnapshot } from 'firebase/firestore';
import { calculateDistanceKm, estimateTransitDuration } from '../utils/distance';

export default function BuyerDashboard() {
  const { user, token } = useAuth();
  const { t } = useTranslation('common');
  const [lots, setLots] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [purchasingId, setPurchasingId] = useState(null);
  const [liveAlert, setLiveAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRadius, setFilterRadius] = useState('all'); // 'all', '50', '100'
  const navigate = useNavigate();

  const buyerLocation = user?.location || 'Nashik, Maharashtra';

  useEffect(() => {
    fetchLots();
    fetchTransactions();

    // 1. Subscribe to Firebase Cloud Firestore Live Snapshot
    let unsubscribeFirestore = () => {};
    try {
      unsubscribeFirestore = onSnapshot(collection(firestoreDb, 'crops_lots'), (snapshot) => {
        const firestoreLots = [];
        snapshot.forEach((doc) => {
          firestoreLots.push({ lot_id: doc.id, ...doc.data() });
        });
        if (firestoreLots.length > 0) {
          setLots((prev) => {
            const map = new Map();
            // Firestore lots take priority
            firestoreLots.forEach((l) => map.set(l.lot_id, l));
            prev.forEach((l) => {
              if (!map.has(l.lot_id)) map.set(l.lot_id, l);
            });
            return Array.from(map.values()).filter((l) => l.status === 'available');
          });
        }
      }, (err) => {
        console.warn('Firestore snapshot note:', err);
      });
    } catch (fsErr) {
      console.warn('Firestore onSnapshot init note:', fsErr);
    }

    // 2. Subscribe to Supabase Broadcast & DB Realtime Channel
    const channel = supabase
      .channel('agriconnect_marketplace')
      .on('broadcast', { event: 'lot_created' }, (eventPayload) => {
        const newLot = eventPayload.payload;
        if (newLot) {
          setLots((prev) => {
            const exists = prev.some((l) => l.lot_id === newLot.lot_id);
            if (exists) return prev;
            return [newLot, ...prev];
          });
          setLiveAlert({
            crop: newLot.crop,
            quantity: newLot.quantity,
            location: newLot.location,
            price: newLot.price_per_kg
          });
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crops_lots' },
        () => {
          fetchLots();
        }
      )
      .subscribe();

    // Periodic polling fallback every 10 seconds for multi-device reliability
    const interval = setInterval(() => {
      fetchLots(false);
    }, 10000);

    return () => {
      unsubscribeFirestore();
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [buyerLocation]);

  const fetchLots = async (showLoading = true) => {
    let localLots = [];
    try {
      const stored = localStorage.getItem('agriconnect_farmer_lots');
      if (stored) localLots = JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/lots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const backendIds = new Set(data.map((l) => l.lot_id));
        const merged = [...data, ...localLots.filter((l) => !backendIds.has(l.lot_id))];
        setLots(merged);
        return;
      }
    } catch (e) {
      console.warn('Backend lots fetch note:', e);
    }

    if (localLots.length > 0) {
      setLots(localLots);
    } else {
      setLots([
        {
          lot_id: 'lot-4829',
          crop: 'Tomato (Roma)',
          quantity: 1250,
          quality: 'Grade A',
          price_per_kg: 28.5,
          location: 'Pimpalgaon APMC, Nashik',
          status: 'available'
        },
        {
          lot_id: 'lot-4830',
          crop: 'Red Onion (Lasalgaon)',
          quantity: 3000,
          quality: 'Grade A',
          price_per_kg: 31.0,
          location: 'Lasalgaon APMC, Nashik',
          status: 'available'
        }
      ]);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTransactions(await res.json());
    } catch (e) {
      console.warn('Failed to fetch transactions:', e);
    }
  };

  const purchaseLot = async (lot) => {
    setPurchasingId(lot.lot_id);
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lot_id: lot.lot_id })
      });

      if (res.ok) {
        await fetchLots();
        await fetchTransactions();
        navigate('/buyer-review');
      } else {
        navigate('/buyer-review');
      }
    } catch (e) {
      console.error('Purchase lot error:', e);
      navigate('/buyer-review');
    } finally {
      setPurchasingId(null);
    }
  };

  // Compute road distances for each lot relative to Buyer's location
  const enrichedLots = lots.map((lot) => {
    const distKm = calculateDistanceKm(buyerLocation, lot.location);
    const transitTime = estimateTransitDuration(distKm);
    return {
      ...lot,
      distanceKm: distKm,
      transitTime: transitTime
    };
  });

  // Filter and sort lots (nearby first)
  const filteredLots = enrichedLots
    .filter((lot) => {
      const matchSearch =
        lot.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.location.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (filterRadius === '50') return lot.distanceKm <= 50;
      if (filterRadius === '100') return lot.distanceKm <= 100;
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Real-time Notification Banner */}
      {liveAlert && (
        <div className="bg-[#154212] text-white p-4 rounded-2xl shadow-lg border border-[#2A6B25] flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[26px] text-[#A6E89B]">bolt</span>
            <div>
              <p className="font-label-lg font-bold">
                ⚡ Live Lot Alert: New {liveAlert.crop} ({liveAlert.quantity} kg @ ₹{liveAlert.price}/kg)
              </p>
              <p className="text-xs text-[#A6E89B]">
                Listed right now at {liveAlert.location}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLiveAlert(null)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Live Sync Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#154212] bg-[#E4ECE3] px-2.5 py-0.5 rounded-full">
              Live APMC Feed Active
            </span>
          </div>
          <h1 className="font-display-md text-3xl md:text-4xl font-bold text-[#154212] mb-1">
            Buyer Marketplace
          </h1>
          <p className="font-body-md text-[#5B755D]">
            Real-time APMC arrivals & direct farmer lots near <strong className="text-[#154212]">{buyerLocation}</strong>
          </p>
        </div>

        {/* Quick Search & Radius Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search crop or APMC mandi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E8E2D9] focus:border-[#154212] py-2.5 px-3.5 pr-9 rounded-xl outline-none text-sm font-medium"
            />
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#5B755D] text-[20px] pointer-events-none">
              search
            </span>
          </div>

          <select
            value={filterRadius}
            onChange={(e) => setFilterRadius(e.target.value)}
            className="bg-white border border-[#E8E2D9] focus:border-[#154212] py-2.5 px-3 rounded-xl text-xs font-bold text-[#154212] outline-none"
          >
            <option value="all">All Distances</option>
            <option value="50">Nearby (&lt; 50 km)</option>
            <option value="100">Regional (&lt; 100 km)</option>
          </select>
        </div>
      </div>

      {/* Available Produce Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display-sm text-2xl font-bold text-[#154212] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5B755D]">storefront</span>
            Available Farmer Lots ({filteredLots.length})
          </h2>
          <span className="text-xs font-bold text-[#5B755D]">
            Sorted by Proximity to your Mandi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => {
            const isNearby = lot.distanceKm <= 40;
            return (
              <div
                key={lot.lot_id}
                className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Proximity Badge */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      isNearby
                        ? 'bg-[#E4ECE3] text-[#154212] border border-[#2A6B25]/20'
                        : 'bg-[#F2EFE9] text-[#5B755D]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isNearby ? 'near_me' : 'route'}
                    </span>
                    <span>{lot.distanceKm} km away ({lot.transitTime})</span>
                  </span>

                  <span className="bg-[#EFEBE3] text-[#154212] px-2.5 py-1 rounded-full font-label-sm font-bold tracking-wider text-[11px]">
                    {lot.quality || 'Grade A'}
                  </span>
                </div>

                <div>
                  <h3 className="font-display-sm text-2xl font-bold text-[#154212] group-hover:text-[#2A6B25] transition-colors mb-2">
                    {lot.crop}
                  </h3>

                  <div className="flex items-center gap-2 text-[#5B755D] mb-3 text-sm font-medium">
                    <span className="material-symbols-outlined text-[18px]">scale</span>
                    <span>{lot.quantity} kg Available</span>
                  </div>

                  <p className="text-[#5B755D] font-body-sm mb-4 flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-[16px] text-[#154212]">
                      location_on
                    </span>
                    <span>{lot.location}</span>
                  </p>
                </div>

                <div className="border-t border-[#E8E2D9] pt-4 mt-auto mb-4 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-[#5B755D] font-bold uppercase block">Mandi Price</span>
                    <p className="font-display-sm text-3xl font-bold text-[#154212]">
                      {formatCurrency(lot.price_per_kg)}
                      <span className="font-body-sm text-[#5B755D] font-medium text-sm">/kg</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#5B755D] font-bold uppercase block">Total Lot Value</span>
                    <span className="text-sm font-bold text-[#154212]">
                      {formatCurrency(lot.price_per_kg * lot.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  disabled={purchasingId === lot.lot_id}
                  onClick={() => purchaseLot(lot)}
                  className="w-full bg-[#154212] text-white py-3.5 rounded-xl font-label-lg font-bold hover:bg-[#0E2C14] transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer shadow-sm hover:shadow"
                >
                  {purchasingId === lot.lot_id ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      <span>Securing in Escrow...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">lock</span>
                      <span>Buy & Secure Escrow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {filteredLots.length === 0 && (
            <div className="col-span-full bg-[#FCFBF9] border border-dashed border-[#C6C0B5] rounded-2xl p-12 text-center text-[#5B755D]">
              <span className="material-symbols-outlined text-4xl mb-4 text-[#C6C0B5]">eco</span>
              <p className="font-body-lg font-bold text-[#154212]">No matching crops found in this radius.</p>
              <p className="font-body-sm mt-1">Try changing your search keywords or switching to "All Distances".</p>
            </div>
          )}
        </div>
      </section>

      {/* Active Orders Section */}
      <section>
        <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#5B755D]">local_shipping</span>
          <span>Active Escrow Deliveries ({transactions.length})</span>
        </h2>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-[#C6C0B5] transition-colors"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-full bg-[#EFEBE3] flex items-center justify-center text-[#154212] shrink-0">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h3 className="font-label-lg font-bold text-[#154212]">
                    Order #{tx.id} ({formatCurrency(tx.price)})
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#154212]"></span>
                    <p className="text-[#5B755D] font-label-sm uppercase tracking-wider text-xs">
                      Status: <strong>{tx.status}</strong> | Escrow: <strong>{tx.payment_status}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/buyer-review')}
                className="w-full sm:w-auto text-[#154212] border-2 border-[#154212] hover:bg-[#F7F4F0] px-6 py-2.5 rounded-xl font-label-md font-bold transition-colors cursor-pointer"
              >
                Inspect & Review Delivery
              </button>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="bg-[#FCFBF9] border border-[#E8E2D9] rounded-2xl p-8 text-center text-[#5B755D]">
              <p className="font-body-md">You have no active deliveries in progress.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

