import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="page-container dark-theme">
      <nav className="navbar glass-card">
        <div className="logo">AgriConnect</div>
        <div className="nav-links">
          <button className="nav-btn active">{t('dashboard')}</button>
          <button className="nav-btn">{t('transactions')}</button>
          <button className="nav-btn" onClick={() => navigate('/select-language')}>
             🌐 {t('language')} ({i18n.language.toUpperCase()})
          </button>
        </div>
      </nav>
      
      <main className="main-content fade-in">
        <h1 className="title">{t('welcome')}!</h1>
        <p className="subtitle">{t('dashboard')}</p>
        
        <div className="card glass-card mt-6">
           <h2>{t('transactions')}</h2>
           {/* Placeholder for transactions */}
        </div>
      </main>
    </div>
  );
}
