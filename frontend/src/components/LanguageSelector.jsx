import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './LanguageSelector.css';

const LANGUAGES = [
  { code: 'en', label: 'English', localLabel: 'English' },
  { code: 'hi', label: 'Hindi', localLabel: 'हिंदी' },
  { code: 'ta', label: 'Tamil', localLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', localLabel: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', localLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', localLabel: 'മലയാളം' }
];

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageSelect = (code) => {
    i18n.changeLanguage(code);
  };

  const handleContinue = () => {
    // In a real app, this would also hit a backend endpoint to update preferred_language
    navigate('/dashboard');
  };

  return (
    <div className="page-container flex-center dark-theme">
      <div className="card glass-card fade-in">
        <h1 className="title">{t('welcome')}</h1>
        <p className="subtitle">{t('select_language')}</p>
        
        <div className="language-grid">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageSelect(lang.code)}
            >
              <span className="lang-local">{lang.localLabel}</span>
              <span className="lang-en">{lang.label}</span>
            </button>
          ))}
        </div>

        <button className="primary-btn mt-6" onClick={handleContinue}>
          {t('continue')}
        </button>
      </div>
    </div>
  );
}
