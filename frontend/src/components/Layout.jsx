import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9] text-[#154212] font-body-md font-medium">
      
      {/* Full Width Top Header */}
      <header className="flex justify-between items-center px-4 md:px-8 py-5 bg-[#F7F4F0] shrink-0 border-b border-[#E8E2D9] sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <span className="material-symbols-outlined text-[28px] text-[#154212]">energy_savings_leaf</span>
          <span className="font-display-sm text-[22px] font-bold tracking-tight text-[#154212] hidden sm:block">AgriConnect</span>
        </div>
        
        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#154212] text-white flex items-center justify-center font-bold text-sm uppercase">
                {user.name ? user.name[0] : 'U'}
              </div>
              <span className="font-label-md hidden md:block">{user.name} ({user.role})</span>
            </div>
          )}
          <button className="flex items-center gap-1 font-label-md text-[#5B755D] hover:text-[#154212] transition-colors" onClick={() => navigate('/settings')}>
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="hidden sm:block">Settings</span>
          </button>
          <button 
            className="flex items-center gap-1 font-label-md text-[#5B755D] hover:text-[#154212] transition-colors"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col">
        {children}
      </main>

      {/* Full Width Footer */}
      <footer className="flex flex-col sm:flex-row justify-between items-center px-8 py-6 bg-[#F7F4F0] border-t border-[#E8E2D9] shrink-0">
        <p className="font-body-sm text-[#334D35] font-medium">© 2024 AgriConnect. Empowering rural commerce.</p>
        <div className="flex gap-6 font-label-sm text-[#154212] font-bold mt-4 sm:mt-0">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Support</a>
        </div>
      </footer>
    </div>
  );
}
