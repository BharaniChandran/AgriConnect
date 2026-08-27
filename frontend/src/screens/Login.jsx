import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/'); // Go to dashboard based on role later
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-primary mb-2">AgriConnect</h1>
          <p className="font-body-lg text-on-surface-variant">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-label-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant focus:border-primary p-3 rounded-lg outline-none font-body-md text-on-surface"
              required 
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant focus:border-primary p-3 rounded-lg outline-none font-body-md text-on-surface"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary text-on-primary font-label-lg py-3 rounded-lg shadow-[0_2px_0_0_#154212] hover:bg-primary-container hover:text-on-primary-container transition-colors mt-6">
            Sign In
          </button>
        </form>
        
        <p className="text-center mt-6 font-body-md text-on-surface-variant">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-label-md">Register</Link>
        </p>
      </div>
    </div>
  );
}
