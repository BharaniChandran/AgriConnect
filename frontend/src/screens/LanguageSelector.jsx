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
    navigate('/buyer-review');
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-8 max-w-md w-full shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container text-primary mb-6 shadow-sm border border-primary-fixed-dim">
          <span className="material-symbols-outlined text-4xl">language</span>
        </div>
        <h1 className="font-display-lg text-primary mb-2">AgriConnect</h1>
        <p className="font-body-lg text-on-surface-variant mb-8">{t('select_language') || 'Select your language'}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {languages.map((lng) => (
            <button
              key={lng.code}
              onClick={() => handleSelect(lng.code)}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                selected === lng.code
                  ? 'border-primary bg-primary-container text-on-primary-container'
                  : 'border-outline-variant hover:border-primary text-on-surface'
              }`}
            >
              <span className="font-headline-md">{lng.native}</span>
              <span className="font-label-md opacity-70">{lng.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-4 rounded-full hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all"
        >
          {t('continue') || 'Continue'}
        </button>
      </div>
    </div>
  );
}
