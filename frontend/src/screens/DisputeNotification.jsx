import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DisputeNotification() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-[#BA1A1A] mb-4">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <span className="font-label-sm font-bold uppercase tracking-wider">{t('action_required') || 'Action Required'}</span>
        </div>
        <h1 className="font-display-md text-4xl font-bold text-[#154212]">{t('dispute_raised') || 'Dispute Notification'}</h1>
        <p className="font-body-lg text-[#5B755D] mt-2">A buyer has raised an issue with Delivery #DLV-8924. Please review the details below to respond.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white border border-[#E8E2D9] rounded-2xl p-8 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6">Delivery Details</h2>
            <ul className="space-y-6">
              <li className="flex flex-col">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-1">Buyer</span>
                <span className="font-body-lg font-bold text-[#154212]">Green Grocers Ltd.</span>
              </li>
              <li className="flex flex-col">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-1">Lot ID</span>
                <span className="font-body-lg font-bold text-[#154212]">#L-409 (Tomato Roma)</span>
              </li>
              <li className="flex flex-col">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider mb-1">Date Delivered</span>
                <span className="font-body-lg font-bold text-[#154212]">Oct 24, 2023</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-6 border-t border-[#E8E2D9]">
            <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider block mb-3">{t('payment_status') || 'Dispute Status'}</span>
            <span className="inline-block bg-[#FFDAD6] text-[#93000A] font-label-md font-bold px-4 py-2 rounded-lg border border-[#BA1A1A]">{t('under_review') || 'Pending Review'}</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
          <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center">
            <span className="material-symbols-outlined mr-3 text-[#2A6B25]">description</span>
            {t('claim_details') || "Buyer's Notes"}
          </h2>
          <div className="bg-[#FCFBF9] p-6 rounded-xl border border-[#E8E2D9]">
            <p className="font-body-lg text-[#334D35] italic leading-relaxed">"The delivery was received on time, but upon inspection, approximately 15% of the produce was damaged due to moisture and crushing in transit. Requesting a partial refund for the damaged goods."</p>
          </div>
          <div className="mt-8">
            <h3 className="font-label-sm font-bold uppercase tracking-wider text-[#5B755D] mb-4">Reported Damage</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-[#EFEBE3] px-4 py-2 rounded-lg border border-[#E8E2D9]">
                <span className="material-symbols-outlined text-[#154212]">inventory_2</span>
                <span className="font-label-md font-bold text-[#154212]">15% Quantity</span>
              </div>
              <div className="flex items-center space-x-2 bg-[#FFDAD6] px-4 py-2 rounded-lg border border-[#BA1A1A]">
                <span className="material-symbols-outlined text-[#BA1A1A]">water_drop</span>
                <span className="font-label-md font-bold text-[#93000A]">Moisture/Crush</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm">
          <h2 className="font-display-sm text-2xl font-bold text-[#154212] mb-6">Evidence Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <img alt="Evidence 1" className="w-full h-40 object-cover rounded-xl border-2 border-[#E8E2D9] hover:border-[#154212] cursor-pointer transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLyPu7hdyB2X3g1NP6IFO61VIXDabMZ99n0mH26QlMf3S42DolVMkWpWIN8E2u25FDoep-WIAzgFblr1clOB-vFkByUCKiBhjpZkT5DAilsXbrVzgPptxagxXq-LV9oj-nlrIysfb_IMr7iYFDyzk3hiXkoqjQCVFzERoC_hUzWU3zYbTDC9aDLlkH3MkYjXSEl9yH6cKQB0qc57VIw9TgUaI_C1H1ngnhQyHJZlYh2i7eZ0VnzHbM" />
            <img alt="Evidence 2" className="w-full h-40 object-cover rounded-xl border-2 border-[#E8E2D9] hover:border-[#154212] cursor-pointer transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqzzAANCGDDg5tMCn6p4rFQLWr9bhfxA-8zSsqNBSI85wY8ulgzsABV4fGmOvMHTb8a-3PcuLepg7Ywd0852G4BHdh0ij0t5ia1YmOF4li8ZCmBvDXbH_Nt2v810yXB1mMgYEtGfoehBBsTcsQCr9IH5DVlxLWBxjsb7zgckBRgkRR3PxVPbxVY3IUzffONQwH5rpsQkrGa4Y3j1rRMf5z8d8W-iTTrf54t7asvYum-fHpqQg63zUh" />
            <div className="w-full h-40 bg-[#FCFBF9] rounded-xl border-2 border-[#E8E2D9] flex flex-col items-center justify-center cursor-pointer hover:bg-[#F7F4F0] hover:border-[#154212] transition-colors group">
              <span className="material-symbols-outlined text-[#C6C0B5] group-hover:text-[#154212] text-[32px] mb-2">add_photo_alternate</span>
              <span className="font-label-sm font-bold text-[#5B755D] group-hover:text-[#154212]">View photos</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 mt-4 flex justify-end space-x-4">
          <button className="px-8 py-4 rounded-xl bg-white border-2 border-[#154212] text-[#154212] font-label-lg font-bold hover:bg-[#F7F4F0] transition-colors flex items-center justify-center">
            {t('contact_farmer') || 'Contact Buyer'}
          </button>
          <button onClick={() => navigate('/admin-resolution')} className="px-8 py-4 rounded-xl bg-[#154212] text-white font-label-lg font-bold hover:bg-[#0E2C14] transition-colors shadow-md flex items-center justify-center">
            <span className="material-symbols-outlined mr-2 text-[20px]">reply</span>
            Respond to Dispute
          </button>
        </div>
      </div>
    </div>
  );
}
