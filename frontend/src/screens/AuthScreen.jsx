import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer'
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
      const success = await login(formData.email, formData.password);
      if (success) navigate('/');
      else setError('Invalid email or password');
    } else {
      const success = await register(formData);
      if (success) navigate('/');
      else setError('Registration failed. Email may be in use.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4F0] text-[#154212] font-body-md font-medium">
      
      {/* Full Width Top Header */}
      <header className="flex justify-between items-center px-8 py-5 bg-[#F7F4F0] shrink-0 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[28px] text-[#154212]">energy_savings_leaf</span>
          <span className="font-display-sm text-[22px] font-bold tracking-tight text-[#154212]">AgriConnect</span>
        </div>
        <button className="flex items-center gap-1 font-label-md text-[#154212] hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-[20px]">help</span> Help
        </button>
      </header>
      
      {/* Split Screen Main Area */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#FCFBF9]">
        
        {/* Left Side - Image & Overlay */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-8 bg-cover bg-center" 
             style={{ backgroundImage: "url('https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          <div className="relative z-10 bg-[#F7F4F0] rounded-xl p-10 max-w-md shadow-lg border border-[#E8E2D9]">
            <h2 className="font-display-md text-[#154212] leading-tight mb-4 font-bold text-3xl">Empowering Rural Commerce.</h2>
            <p className="font-body-lg text-[#334D35] leading-relaxed">
              Connect directly with buyers, manage your crops, and grow your agricultural business with modern tools designed for you.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#FCFBF9] overflow-y-auto">
          <div className="w-full max-w-[420px] py-8">
            
            <div className="text-center mb-8">
              <h1 className="font-display-md text-[#154212] font-bold text-4xl mb-3">
                {activeTab === 'login' ? 'Welcome Back' : 'Join AgriConnect'}
              </h1>
              <p className="font-body-md text-[#334D35]">
                {activeTab === 'login' ? 'Login to manage your agricultural business.' : 'Create a new account'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex w-full mb-8 border-b border-[#E8E2D9]">
              <button 
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 pb-3 font-label-lg font-bold transition-colors ${activeTab === 'login' ? 'border-b-[3px] border-[#154212] text-[#154212]' : 'text-[#5B755D] hover:text-[#154212]'}`}
              >
                Login
              </button>
              <button 
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 pb-3 font-label-lg font-bold transition-colors ${activeTab === 'register' ? 'border-b-[3px] border-[#154212] text-[#154212]' : 'text-[#5B755D] hover:text-[#154212]'}`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="bg-[#FFDAD6] text-[#410002] p-4 rounded-xl mb-6 text-center font-body-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'register' && (
                <>
                  <div className="relative">
                    <input 
                      name="name" type="text" placeholder="Full Name" required
                      value={formData.name} onChange={handleChange}
                      className="w-full bg-[#EFEBE3] border border-[#E8E2D9] focus:border-[#154212] py-4 px-5 pr-12 rounded-lg outline-none text-[#154212] placeholder:text-[#5B755D] transition-colors"
                    />
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-[#5B755D] text-[20px]">person</span>
                    </div>
                  </div>
                  <div className="relative">
                    <select 
                      name="role" value={formData.role} onChange={handleChange}
                      className="w-full bg-[#EFEBE3] border border-[#E8E2D9] focus:border-[#154212] py-4 px-5 pr-12 rounded-lg outline-none text-[#154212] appearance-none transition-colors"
                    >
                      <option value="buyer">I am a Buyer</option>
                      <option value="farmer">I am a Farmer</option>
                      <option value="admin">I am an Admin</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-[#5B755D] text-[20px]">badge</span>
                    </div>
                  </div>
                </>
              )}

              <div className="relative">
                <input 
                  name="email" type="email" placeholder={activeTab === 'login' ? 'Phone Number' : 'Email Address'} required
                  value={formData.email} onChange={handleChange}
                  className="w-full bg-[#EFEBE3] border border-[#E8E2D9] focus:border-[#154212] py-4 px-5 pr-12 rounded-lg outline-none text-[#154212] placeholder:text-[#5B755D] transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#5B755D] text-[20px]">{activeTab === 'login' ? 'smartphone' : 'mail'}</span>
                </div>
              </div>

              <div className="relative">
                <input 
                  name="password" type="password" placeholder="Password" required minLength="6"
                  value={formData.password} onChange={handleChange}
                  className="w-full bg-[#EFEBE3] border border-[#E8E2D9] focus:border-[#154212] py-4 px-5 pr-12 rounded-lg outline-none text-[#154212] placeholder:text-[#5B755D] transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center cursor-pointer hover:text-[#154212] transition-colors text-[#5B755D]">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </div>
              </div>

              {activeTab === 'login' && (
                <div className="flex justify-between items-center py-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-5 h-5 rounded border border-[#C6C0B5] bg-[#EFEBE3] group-hover:border-[#154212] flex items-center justify-center transition-colors"></div>
                    <span className="font-body-md text-[#334D35]">Remember me</span>
                  </label>
                  <a href="#" className="font-label-md font-bold text-[#154212] hover:underline">Forgot Password?</a>
                </div>
              )}

              <button disabled={loading} type="submit" className="w-full bg-[#154212] text-white font-label-lg font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0E2C14] transition-colors disabled:opacity-70 mt-4">
                {activeTab === 'login' ? 'Login' : 'Create Account'}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </form>

            {activeTab === 'login' && (
              <>
                <div className="flex items-center gap-4 my-7">
                  <div className="h-px bg-[#E8E2D9] flex-1"></div>
                  <span className="font-body-sm text-[#5B755D]">OR</span>
                  <div className="h-px bg-[#E8E2D9] flex-1"></div>
                </div>

                <button className="w-full border-2 border-[#154212] bg-transparent text-[#154212] font-label-lg font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#F7F4F0] transition-colors mb-7">
                  <span className="material-symbols-outlined text-[20px]">pin</span>
                  Login with OTP
                </button>

                <div className="text-center font-label-sm text-[#5B755D] font-bold uppercase tracking-widest mb-4">
                  OR CONTINUE WITH
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 border border-[#E8E2D9] bg-white py-3.5 rounded-lg font-label-lg font-bold text-[#154212] flex items-center justify-center gap-2 hover:bg-[#F7F4F0] transition-colors">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Google
                  </button>
                  <button className="flex-1 border border-[#E8E2D9] bg-white py-3.5 rounded-lg font-label-lg font-bold text-[#154212] flex items-center justify-center gap-2 hover:bg-[#F7F4F0] transition-colors">
                    <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                    Facebook
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
