import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../apiConfig';
import { getCropMedia } from '../utils/cropImages';

export default function RejectionFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { t } = useTranslation('common');
  
  const passedTxId = location.state?.txId || 1;
  const passedLot = location.state?.lot || {
    crop: 'Green Chilli',
    quantity: 1200,
    lot_id: '8472-A'
  };

  const cropMedia = getCropMedia(passedLot.crop);

  const [txId] = useState(passedTxId);
  const [reason, setReason] = useState('spoilage');
  const [totalQty] = useState(passedLot.quantity || 1200);
  const [rejectedQty, setRejectedQty] = useState(Math.min(300, Math.round((passedLot.quantity || 1200) * 0.15)));
  const [description, setDescription] = useState(`Produce (${passedLot.crop}) arrived showing transit damage/blemishes.`);
  const [photos, setPhotos] = useState([cropMedia.detail1 || cropMedia.primary]);
  const [loading, setLoading] = useState(false);

  const acceptedQty = Math.max(0, totalQty - rejectedQty);
  const acceptedPercent = Math.round((acceptedQty / totalQty) * 100);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/uploads/dispute-evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos([...photos, data.url || URL.createObjectURL(file)]);
      }
    } catch (err) {
      setPhotos([...photos, URL.createObjectURL(file)]);
    }
  };

  const handleReject = async () => {
    if ((reason === 'quality_mismatch' || reason === 'spoilage') && photos.length === 0) {
      alert('Please upload at least one photo for quality mismatch or spoilage.');
      return;
    }
    if (rejectedQty > totalQty) {
      alert(`Rejected quantity cannot exceed total delivered quantity (${totalQty}kg).`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${txId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: reason,
          description: description,
          rejected_quantity_kg: parseFloat(rejectedQty),
          photo_urls: photos
        })
      });
      setLoading(false);
      
      if (res.ok) {
        navigate('/dispute-notification', { state: { lot: passedLot, txId } });
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to submit rejection");
      }
    } catch (e) {
      setLoading(false);
      navigate('/dispute-notification', { state: { lot: passedLot, txId } });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-[#5B755D] mb-4 cursor-pointer hover:text-[#154212] transition-colors w-fit" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-lg font-bold">{t('back_to_lots') || 'Back to Review'}</span>
          </div>
          <h2 className="font-display-md text-4xl font-bold text-[#154212]">{t('reject') || 'Report Rejection'}</h2>
          <p className="font-body-lg text-[#5B755D] mt-2">
            Document issues with the incoming delivery for {passedLot.crop} (Lot #{passedLot.lot_id?.slice(-8) || '8472-A'}).
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BA1A1A]">error</span>
              Primary Reason
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="cursor-pointer group">
                <input 
                  className="peer sr-only" 
                  name="reason" 
                  type="radio" 
                  checked={reason === 'quality_mismatch'}
                  onChange={() => setReason('quality_mismatch')}
                />
                <div className="border-2 border-[#E8E2D9] rounded-xl p-4 text-center peer-checked:border-[#BA1A1A] peer-checked:bg-[#FFDAD6] peer-checked:text-[#BA1A1A] transition-all hover:bg-[#FCFBF9]">
                  <span className="material-symbols-outlined block mb-2 mx-auto text-[#5B755D] group-hover:text-[#154212] peer-checked:text-[#BA1A1A]">pest_control</span>
                  <span className="font-label-md font-bold text-[#334D35] group-hover:text-[#154212] peer-checked:text-[#BA1A1A]">{t('quality_mismatch') || 'Quality'}</span>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input 
                  className="peer sr-only" 
                  name="reason" 
                  type="radio" 
                  checked={reason === 'spoilage'}
                  onChange={() => setReason('spoilage')}
                />
                <div className="border-2 border-[#E8E2D9] rounded-xl p-4 text-center peer-checked:border-[#BA1A1A] peer-checked:bg-[#FFDAD6] peer-checked:text-[#BA1A1A] transition-all hover:bg-[#FCFBF9]">
                  <span className="material-symbols-outlined block mb-2 mx-auto text-[#5B755D] group-hover:text-[#154212] peer-checked:text-[#BA1A1A]">water_drop</span>
                  <span className="font-label-md font-bold text-[#334D35] group-hover:text-[#154212] peer-checked:text-[#BA1A1A]">{t('spoilage') || 'Spoilage'}</span>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input 
                  className="peer sr-only" 
                  name="reason" 
                  type="radio" 
                  checked={reason === 'quantity_mismatch'}
                  onChange={() => setReason('quantity_mismatch')}
                />
                <div className="border-2 border-[#E8E2D9] rounded-xl p-4 text-center peer-checked:border-[#BA1A1A] peer-checked:bg-[#FFDAD6] peer-checked:text-[#BA1A1A] transition-all hover:bg-[#FCFBF9]">
                  <span className="material-symbols-outlined block mb-2 mx-auto text-[#5B755D] group-hover:text-[#154212] peer-checked:text-[#BA1A1A]">scale</span>
                  <span className="font-label-md font-bold text-[#334D35] group-hover:text-[#154212] peer-checked:text-[#BA1A1A]">{t('quantity_mismatch') || 'Quantity'}</span>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input 
                  className="peer sr-only" 
                  name="reason" 
                  type="radio" 
                  checked={reason === 'other'}
                  onChange={() => setReason('other')}
                />
                <div className="border-2 border-[#E8E2D9] rounded-xl p-4 text-center peer-checked:border-[#BA1A1A] peer-checked:bg-[#FFDAD6] peer-checked:text-[#BA1A1A] transition-all hover:bg-[#FCFBF9]">
                  <span className="material-symbols-outlined block mb-2 mx-auto text-[#5B755D] group-hover:text-[#154212] peer-checked:text-[#BA1A1A]">more_horiz</span>
                  <span className="font-label-md font-bold text-[#334D35] group-hover:text-[#154212] peer-checked:text-[#BA1A1A]">{t('other') || 'Other'}</span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#154212]">pie_chart</span>
              Quantity Split
            </h3>
            <p className="font-body-lg text-[#5B755D] mb-8">Total Delivery: <strong className="text-[#154212]">{totalQty} kg</strong></p>
            
            <div className="relative h-14 w-full bg-[#FFDAD6] rounded-xl overflow-hidden flex mb-8 border border-[#E8E2D9]">
              <div className="bg-[#154212] h-full transition-all duration-300 flex items-center px-5" style={{width: `${acceptedPercent}%`}}>
                <span className="font-label-lg font-bold text-white">Accepted ({acceptedQty}kg)</span>
              </div>
              <div className="flex-1 h-full bg-[#BA1A1A] flex items-center justify-end px-5 transition-all duration-300">
                <span className="font-label-lg font-bold text-white">Rejected ({rejectedQty}kg)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-2">Accepted Quantity (kg)</label>
                <input 
                  className="w-full bg-[#FCFBF9] border-2 border-[#E8E2D9] focus:bg-white focus:border-[#154212] text-[#154212] font-bold text-lg p-4 outline-none rounded-xl transition-colors" 
                  type="number" 
                  value={acceptedQty}
                  onChange={(e) => setRejectedQty(Math.max(0, totalQty - parseFloat(e.target.value || 0)))}
                />
              </div>
              <div>
                <label className="block font-label-sm font-bold text-[#BA1A1A] uppercase tracking-wider mb-2">Rejected Quantity (kg)</label>
                <input 
                  className="w-full bg-[#FFDAD6] border-2 border-[#BA1A1A] focus:border-[#93000A] text-[#93000A] font-bold text-lg p-4 outline-none rounded-xl transition-colors" 
                  type="number" 
                  value={rejectedQty}
                  onChange={(e) => setRejectedQty(parseFloat(e.target.value || 0))}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm flex-1">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#154212]">add_a_photo</span>
              Evidence
            </h3>
            <p className="font-body-md text-[#5B755D] mb-6">Upload photos of the spoiled goods.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D9] group">
                  <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))} 
                    className="absolute top-2 right-2 bg-white/90 text-[#BA1A1A] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-[#E8E2D9] hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-[#C6C0B5] hover:border-[#154212] hover:bg-[#F7F4F0] flex flex-col items-center justify-center gap-3 text-[#5B755D] hover:text-[#154212] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-4xl">upload</span>
                <span className="font-label-md font-bold">Add Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <div className="mt-8">
              <label className="block font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-2">Additional Notes</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#FCFBF9] border-2 border-[#E8E2D9] focus:bg-white focus:border-[#154212] text-[#334D35] font-body-md p-4 rounded-xl outline-none min-h-[140px] resize-none transition-colors" 
                placeholder="Describe the severity of the spoilage..."
              ></textarea>
            </div>
          </div>
          
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col gap-4">
              <button disabled={loading} onClick={handleReject} className="w-full bg-[#BA1A1A] text-white font-label-lg font-bold py-4 rounded-xl shadow-md hover:bg-[#93000A] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined">assignment_returned</span>
                {loading ? 'Submitting...' : 'Confirm Rejection'}
              </button>
              <button onClick={() => navigate(-1)} className="w-full bg-white border-2 border-[#E8E2D9] text-[#5B755D] font-label-lg font-bold py-4 rounded-xl hover:bg-[#F7F4F0] hover:text-[#154212] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
