import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'farmer',
    location: 'Nashik, Maharashtra'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setActiveTab(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    navigate(tab === 'login' ? '/login' : '/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (activeTab === 'login') {
      const result = await login(formData.email, formData.password);
      if (result && result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result?.error || 'Invalid email/phone or password');
      }
    } else {
      const result = await register(formData);
      if (result && result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result?.error || 'Registration failed. Email or phone may already be in use.');
      }
    }
    setLoading(false);
  };

  const handleQuickLogin = async (phoneOrEmail, password, role) => {
    setError('');
    setLoading(true);
    setFormData((prev) => ({ ...prev, email: phoneOrEmail, password, role }));
    const result = await login(phoneOrEmail, password);
    if (result && result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result?.error || `Failed to sign in as ${role}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4F0] text-[#154212] font-body-md font-medium">
      
      {/* Full Width Top Header */}
      <header className="flex justify-between items-center px-8 py-5 bg-[#F7F4F0] shrink-0 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-[28px] text-[#154212]">energy_savings_leaf</span>
          <span className="font-display-sm text-[22px] font-bold tracking-tight text-[#154212]">AgriConnect</span>
        </div>
        <div className="text-xs text-[#5B755D] font-bold uppercase tracking-wider bg-[#EFEBE3] px-3 py-1.5 rounded-full border border-[#E8E2D9]">
          Maharashtra APMC Pilot
        </div>
      </header>
      
      {/* Split Screen Main Area */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#FCFBF9]">
        
        {/* Left Side - Image & Overlay */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-8 bg-cover bg-center" 
             style={{ backgroundImage: "url('https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          <div className="relative z-10 bg-[#F7F4F0] rounded-2xl p-8 max-w-md shadow-xl border border-[#E8E2D9]">
            <h2 className="font-display-md text-[#154212] leading-tight mb-3 font-bold text-2xl">
              Maharashtra APMC Marketplace
            </h2>
            <p className="font-body-md text-[#334D35] leading-relaxed mb-4">
              Connect directly with verified buyers, track real-time MSAMB mandi arrivals, predict crop prices, and secure escrow payouts.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-[#154212]">
              <span className="bg-[#E4ECE3] px-2.5 py-1 rounded-md">✓ Direct Trading</span>
              <span className="bg-[#E4ECE3] px-2.5 py-1 rounded-md">✓ Escrow Protected</span>
              <span className="bg-[#E4ECE3] px-2.5 py-1 rounded-md">✓ MSAMB Mandi Rates</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-[#FCFBF9] overflow-y-auto">
          <div className="w-full max-w-[440px] py-4">
            
            <div className="text-center mb-6">
              <h1 className="font-display-md text-[#154212] font-bold text-3xl mb-2">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h1>
              <p className="font-body-md text-[#5B755D]">
                {activeTab === 'login' ? 'Sign in to access your agricultural dashboard' : 'Join AgriConnect to trade across Maharashtra APMCs'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex w-full mb-5 border-b border-[#E8E2D9]">
              <button 
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 pb-3 font-label-lg font-bold transition-colors ${activeTab === 'login' ? 'border-b-[3px] border-[#154212] text-[#154212]' : 'text-[#5B755D] hover:text-[#154212]'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 pb-3 font-label-lg font-bold transition-colors ${activeTab === 'register' ? 'border-b-[3px] border-[#154212] text-[#154212]' : 'text-[#5B755D] hover:text-[#154212]'}`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="bg-[#FFDAD6] text-[#410002] p-3.5 rounded-xl mb-5 text-sm font-medium border border-[#FFB4AB] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#334D35] uppercase mb-1">Account Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'farmer' })}
                        className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          formData.role === 'farmer' 
                            ? 'bg-[#154212] text-white border-[#154212] shadow-sm' 
                            : 'bg-[#EFEBE3] text-[#334D35] border-[#E8E2D9]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">agriculture</span>
                        <span>Farmer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'buyer' })}
                        className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          formData.role === 'buyer' 
                            ? 'bg-[#154212] text-white border-[#154212] shadow-sm' 
                            : 'bg-[#EFEBE3] text-[#334D35] border-[#E8E2D9]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                        <span>Buyer</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334D35] uppercase mb-1">Full Name</label>
                    <div className="relative">
                      <input 
                        name="name" 
                        type="text" 
                        placeholder="e.g. Rajesh Patil" 
                        required
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full bg-[#EFEBE3] border border-[#E8E2D9] focus:border-[#154212] py-3.5 px-4 pr-10 rounded-lg outline-none text-[#154212] placeholder:text-[#8C9E8E] text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5B755D]">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334D35] uppercase mb-1">District / Mandi Location</label>
                    <div className="relative">
                      <input 
                        name="location" 
                        type="text" 
                        placeholder="e.g. Pimpalgaon APMC, Nashik" 
                        required
                        value={formData.location} 
                        onChange={handleChange}
                        className="w-full bg-[#EFEBE3] border border-[#E8E2D9] focus:border-[#154212] py-3.5 px-4 pr-10 rounded-lg outline-none text-[#154212] placeholder:text-[#8C9E8E] text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5B755D]">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#334D35] uppercase mb-1">
                  {activeTab === 'login' ? 'Email or Mobile Number' : 'Email or Mobile Number'}
                </label>
                <div className="relative">
                  <input 
                    name="email" 
                    type="text" 
                    placeholder={activeTab === 'login' ? 'e.g. user@example.com or +919822123456' : 'e.g. farmer@example.com or +919822123456'} 
                    required
                    value={formData.email} 
                    onChange={handleChange}
                    className="w-full bg-[#EFEBE3] border border-[#E8E2D9] focus:border-[#154212] py-3.5 px-4 pr-10 rounded-lg outline-none text-[#154212] placeholder:text-[#8C9E8E] text-sm font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#5B755D]">
                    <span className="material-symbols-outlined text-[18px]">
                      {activeTab === 'login' ? 'account_circle' : 'contact_mail'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334D35] uppercase mb-1">Password</label>
                <div className="relative">
                  <input 
                    name="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    required 
                    minLength="6"
                    value={formData.password} 
                    onChange={handleChange}
                    className="w-full bg-[#EFEBE3] border border-[#E8E2D9] focus:border-[#154212] py-3.5 px-4 pr-10 rounded-lg outline-none text-[#154212] placeholder:text-[#8C9E8E] text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5B755D]">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-[#154212] text-white font-label-lg font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0E2C14] transition-all disabled:opacity-60 mt-6 shadow-md cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-[#5B755D]">
              Protected by Supabase Authentication & encrypted SSL transmission.
            </div>
          </div>
        </div>
      </main>

      {/* Full Width Footer */}
      <footer className="flex flex-col sm:flex-row justify-between items-center px-8 py-5 bg-[#F7F4F0] border-t border-[#E8E2D9] shrink-0 text-xs text-[#5B755D]">
        <p>© 2026 AgriConnect. Maharashtra Agricultural Marketing Board Pilot.</p>
        <div className="flex gap-6 font-bold text-[#154212] mt-2 sm:mt-0">
          <span>Official APMC Gateway</span>
        </div>
      </footer>
    </div>
  );
}

