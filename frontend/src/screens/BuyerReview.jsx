import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';

export default function BuyerReview() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="flex items-center gap-2 text-[#5B755D] mb-4 cursor-pointer hover:text-[#154212] transition-colors w-fit" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-lg font-bold">{t('back_to_lots') || 'Back to Lots'}</span>
          </div>
          <h2 className="font-display-md text-4xl font-bold text-[#154212]">{t('buyer_review_title') || 'Review Lot'} #4829</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/rejection-flow')} className="px-8 py-3.5 rounded-xl border-2 border-[#BA1A1A] text-[#BA1A1A] font-label-lg font-bold hover:bg-[#FFDAD6] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">close</span>
            {t('reject') || 'Reject'}
          </button>
          <button onClick={() => navigate('/lot-confirmation')} className="px-10 py-3.5 rounded-xl bg-[#154212] text-white font-label-lg font-bold hover:bg-[#0E2C14] transition-colors shadow-md flex items-center gap-2">
            <span className="material-symbols-outlined">check</span>
            {t('accept_lot') || 'Accept Lot'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4 bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-sm">
            <div className="col-span-2 h-72 rounded-xl overflow-hidden bg-[#FCFBF9] relative border border-[#E8E2D9]">
              <img alt="Arrival Photo" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkYZNbffaBrwxwVRDZg-7hI6OJL0Bthw5JEbzJn-J-L7k_9dBH37B6-7FxXqXvrc0fB-HdJpRQe8n8QgZ-aj2lyE-DOBIOY1HK3o18hGRTz4OTdHdfPInyX0peOZUWaeWFQDRLVEa_xRcwgC-r2cMztZNopcyp-O-5mUJgKZ86zLa3T45AkshrrYrtXQ3qtNIuCE2UNcILrsdYJTL88L7VTkn1dAbZQVNarBPsTEA_nVU_TEXHrFLT" />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E8E2D9] flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[#154212] text-sm">photo_camera</span>
                <span className="font-label-md font-bold text-[#154212]">Arrival Photo</span>
              </div>
            </div>
            <div className="col-span-1 flex flex-col gap-4">
              <div className="h-full flex-1 rounded-xl overflow-hidden bg-[#FCFBF9] border border-[#E8E2D9]">
                <img alt="Lot Detail 1" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrjQXJ_xMIpbN8tv7LD0efLkpTBCVnVzSefoIlS_kJ-6CK0j_IeUvCHxtZL9jkmieYHsyRqT9-n1N4qJ1nTrmwNA_4wj2Se4rFjGDAZPox-S3ZZmjbWyv75RiQbhJtSk4a9tjtl2HdPvtDjVos0U1kiS8NZf2E0H35Q_1NI7MG-nEPPPMbGqVXjlToPm_CLvUmXepM80RoQ1zFWFmXgujNGE_4vrZ2MhGIDwIPfoxkOwqa9rOscS9B" />
              </div>
              <div className="h-full flex-1 rounded-xl overflow-hidden bg-[#FCFBF9] border border-[#E8E2D9]">
                <img alt="Lot Detail 2" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNwtUXL8D9OHcHdVj2KpOHAL_gfWvC9NAJBPyybELGh5SC-uqyb235May1h-5jvTRQP4ldmkTL7fobdV61T8HBjeXg684dAloABDpbNSMvc9XrcXYCNw70lVN6OciGz1UHurTw8egxnHUZu8r3RV3aPzki68R6QQL-GtS34fhU1N9h8HXkQY6FFEVmSO9M-R7qorJhglWNRovzW6SVchmbSFqC0l-oUAYnWiw7B6NYq18dXyTn3m9d" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E8E2D9] shadow-sm">
            <h3 className="font-display-sm text-2xl font-bold text-[#154212] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5B755D]">verified</span>
              {t('quality_specs') || 'Quality Specifications'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('variety') || 'Variety'}</span>
                <span className="font-body-lg font-medium text-[#154212]">Roma</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('grade') || 'Grade'}</span>
                <span className="font-body-lg text-[#154212] font-bold">Grade A</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('total_weight') || 'Total Weight'}</span>
                <span className="font-body-lg font-medium text-[#154212]">1,250 kg</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('bags_crates') || 'Bags/Crates'}</span>
                <span className="font-body-lg font-medium text-[#154212]">50 Crates</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#E8E2D9]">
              <h4 className="font-label-md font-bold text-[#154212] mb-3">{t('inspection_notes') || 'Inspection Notes'}</h4>
              <p className="font-body-md text-[#334D35] bg-[#FCFBF9] p-4 rounded-xl border border-[#E8E2D9] leading-relaxed">Visual inspection confirms uniform color and size. Moisture levels are within acceptable parameters (12%). Minor surface blemishes noted on approx 2% of yield, well within Grade A tolerance.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#EFEBE3] border-2 border-[#154212] overflow-hidden">
                  <img alt="Farmer" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL-uNYLIcO-e-1MVxvUuRhT0ZsCygC7uaup3ufXUa3se4B-xfKLl7xR2CCGC5Zy8Ntm4N6URETxduREQkNqRHyujiKxqGWoqJYTiN9Q1BRPFIgk__jvY6M-n-Vm-84RQP76NH20wYIU4PbUlQurYzYtTXSjnf8zxRQtfNpxsQo03M5mUF8K0ok0Plq7lcNcceoY5czZG0-Pu7KI11vuAahYYsHrSm2XSEFAzJ8vxUMqAYgoo215AJ4" />
                </div>
                <div>
                  <h3 className="font-display-sm text-xl font-bold text-[#154212]">Ram Singh</h3>
                  <p className="font-body-sm font-medium text-[#5B755D] flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Dindigul, Tamil Nadu
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1.5 bg-[#EFEBE3] rounded-md text-label-sm font-bold text-[#154212] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#2A6B25]">star</span> 4.8 Rating
              </span>
              <span className="px-3 py-1.5 bg-[#EFEBE3] rounded-md text-label-sm font-bold text-[#154212]">
                Premium Partner
              </span>
            </div>
            <button className="w-full py-3.5 rounded-xl border-2 border-[#154212] text-[#154212] font-label-lg font-bold hover:bg-[#F7F4F0] transition-colors flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              {t('contact_farmer') || 'Contact Farmer'}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-sm flex-1">
            <h3 className="font-display-sm text-xl font-bold text-[#154212] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5B755D]">local_shipping</span>
              {t('logistics') || 'Logistics'}
            </h3>
            <div className="relative pl-6 border-l-2 border-[#E8E2D9] flex flex-col gap-6 ml-2">
              <div className="relative">
                <div className="absolute w-3 h-3 bg-[#154212] rounded-full -left-[1.75rem] top-1"></div>
                <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('dispatched') || 'Dispatched'}</p>
                <p className="font-body-sm font-medium text-[#154212] mt-1">Oct 24, 06:00 AM</p>
              </div>
              <div className="relative">
                <div className="absolute w-3 h-3 bg-[#2A6B25] rounded-full -left-[1.75rem] top-1"></div>
                <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('arrived_depot') || 'Arrived at Depot'}</p>
                <p className="font-body-sm font-bold text-[#154212] mt-1">Oct 24, 11:30 AM</p>
              </div>
              <div className="relative opacity-60">
                <div className="absolute w-3 h-3 bg-[#E8E2D9] rounded-full -left-[1.75rem] top-1 border-2 border-white"></div>
                <p className="font-label-sm font-bold text-[#5B755D] uppercase tracking-wider">{t('payment_cleared') || 'Payment Cleared'}</p>
                <p className="font-body-sm font-medium text-[#334D35] mt-1">Pending Acceptance</p>
              </div>
            </div>
            <div className="mt-8 bg-[#FCFBF9] p-5 rounded-xl border border-[#E8E2D9]">
              <div className="flex justify-between items-center mb-3">
                <span className="font-label-md font-bold text-[#154212]">Market Price Match</span>
                <span className="font-label-md font-bold text-[#2A6B25] flex items-center gap-1 bg-[#EFEBE3] px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span> +2%
                </span>
              </div>
              <div className="w-full bg-[#E8E2D9] rounded-full h-2">
                <div className="bg-[#154212] h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
