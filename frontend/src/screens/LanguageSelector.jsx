import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation('common');
  const [selected, setSelected] = useState(i18n.language || 'en');
  const navigate = useNavigate();

  const handleSelect = (code) => {
    setSelected(code);
    i18n.changeLanguage(code);
  };

  const handleContinue = () => {
    localStorage.setItem('agriconnect_lang_set', 'true');
    navigate('/');
  };

  return (
    <div className="bg-[#F7F4F0] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8E2D9] rounded-3xl p-10 max-w-lg w-full shadow-lg text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FCFBF9] text-[#154212] mb-8 shadow-sm border-2 border-[#154212]">
          <span className="material-symbols-outlined text-[40px]">language</span>
        </div>
        <h1 className="font-display-md text-5xl font-bold text-[#154212] mb-4 tracking-tight">AgriConnect</h1>
        <p className="font-body-lg text-[#5B755D] mb-10 text-xl">{t('select_language') || 'Select your language'}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          {languages.map((lng) => (
            <button
              key={lng.code}
              onClick={() => handleSelect(lng.code)}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                selected === lng.code
                  ? 'border-[#154212] bg-[#F7F4F0] text-[#154212] shadow-sm transform scale-[1.02]'
                  : 'border-[#E8E2D9] hover:border-[#154212] hover:bg-[#FCFBF9] text-[#334D35]'
              }`}
            >
              <span className="font-display-sm text-2xl font-bold">{lng.native}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-[#154212] text-white font-label-lg font-bold text-xl py-5 rounded-2xl shadow-md hover:bg-[#0E2C14] active:scale-[0.98] transition-all"
        >
          {t('continue') || 'Continue'}
        </button>
      </div>
    </div>
  );
}
