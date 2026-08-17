import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', location: '', role: 'seeker'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 8) return setError('Password must contain at least 8 characters.');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError('Registration failed! Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-12"><div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl"/><div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal-100 blur-3xl"/>
        <div className="relative w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-2xl shadow-indigo-200/50 sm:p-10"><div className="mb-7 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-lg font-black text-teal-700">S</span>
          <h2 className="mt-4 text-3xl font-bold text-primary">
            Create Account
          </h2>
          <p className="mt-2 text-center text-gray-500">
            Join SkillBridge community today
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <div className="relative"><input
                type={showPassword ? 'text' : 'password'}
                name="password"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-16"
                placeholder="At least 8 characters"
                required
              /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-sm font-semibold text-primary">{showPassword ? 'Hide' : 'Show'}</button></div>
              <p className="mt-1 text-xs text-gray-500">Use at least 8 characters.</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Location</label>
              <input
                type="text"
                name="location"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="e.g. Islamabad"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">I want to</label>
              <select
                name="role"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3">
                <option value="seeker">Find Skills (Seeker)</option>
                <option value="provider">Offer Skills (Provider)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-secondary disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div></div>
      </div>
    </div>
  );
}

export default Register;
