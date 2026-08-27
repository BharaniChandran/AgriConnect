import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();

  const changeLang = () => {
    navigate('/language');
  };

  const getLangName = (code) => {
    const map = { en: 'English (US)', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam' };
    return map[code] || 'English (US)';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display-md text-4xl font-bold text-[#154212]">{t('settings')}</h1>
        <p className="font-body-lg text-[#5B755D] mt-2">{t('manage_account')}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 lg:col-span-4 flex flex-col">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-8 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display-sm text-2xl font-bold text-[#154212]">{t('language')}</h2>
              <span className="material-symbols-outlined text-[#2A6B25] text-[28px]">translate</span>
            </div>
            <div className="flex-grow flex flex-col justify-center items-center py-10 bg-[#FCFBF9] rounded-xl border border-[#E8E2D9] mb-8">
              <div className="text-center">
                <span className="font-display-md text-5xl font-bold text-[#154212] block mb-3 uppercase tracking-widest">{i18n.language}</span>
                <span className="font-label-lg font-bold text-[#5B755D]">{getLangName(i18n.language)}</span>
              </div>
            </div>
            <button onClick={changeLang} className="w-full bg-[#154212] text-white font-label-lg font-bold py-4 rounded-xl shadow-md hover:bg-[#0E2C14] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-auto">
              <span className="material-symbols-outlined text-[20px]">edit</span>
              <span>{t('change_language')}</span>
            </button>
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-8 space-y-8">
          <section className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-8 py-6 bg-[#FCFBF9] border-b border-[#E8E2D9]">
              <h3 className="font-display-sm text-xl font-bold text-[#154212]">{t('account_preferences')}</h3>
            </div>
            <div className="divide-y divide-[#E8E2D9]">
              <a className="flex items-center justify-between p-8 hover:bg-[#FCFBF9] transition-colors duration-200 group" href="#">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 rounded-full bg-[#EFEBE3] flex items-center justify-center text-[#154212] group-hover:bg-[#154212] group-hover:text-white transition-colors duration-200 border-2 border-[#154212] group-hover:border-transparent">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg font-bold text-[#154212]">{t('personal_info')}</h4>
                    <p className="font-body-sm text-[#5B755D] mt-1">Update your name, email, and phone number</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#C6C0B5] group-hover:text-[#154212] transition-colors duration-200">chevron_right</span>
              </a>
              <a className="flex items-center justify-between p-8 hover:bg-[#FCFBF9] transition-colors duration-200 group" href="#">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 rounded-full bg-[#EFEBE3] flex items-center justify-center text-[#154212] group-hover:bg-[#154212] group-hover:text-white transition-colors duration-200 border-2 border-[#154212] group-hover:border-transparent">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg font-bold text-[#154212]">{t('security')}</h4>
                    <p className="font-body-sm text-[#5B755D] mt-1">Manage password and two-factor authentication</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#C6C0B5] group-hover:text-[#154212] transition-colors duration-200">chevron_right</span>
              </a>
            </div>
          </section>
          <section className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-8 py-6 bg-[#FCFBF9] border-b border-[#E8E2D9]">
              <h3 className="font-display-sm text-xl font-bold text-[#154212]">{t('notifications')}</h3>
            </div>
            <div className="divide-y divide-[#E8E2D9]">
              <div className="flex items-center justify-between p-8">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 rounded-full bg-[#EFEBE3] flex items-center justify-center text-[#154212] border-2 border-[#154212]">
                    <span className="material-symbols-outlined">notifications_active</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg font-bold text-[#154212]">{t('push_notifications')}</h4>
                    <p className="font-body-sm text-[#5B755D] mt-1">Receive alerts on your device</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" type="checkbox" defaultChecked />
                  <div className="w-12 h-6 bg-[#C6C0B5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8E2D9] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154212]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-8">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 rounded-full bg-[#EFEBE3] flex items-center justify-center text-[#154212] border-2 border-[#154212]">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg font-bold text-[#154212]">{t('email_updates')}</h4>
                    <p className="font-body-sm text-[#5B755D] mt-1">Weekly summaries and important alerts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" type="checkbox" />
                  <div className="w-12 h-6 bg-[#C6C0B5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8E2D9] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#154212]"></div>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
