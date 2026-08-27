import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/');
    } else {
      setError('Registration failed. Email might be in use.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-8 max-w-md w-full shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-primary mb-2">Join AgriConnect</h1>
          <p className="font-body-lg text-on-surface-variant">Create a new account</p>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-label-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-surface-container-low border border-outline-variant focus:border-primary p-3 rounded-lg outline-none font-body-md text-on-surface"
              required 
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-surface-container-low border border-outline-variant focus:border-primary p-3 rounded-lg outline-none font-body-md text-on-surface"
              required 
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-surface-container-low border border-outline-variant focus:border-primary p-3 rounded-lg outline-none font-body-md text-on-surface"
              required 
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">I am a...</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-surface-container-low border border-outline-variant focus:border-primary p-3 rounded-lg outline-none font-body-md text-on-surface appearance-none"
            >
              <option value="buyer">Buyer</option>
              <option value="farmer">Farmer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-primary text-on-primary font-label-lg py-3 rounded-lg shadow-[0_2px_0_0_#154212] hover:bg-primary-container hover:text-on-primary-container transition-colors mt-6">
            Register
          </button>
        </form>
        
        <p className="text-center mt-6 font-body-md text-on-surface-variant">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-label-md">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
