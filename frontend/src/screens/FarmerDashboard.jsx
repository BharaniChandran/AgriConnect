import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';
import { API_BASE_URL } from '../apiConfig';
import { supabase } from '../supabaseClient';
import { db as firestoreDb, rtdb } from '../firebaseClient';
import { doc, setDoc } from 'firebase/firestore';
import { ref as dbRef, set as dbSet } from 'firebase/database';

export default function FarmerDashboard() {
  const { user, token } = useAuth();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const [lots, setLots] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  // Form input state with coordinates & radius
  const [cropInput, setCropInput] = useState({
    crop: 'Tomato (Roma)',
    quantity: '1500',
    price_per_kg: '28.50',
    quality: 'Grade A',
    location: 'Pimpalgaon APMC, Nashik',
    radius_km: 100
  });

  // Unified Recommendation state (Step 4 & Step 2 Extension)
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('buyers'); // 'buyers' | 'markets' | 'prediction'
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    fetchLots();
    fetchTransactions();
    // Auto-fetch initial recommendations
    fetchUnifiedRecommendations('Tomato (Roma)', 1500, 'Grade A', 'Pimpalgaon APMC, Nashik', 100);
  }, []);

  const getStoredLocalLots = () => {
    try {
      const stored = localStorage.getItem('agriconnect_farmer_lots');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalLots = (updatedLots) => {
    try {
      localStorage.setItem('agriconnect_farmer_lots', JSON.stringify(updatedLots));
    } catch (err) {
      console.warn('Could not save lots to localStorage', err);
    }
  };

  const fetchLots = async () => {
    const localLots = getStoredLocalLots();
    try {
      const res = await fetch(`${API_BASE_URL}/lots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const backendIds = new Set(data.map(l => l.lot_id));
        const merged = [...data, ...localLots.filter(l => !backendIds.has(l.lot_id))];
        setLots(merged);
      } else {
        setLots(localLots);
      }
    } catch (e) {
      console.warn('Backend lots fetch failed, using local/demo lots', e);
      setLots(localLots);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.warn('Transactions fetch failed', e);
    }
  };

  const fetchUnifiedRecommendations = async (crop, qty, quality, loc, radius) => {
    if (!crop || !qty || parseFloat(qty) <= 0) return;
    setIsAnalyzing(true);
    try {
      const url = `${API_BASE_URL}/recommendations/unified?crop=${encodeURIComponent(crop)}&quantity=${qty}&quality=${encodeURIComponent(quality)}&location=${encodeURIComponent(loc)}&radius_km=${radius || 100}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecommendation(data);
        if (data.top_market && data.top_market.expected_price_per_kg) {
          setCropInput(prev => ({
            ...prev,
            price_per_kg: data.top_market.expected_price_per_kg.toFixed(2)
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch recommendations:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerDebouncedFetch = (updatedInput) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const qty = parseFloat(updatedInput.quantity) || 1000;
      fetchUnifiedRecommendations(
        updatedInput.crop,
        qty,
        updatedInput.quality,
        updatedInput.location,
        updatedInput.radius_km
      );
    }, 350);
  };

  const handleAnalyzeClick = (e) => {
    e.preventDefault();
    const qty = parseFloat(cropInput.quantity) || 1000;
    fetchUnifiedRecommendations(
      cropInput.crop,
      qty,
      cropInput.quality,
      cropInput.location,
      cropInput.radius_km
    );
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    if (!cropInput.crop.trim()) {
      setStatusFeedback({ type: 'error', message: 'Please enter a valid crop name.' });
      return;
    }

    const qty = parseFloat(cropInput.quantity);
    const price = parseFloat(cropInput.price_per_kg);

    if (isNaN(qty) || qty <= 0) {
      setStatusFeedback({ type: 'error', message: 'Please enter a valid quantity greater than 0 kg.' });
      return;
    }

    if (isNaN(price) || price <= 0) {
      setStatusFeedback({ type: 'error', message: 'Please enter a valid price per kg greater than ₹0.' });
      return;
    }

    setIsPublishing(true);
    setStatusFeedback(null);

    const lotPayload = {
      crop: cropInput.crop.trim(),
      quantity: qty,
      price_per_kg: price,
      quality: cropInput.quality,
      location: cropInput.location
    };

    let createdLot = null;
    try {
      const res = await fetch(`${API_BASE_URL}/lots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lotPayload)
      });

      if (res.ok) {
        createdLot = await res.json();
      }
    } catch (err) {
      console.warn('API lot creation failed, persisting locally:', err);
    }

    if (!createdLot) {
      createdLot = {
        lot_id: `lot-${Date.now().toString().slice(-4)}`,
        farmer_id: user?.id || 'farmer-demo-1',
        crop: lotPayload.crop,
        quantity: lotPayload.quantity,
        quality: lotPayload.quality,
        location: lotPayload.location,
        price_per_kg: lotPayload.price_per_kg,
        status: 'available',
        created_at: new Date().toISOString()
      };
    }

    const currentLocal = getStoredLocalLots();
    saveLocalLots([createdLot, ...currentLocal]);
    setLots(prev => [createdLot, ...prev.filter(l => l.lot_id !== createdLot.lot_id)]);
    setIsPublishing(false);

    // 1. Sync to Supabase crops_lots table directly
    try {
      supabase.from('crops_lots').upsert({
        lot_id: createdLot.lot_id,
        farmer_id: createdLot.farmer_id || user?.id || 'farmer-1',
        crop: createdLot.crop,
        quantity: parseFloat(createdLot.quantity),
        quality: createdLot.quality || 'Grade A',
        location: createdLot.location || 'Nashik, Maharashtra',
        price_per_kg: parseFloat(createdLot.price_per_kg),
        status: 'available',
        created_at: createdLot.created_at || new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.warn('Supabase lot upsert note:', error);
      });
    } catch (sbUpsertErr) {
      console.warn('Supabase upsert note:', sbUpsertErr);
    }

    // 2. Sync to Firebase Cloud Firestore and Realtime Database for live distribution
    try {
      setDoc(doc(firestoreDb, 'crops_lots', createdLot.lot_id), {
        ...createdLot,
        created_at: createdLot.created_at || new Date().toISOString()
      }).catch((e) => console.warn('Firestore lot write note:', e));
    } catch (fsErr) {
      console.warn('Firestore setDoc note:', fsErr);
    }

    try {
      dbSet(dbRef(rtdb, `crops_lots/${createdLot.lot_id}`), createdLot).catch((e) => {
        console.warn('RTDB write note:', e);
      });
    } catch (rtdbErr) {
      console.warn('RTDB write note:', rtdbErr);
    }

    // 3. Broadcast in real-time to active buyers across Maharashtra APMCs
    try {
      const channel = supabase.channel('agriconnect_marketplace');
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'lot_created',
            payload: createdLot
          });
        }
      });
    } catch (sbBroadcastErr) {
      console.warn('Realtime broadcast note:', sbBroadcastErr);
    }

    navigate('/lot-confirmation', { state: { lot: createdLot } });
  };

  const handleSelectBuyerOffer = (buyer) => {
    navigate('/lot-confirmation', {
      state: {
        lot: {
          crop: cropInput.crop,
          quantity: parseFloat(cropInput.quantity),
          quality: cropInput.quality,
          price_per_kg: buyer.net_price_per_kg || parseFloat(cropInput.price_per_kg),
          location: cropInput.location,
          target_buyer: buyer
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <span className="bg-[#EFEBE3] text-[#154212] border border-[#E8E2D9] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
            OpenRouteService Driving Distance & Net Price Optimizer
          </span>
          <h1 className="font-display-md text-4xl font-bold text-[#154212]">{t('farmer_hub_title') || 'Farmer Hub & Advisory'}</h1>
          <p className="font-body-md text-[#5B755D] mt-1">
            {t('farmer_hub_desc') || 'Ranks buyers by who nets you the most money after transport cost — with real OpenRouteService driving distances and 3-day ML price forecasting.'}
          </p>
        </div>
      </div>

      {statusFeedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          statusFeedback.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <span className="material-symbols-outlined">{statusFeedback.type === 'error' ? 'error' : 'check_circle'}</span>
          <span className="font-medium">{statusFeedback.message}</span>
        </div>
      )}

      {/* Crop & Search Parameters Section */}
      <section className="bg-white p-6 md:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFEBE3] flex items-center justify-center text-[#154212]">
              <span className="material-symbols-outlined text-[24px]">explore</span>
            </div>
            <div>
              <h2 className="font-display-sm text-2xl font-bold text-[#154212]">{t('buyer_match_analyzer') || 'Buyer Match & Net Profit Analyzer'}</h2>
              <p className="text-sm text-[#5B755D]">{t('buyer_match_desc') || 'Finds verified buyers within driving radius and ranks by highest net payout.'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            className="hidden sm:inline-flex items-center gap-2 bg-[#F7F4F0] text-[#154212] hover:bg-[#EFEBE3] border border-[#154212] px-4 py-2.5 rounded-xl font-label-md font-bold transition-all text-sm cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[18px] ${isAnalyzing ? 'animate-spin' : ''}`}>
              {isAnalyzing ? 'sync' : 'auto_graph'}
            </span>
            {isAnalyzing ? 'Optimizing...' : (t('recalculate_distances') || 'Re-calculate Distances')}
          </button>
        </div>

        <form onSubmit={handleCreateLot} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">
                {t('crop_commodity') || 'Crop Commodity'}
              </label>
              <select
                value={cropInput.crop}
                onChange={e => {
                  const updated = {...cropInput, crop: e.target.value};
                  setCropInput(updated);
                  triggerDebouncedFetch(updated);
                }}
                className="w-full p-3.5 border border-[#E8E2D9] rounded-xl bg-[#FCFBF9] focus:bg-white focus:border-[#154212] outline-none font-medium text-[#154212]"
              >
                <option value="Tomato (Roma)">Tomato (Roma)</option>
                <option value="Onion">Onion (Bellary/Red)</option>
                <option value="Potato">Potato</option>
                <option value="Drumstick">Drumstick</option>
                <option value="Banana">Banana</option>
                <option value="Carrot">Carrot (Ooty)</option>
                <option value="Chilli Green">Green Chilli</option>
                <option value="Turmeric">Turmeric (Erode)</option>
                <option value="Brinjal">Brinjal</option>
                <option value="Cabbage">Cabbage</option>
              </select>
            </div>

            <div>
              <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">
                {t('total_quantity_kg') || 'Total Quantity (kg)'}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={cropInput.quantity}
                onChange={e => {
                  const updated = {...cropInput, quantity: e.target.value};
                  setCropInput(updated);
                  triggerDebouncedFetch(updated);
                }}
                className="w-full p-3.5 border border-[#E8E2D9] rounded-xl bg-[#FCFBF9] focus:bg-white focus:border-[#154212] outline-none font-medium text-[#154212]"
                placeholder="1500"
              />
            </div>

            <div>
              <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">
                {t('quality_grade') || 'Quality Grade'}
              </label>
              <select
                value={cropInput.quality}
                onChange={e => {
                  const updated = {...cropInput, quality: e.target.value};
                  setCropInput(updated);
                  triggerDebouncedFetch(updated);
                }}
                className="w-full p-3.5 border border-[#E8E2D9] rounded-xl bg-[#FCFBF9] focus:bg-white focus:border-[#154212] outline-none font-medium text-[#154212]"
              >
                <option value="Grade A">Grade A (Premium Retail)</option>
                <option value="Grade B">Grade B (Standard Mandi)</option>
                <option value="Grade C">Grade C (Commercial/Processing)</option>
              </select>
            </div>

            <div>
              <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">
                {t('farmer_location_hub') || 'Farmer Location / Hub'}
              </label>
              <select
                value={cropInput.location}
                onChange={e => {
                  const updated = {...cropInput, location: e.target.value};
                  setCropInput(updated);
                  triggerDebouncedFetch(updated);
                }}
                className="w-full p-3.5 border border-[#E8E2D9] rounded-xl bg-[#FCFBF9] focus:bg-white focus:border-[#154212] outline-none font-medium text-[#154212]"
              >
                <option value="Nashik APMC Mandi, Maharashtra">Nashik APMC, Maharashtra</option>
                <option value="Pune APMC Market Yard, Maharashtra">Pune APMC, Maharashtra</option>
                <option value="Vashi APMC Navi Mumbai, Maharashtra">Vashi APMC Navi Mumbai</option>
                <option value="Nagpur Kalamna APMC, Maharashtra">Nagpur Kalamna APMC</option>
                <option value="Kolhapur Shahu APMC, Maharashtra">Kolhapur APMC</option>
                <option value="Ahmednagar APMC, Maharashtra">Ahmednagar APMC</option>
                <option value="Lasalgaon Onion Mandi, Nashik">Lasalgaon Mandi, Nashik</option>
                <option value="Oddanchatram Mandi, Dindigul">Oddanchatram, Dindigul</option>
                <option value="Koyambedu Wholesale Market, Chennai">Koyambedu, Chennai</option>
              </select>
            </div>

            <div>
              <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">
                {t('max_driving_radius') || 'Max Driving Radius'}
              </label>
              <select
                value={cropInput.radius_km}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  const updated = {...cropInput, radius_km: val};
                  setCropInput(updated);
                  triggerDebouncedFetch(updated);
                }}
                className="w-full p-3.5 border-2 border-green-700 rounded-xl bg-white focus:border-[#154212] outline-none font-bold text-[#154212]"
              >
                <option value="50">50 km (Local Cluster)</option>
                <option value="100">100 km (Regional Mandis)</option>
                <option value="150">150 km (Adjacent Districts)</option>
                <option value="250">250 km (Wide Radius)</option>
                <option value="500">500 km (All Mandis)</option>
              </select>
            </div>
          </div>

          {/* Unified AI Recommendation & ORS Driving Distance Panel */}
          {recommendation && (
            <div className="bg-[#FCFBF9] rounded-2xl border-2 border-[#154212]/30 p-6 space-y-6">
              {/* Hero Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4 border-b border-[#E8E2D9]">
                {/* 1. Best Buyer Net Payout */}
                <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">handshake</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D]">Top Net Buyer</span>
                    <h3 className="font-display-sm text-lg font-bold text-[#154212] truncate">
                      {recommendation.summary?.top_buyer_name || 'Nearest Verified Buyer'}
                    </h3>
                    <p className="font-display-sm text-2xl font-bold text-purple-800 mt-0.5">
                      ₹{recommendation.summary?.top_buyer_net_price || '27.80'}/kg
                      <span className="text-xs font-medium text-[#5B755D] ml-1.5">(Net after transport)</span>
                    </p>
                  </div>
                </div>

                {/* 2. Top Mandi Gross Profit */}
                <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">payments</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D]">Best Mandi Profit</span>
                    <h3 className="font-display-sm text-lg font-bold text-[#154212]">
                      {recommendation.summary?.best_market_name}
                    </h3>
                    <p className="font-display-sm text-2xl font-bold text-green-700 mt-0.5">
                      {formatCurrency(recommendation.summary?.expected_net_profit)}
                      <span className="text-xs font-medium text-[#5B755D] ml-1.5">(₹{recommendation.summary?.net_profit_per_kg}/kg)</span>
                    </p>
                  </div>
                </div>

                {/* 3. ML Price Trend Forecast */}
                <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    recommendation.summary?.price_trend === 'rising' 
                      ? 'bg-amber-100 text-amber-800' 
                      : (recommendation.summary?.price_trend === 'falling' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800')
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">
                      {recommendation.summary?.price_trend === 'rising' ? 'trending_up' : (recommendation.summary?.price_trend === 'falling' ? 'trending_down' : 'trending_flat')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D]">AI 3-Day Trend</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        recommendation.summary?.price_trend === 'rising' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {recommendation.summary?.price_trend}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#154212] mt-1 leading-snug">
                      {recommendation.summary?.trend_advice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#E8E2D9] gap-6 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('buyers')}
                  className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'buyers' ? 'border-[#154212] text-[#154212]' : 'border-transparent text-[#5B755D] hover:text-[#154212]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  Ranked Local Buyers by Net Payout ({recommendation.ranked_buyers?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('markets')}
                  className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'markets' ? 'border-[#154212] text-[#154212]' : 'border-transparent text-[#5B755D] hover:text-[#154212]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">leaderboard</span>
                  Candidate Mandis ({recommendation.all_markets?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prediction')}
                  className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'prediction' ? 'border-[#154212] text-[#154212]' : 'border-transparent text-[#5B755D] hover:text-[#154212]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                  ML Price Forecast
                </button>
              </div>

              {/* Tab 1: Ranked Buyers by Net Price (Step 2 Extension) */}
              {activeTab === 'buyers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#5B755D] px-1">
                    <span>Showing buyers within <strong>{cropInput.radius_km} km</strong> driving radius ranked by highest net money to you.</span>
                    <span className="bg-[#EFEBE3] text-[#154212] px-2.5 py-1 rounded-md font-medium">
                      Transport: Flat ₹15/km vehicle trip
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendation.ranked_buyers?.map((b, idx) => (
                      <div key={b.buyer_id || b.name} className={`bg-white p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                        idx === 0 ? 'border-2 border-purple-600 shadow-md ring-2 ring-purple-100' : 'border-[#E8E2D9]'
                      }`}>
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold mr-2 ${
                                idx === 0 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                              }`}>
                                #{idx + 1} {idx === 0 ? 'Best Net Return' : 'Candidate'}
                              </span>
                              <h4 className="font-display-sm text-lg font-bold text-[#154212] inline">{b.name}</h4>
                            </div>
                            <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                              {b.match_score}% Fit
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#5B755D] mb-3">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">route</span>
                              <strong>{b.real_distance_km} km</strong> road driving
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              ~{b.estimated_travel_time_mins} mins
                            </span>
                            <span>•</span>
                            <span className="text-[10px] bg-[#FCFBF9] border px-1.5 py-0.5 rounded text-gray-600">
                              {b.distance_source?.includes('openrouteservice') ? 'ORS Road Matrix' : 'Haversine Route'}
                            </span>
                          </div>

                          {/* Net Price vs Headline Price Comparison Box */}
                          <div className="bg-[#FCFBF9] p-4 rounded-xl border border-[#E8E2D9] space-y-2 mb-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[#5B755D]">Buyer Headline Price:</span>
                              <span className="font-bold text-[#154212] text-sm">₹{b.price_offered_per_kg}/kg</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-red-700">
                              <span>Transport Cost ({b.real_distance_km} km @ ₹15/km):</span>
                              <span>-₹{b.transport_cost} (-₹{b.transport_cost_per_kg}/kg)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-red-700">
                              <span>Wastage Cost (Perishability):</span>
                              <span>-₹{b.wastage_cost}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#E8E2D9]">
                              <div>
                                <span className="text-xs font-bold text-[#5B755D] block uppercase">Net to Farmer:</span>
                                <span className="text-xs text-gray-500">Total Payout: <strong>{formatCurrency(b.net_payout)}</strong></span>
                              </div>
                              <span className="font-display-sm text-2xl font-bold text-purple-800">
                                ₹{b.net_price_per_kg}<span className="text-xs font-medium text-gray-500">/kg</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectBuyerOffer(b)}
                          className="w-full bg-[#154212] hover:bg-[#0E2C14] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">send</span>
                          Create Direct Offer to Buyer ({formatCurrency(b.net_payout)})
                        </button>
                      </div>
                    ))}
                    {(!recommendation.ranked_buyers || recommendation.ranked_buyers.length === 0) && (
                      <div className="col-span-full bg-white p-8 rounded-2xl border text-center text-[#5B755D]">
                        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">near_me_disabled</span>
                        <p className="font-bold">No buyers found within {cropInput.radius_km} km radius.</p>
                        <p className="text-xs mt-1">Try expanding your driving radius to 150 km or 250 km.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: All Ranked Mandis */}
              {activeTab === 'markets' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendation.all_markets?.map((m, idx) => (
                    <div key={m.market} className={`bg-white p-5 rounded-2xl border transition-all ${
                      idx === 0 ? 'border-2 border-green-600 shadow-md ring-2 ring-green-100' : 'border-[#E8E2D9]'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          idx === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          #{idx + 1} {idx === 0 ? 'Top Pick' : 'Alternative'}
                        </span>
                        <span className="text-xs text-[#5B755D] font-medium">{m.distance_km} km away</span>
                      </div>
                      <h4 className="font-display-sm text-lg font-bold text-[#154212]">{m.market}</h4>
                      <div className="mt-3 space-y-1.5 text-xs text-[#5B755D] border-t border-[#E8E2D9] pt-2">
                        <div className="flex justify-between">
                          <span>Mandi Gross Rate:</span>
                          <span className="font-bold text-[#154212]">₹{m.expected_price_per_kg}/kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transport Cost (₹15/km):</span>
                          <span className="text-red-700 font-medium">-₹{m.transport_cost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Perishability Loss ({m.spoilage_rate_pct}%):</span>
                          <span className="text-red-700 font-medium">-₹{m.wastage_cost}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-dashed border-[#E8E2D9] text-sm">
                          <span className="font-bold text-[#154212]">Net Farmer Profit:</span>
                          <span className="font-bold text-green-700">{formatCurrency(m.net_profit)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: 3-Day ML Price Forecast */}
              {activeTab === 'prediction' && (
                <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-display-sm text-lg font-bold text-[#154212]">
                        {recommendation.price_prediction?.crop} Price Forecast @ {recommendation.price_prediction?.market}
                      </h4>
                      <p className="text-xs text-[#5B755D]">
                        Model: {recommendation.price_prediction?.model_type} (MAE: ±₹{recommendation.price_prediction?.mae_accuracy_inr}/kg)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#5B755D] block">Current Spot Price</span>
                      <span className="text-xl font-bold text-[#154212]">₹{recommendation.price_prediction?.current_price}/kg</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {recommendation.price_prediction?.predicted_prices?.map(p => (
                      <div key={p.day} className="bg-[#FCFBF9] p-4 rounded-xl border border-[#E8E2D9] text-center">
                        <span className="text-xs font-bold text-[#5B755D] uppercase tracking-wider block">Day +{p.day} ({p.date})</span>
                        <p className="font-display-sm text-2xl font-bold text-[#154212] my-1">₹{p.predicted_price}/kg</p>
                        <span className="text-xs text-[#5B755D]">Confidence: ₹{p.confidence_range[0]} - ₹{p.confidence_range[1]}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-[#F7F4F0] rounded-xl text-sm font-medium text-[#154212] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2A6B25]">lightbulb</span>
                    <span>{recommendation.price_prediction?.trend_advice}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Confirmation & Publish Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end pt-2">
            <div className="lg:col-span-3">
              <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">
                {t('asking_price_per_kg') || 'Asking Price per kg (₹)'} <span className="text-xs normal-case text-gray-500">({t('auto_optimized') || 'Auto-optimized for highest net return'})</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={cropInput.price_per_kg}
                onChange={e => setCropInput({...cropInput, price_per_kg: e.target.value})}
                className="w-full p-4 border-2 border-[#154212] rounded-xl bg-white font-bold text-xl text-[#154212] outline-none"
              />
            </div>

            <div className="lg:col-span-1">
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full bg-[#154212] text-white py-4 rounded-xl font-label-lg font-bold hover:bg-[#0E2C14] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-75 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                    Publishing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">publish</span>
                    {t('publish_produce_lot') || 'Publish Produce Lot'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Available Published Lots */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display-sm text-2xl font-bold text-[#154212] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5B755D]">inventory_2</span> {t('my_active_lots') || 'My Active Lots'} ({lots.length})
          </h2>
          <button
            onClick={fetchLots}
            className="text-sm font-medium text-[#154212] hover:text-[#0E2C14] flex items-center gap-1 bg-[#EFEBE3] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span> {t('refresh') || 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map(lot => (
            <div key={lot.lot_id} className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display-sm text-xl font-bold text-[#154212] group-hover:text-[#2A6B25] transition-colors">{lot.crop}</h3>
                  <span className="bg-[#EFEBE3] text-[#154212] px-3 py-1 rounded-full font-label-sm font-bold tracking-wider">{lot.quality || 'Grade A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5B755D] mb-2">
                  <span className="material-symbols-outlined text-[18px]">scale</span>
                  <span className="font-body-md font-medium">{lot.quantity} kg available</span>
                </div>
                <div className="flex items-center gap-2 text-[#5B755D] mb-4 text-sm">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="truncate">{lot.location}</span>
                </div>
              </div>
              <div className="border-t border-[#E8E2D9] pt-4 mt-auto flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#5B755D] block uppercase font-bold tracking-wider">Rate</span>
                  <p className="font-display-sm text-2xl font-bold text-[#154212]">{formatCurrency(lot.price_per_kg)}<span className="font-body-sm text-[#5B755D] font-medium">/kg</span></p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  Active in Marketplace
                </span>
              </div>
            </div>
          ))}
          {lots.length === 0 && (
            <div className="col-span-full bg-[#FCFBF9] border border-dashed border-[#C6C0B5] rounded-2xl p-12 text-center text-[#5B755D]">
              <span className="material-symbols-outlined text-4xl mb-4 text-[#C6C0B5]">eco</span>
              <p className="font-body-lg">You haven't listed any crops yet.</p>
              <p className="font-body-sm mt-1">Use the recommendation tool above to list produce.</p>
            </div>
          )}
        </div>
      </section>

      {/* Orders & Escrow */}
      <section>
        <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#5B755D]">local_shipping</span> Active Orders & Escrow
        </h2>
        <div className="space-y-4">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-[#C6C0B5] transition-colors">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-full bg-[#EFEBE3] flex items-center justify-center text-[#154212] shrink-0">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h3 className="font-label-lg font-bold text-[#154212]">Order #{tx.id} ({formatCurrency(tx.price)})</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#154212]"></span>
                    <p className="text-[#5B755D] font-label-sm uppercase tracking-wider">Status: {tx.status} | Escrow: {tx.payment_status}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/payment-status')} className="w-full sm:w-auto text-[#154212] border border-[#E8E2D9] hover:bg-[#F7F4F0] px-6 py-2 rounded-lg font-label-md font-bold transition-colors">
                View Escrow Status
              </button>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="bg-[#FCFBF9] border border-[#E8E2D9] rounded-2xl p-8 text-center text-[#5B755D]">
              <p className="font-body-md">No active orders right now.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
