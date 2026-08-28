import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Layout({ children }) {
  const { user, login, logout } = useAuth();
  const { i18n, t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('agriconnect_lang_set', 'true');
  };

  const switchRole = async (targetRole) => {
    if (targetRole === 'farmer') {
      await login('+919822123456', 'password123');
      navigate('/');
    } else if (targetRole === 'buyer') {
      await login('+919820012345', 'password123');
      navigate('/');
    } else if (targetRole === 'admin') {
      await login('+919999999999', 'admin123');
      navigate('/admin-resolution');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9] text-[#154212] font-body-md font-medium">
      
      {/* Full Width Top Header */}
      <header className="px-4 md:px-8 py-3.5 bg-[#F7F4F0] shrink-0 border-b border-[#E8E2D9] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div 
              className="flex items-center gap-2.5 cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-[#154212] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">energy_savings_leaf</span>
              </div>
              <div>
                <span className="font-display-sm text-[22px] font-bold tracking-tight text-[#154212] block leading-tight">AgriConnect</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#5B755D] block">Maharashtra APMC Pilot</span>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={() => handleLanguageChange(i18n.language === 'mr' ? 'en' : 'mr')}
                className="px-2.5 py-1 text-xs font-bold bg-[#EFEBE3] text-[#154212] rounded-lg border border-[#E8E2D9]"
              >
                {i18n.language === 'mr' ? 'English' : 'मराठी'}
              </button>
              <button onClick={handleLogout} className="p-1 text-[#5B755D]">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
          
          {/* Navigation Links according to role */}
          <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 text-sm font-semibold">
            {user?.role === 'farmer' && (
              <>
                <Link 
                  to="/" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>{t('nav_home') || 'Farmer Dashboard'}</span>
                </Link>
                <Link 
                  to="/lot-confirmation" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/lot-confirmation' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Lot Confirmation</span>
                </Link>
                <Link 
                  to="/payment-status" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/payment-status' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  <span>{t('nav_payments') || 'Escrow Payments'}</span>
                </Link>
              </>
            )}

            {user?.role === 'buyer' && (
              <>
                <Link 
                  to="/" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  <span>{t('nav_lots') || 'Marketplace'}</span>
                </Link>
                <Link 
                  to="/buyer-review" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/buyer-review' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                  <span>{t('buyer_review_title') || 'Review Delivery'}</span>
                </Link>
                <Link 
                  to="/rejection-flow" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/rejection-flow' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">report_problem</span>
                  <span>Dispute Produce</span>
                </Link>
                <Link 
                  to="/payment-status" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/payment-status' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  <span>{t('nav_payments') || 'Payment Status'}</span>
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link 
                  to="/admin-resolution" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/admin-resolution' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  <span>Resolution Center</span>
                </Link>
                <Link 
                  to="/payment-status" 
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname === '/payment-status' 
                      ? 'bg-[#154212] text-white shadow-sm' 
                      : 'text-[#334D35] hover:bg-[#EFEBE3]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  <span>Escrow & Payments</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Header: Switch Role, Language Pill & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Quick Role Switcher Pill for Testing */}
            <div className="flex items-center bg-[#EFEBE3] p-1 rounded-xl border border-[#E8E2D9] text-xs font-bold">
              <span className="px-2 text-[#5B755D] text-[11px] uppercase tracking-wider">Role:</span>
              <button 
                onClick={() => switchRole('farmer')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${user?.role === 'farmer' ? 'bg-[#154212] text-white' : 'text-[#334D35] hover:bg-white/50'}`}
              >
                Farmer
              </button>
              <button 
                onClick={() => switchRole('buyer')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${user?.role === 'buyer' ? 'bg-[#154212] text-white' : 'text-[#334D35] hover:bg-white/50'}`}
              >
                Buyer
              </button>
              <button 
                onClick={() => switchRole('admin')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${user?.role === 'admin' ? 'bg-[#154212] text-white' : 'text-[#334D35] hover:bg-white/50'}`}
              >
                Admin
              </button>
            </div>

            {/* Quick Language Pill */}
            <div className="flex items-center bg-[#EFEBE3] p-1 rounded-xl border border-[#E8E2D9] text-xs font-bold">
              <button 
                onClick={() => handleLanguageChange('mr')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${i18n.language === 'mr' ? 'bg-[#154212] text-white' : 'text-[#334D35] hover:bg-white/50'}`}
              >
                मराठी
              </button>
              <button 
                onClick={() => handleLanguageChange('hi')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${i18n.language === 'hi' ? 'bg-[#154212] text-white' : 'text-[#334D35] hover:bg-white/50'}`}
              >
                हिन्दी
              </button>
              <button 
                onClick={() => handleLanguageChange('en')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${i18n.language === 'en' ? 'bg-[#154212] text-white' : 'text-[#334D35] hover:bg-white/50'}`}
              >
                EN
              </button>
              <button 
                onClick={() => handleLanguageChange('gu')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${i18n.language === 'gu' ? 'bg-[#154212] text-white' : 'text-[#334D35] hover:bg-white/50'}`}
              >
                ગુજ
              </button>
            </div>

            {/* User Profile Badge */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E8E2D9]">
                <div className="w-8 h-8 rounded-full bg-[#154212] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#154212] leading-tight truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-[#5B755D] capitalize">{user.role}</div>
                </div>
              </div>
            )}

            <button 
              className="p-2 rounded-xl text-[#5B755D] hover:text-[#154212] hover:bg-[#EFEBE3] transition-colors" 
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>

            <button 
              className="p-2 rounded-xl text-[#5B755D] hover:text-[#BA1A1A] hover:bg-red-50 transition-colors"
              onClick={handleLogout}
              title="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col">
        {children}
      </main>

      {/* Full Width Footer */}
      <footer className="flex flex-col sm:flex-row justify-between items-center px-8 py-6 bg-[#F7F4F0] border-t border-[#E8E2D9] shrink-0 mt-auto">
        <p className="font-body-sm text-[#334D35] font-medium">© 2026 AgriConnect. Empowering rural farmers and APMC buyers across Maharashtra.</p>
        <div className="flex gap-6 font-label-sm text-[#154212] font-bold mt-4 sm:mt-0">
          <span className="flex items-center gap-1 text-xs text-[#2A6B25] bg-[#EFEBE3] px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            MSAMB Live & Verified
          </span>
          <Link to="/settings" className="hover:underline">Settings</Link>
          <Link to="/language" className="hover:underline">Language</Link>
        </div>
      </footer>
    </div>
  );
}

