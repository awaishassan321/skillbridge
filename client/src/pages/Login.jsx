import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';
import { subscribeToPush, isPushSupported } from '../utils/push';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email, password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('userRole', res.data.user.role);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('userId', res.data.user.id);

      // Fire-and-forget: prompts for permission only the first time, and
      // silently resolves if already granted/denied — never blocks login.
      if (isPushSupported()) {
        subscribeToPush().catch(() => {});
      }

      const role = res.data.user.role;
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-md border border-maroon-100 w-full max-w-md">
          <h2 className="text-3xl font-bold text-primary text-center mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Login to your SkillBridge account
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition-all disabled:opacity-60">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;