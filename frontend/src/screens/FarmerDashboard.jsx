import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';

export default function FarmerDashboard() {
  const { user, token } = useAuth();
  const { t } = useTranslation('common');
  const [lots, setLots] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newLot, setNewLot] = useState({ crop: '', quantity: '', price_per_kg: '', quality: 'Grade A', location: 'Oddanchatram, Tamil Nadu' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLots();
    fetchTransactions();
  }, []);

  const fetchLots = async () => {
    try {
      const res = await fetch('http://localhost:8000/lots', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLots(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:8000/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTransactions(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/lots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          crop: newLot.crop,
          quantity: parseFloat(newLot.quantity),
          price_per_kg: parseFloat(newLot.price_per_kg),
          quality: newLot.quality,
          location: newLot.location
        })
      });
      if (res.ok) {
        setNewLot({ crop: '', quantity: '', price_per_kg: '', quality: 'Grade A', location: 'Oddanchatram, Tamil Nadu' });
        fetchLots();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display-md text-4xl font-bold text-[#154212] mb-2">Farmer Dashboard</h1>
          <p className="font-body-md text-[#5B755D]">Manage your crops, list new lots in Tamil Nadu, and track active orders.</p>
        </div>
      </div>
      
      <section className="bg-white p-8 rounded-2xl border border-[#E8E2D9] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#EFEBE3] flex items-center justify-center text-[#154212]">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
          </div>
          <h2 className="font-display-sm text-2xl font-bold text-[#154212]">List a new Crop / Lot</h2>
        </div>
        <form onSubmit={handleCreateLot} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="w-full">
            <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">{t('crop_type') || 'Crop Name'}</label>
            <input required placeholder="e.g. Tomato (Roma)" value={newLot.crop} onChange={e => setNewLot({...newLot, crop: e.target.value})} className="w-full p-4 border border-[#E8E2D9] rounded-xl bg-[#FCFBF9] focus:bg-white focus:border-[#154212] outline-none transition-colors text-[#154212] font-medium" />
          </div>
          <div className="w-full">
            <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">{t('quantity') || 'Quantity (kg)'}</label>
            <input type="number" placeholder="500" required value={newLot.quantity} onChange={e => setNewLot({...newLot, quantity: e.target.value})} className="w-full p-4 border border-[#E8E2D9] rounded-xl bg-[#FCFBF9] focus:bg-white focus:border-[#154212] outline-none transition-colors text-[#154212] font-medium" />
          </div>
          <div className="w-full">
            <label className="block font-label-sm font-bold uppercase tracking-wider mb-2 text-[#5B755D]">{t('base_rate') || 'Price per kg (₹)'}</label>
            <input type="number" step="0.5" placeholder="28.00" required value={newLot.price_per_kg} onChange={e => setNewLot({...newLot, price_per_kg: e.target.value})} className="w-full p-4 border border-[#E8E2D9] rounded-xl bg-[#FCFBF9] focus:bg-white focus:border-[#154212] outline-none transition-colors text-[#154212] font-medium" />
          </div>
          <button type="submit" className="w-full bg-[#154212] text-white px-8 py-4 rounded-xl font-label-lg font-bold hover:bg-[#0E2C14] transition-colors flex items-center justify-center gap-2">
            Publish Lot
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#5B755D]">inventory_2</span> Available Lots
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map(lot => (
            <div key={lot.lot_id} className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display-sm text-xl font-bold text-[#154212] group-hover:text-[#2A6B25] transition-colors">{lot.crop}</h3>
                  <span className="bg-[#EFEBE3] text-[#154212] px-3 py-1 rounded-full font-label-sm font-bold tracking-wider">{lot.quality || 'Grade A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5B755D] mb-4">
                  <span className="material-symbols-outlined text-[18px]">scale</span>
                  <span className="font-body-md font-medium">{lot.quantity} kg available</span>
                </div>
              </div>
              <div className="border-t border-[#E8E2D9] pt-4 mt-auto">
                <p className="font-display-sm text-2xl font-bold text-[#154212]">{formatCurrency(lot.price_per_kg)}<span className="font-body-sm text-[#5B755D] font-medium">/kg</span></p>
              </div>
            </div>
          ))}
          {lots.length === 0 && (
            <div className="col-span-full bg-[#FCFBF9] border border-dashed border-[#C6C0B5] rounded-2xl p-12 text-center text-[#5B755D]">
              <span className="material-symbols-outlined text-4xl mb-4 text-[#C6C0B5]">eco</span>
              <p className="font-body-lg">You haven't listed any crops yet.</p>
              <p className="font-body-sm mt-1">Use the form above to get started.</p>
            </div>
          )}
        </div>
      </section>

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
