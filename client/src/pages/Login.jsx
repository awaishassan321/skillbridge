import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email, password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('userRole', res.data.user.role);
      localStorage.setItem('userName', res.data.user.name);
      window.dispatchEvent(new Event('skillbridge-auth-change'));

      const role = res.data.user.role;
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password!');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-4 py-16"><div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl"/><div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal-100 blur-3xl"/>
        <div className="relative w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-2xl shadow-indigo-200/50 sm:p-10"><div className="mb-7 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-black text-primary">S</span>
          <h2 className="mt-4 text-3xl font-bold text-primary">
            Welcome Back!
          </h2>
          <p className="mt-2 text-center text-gray-500">
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <div className="relative"><input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-16"
                placeholder="Enter your password"
                required
              /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-sm font-semibold text-primary">{showPassword ? 'Hide' : 'Show'}</button></div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-secondary disabled:opacity-60">
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div></div>
      </div>
    </div>
  );
}

export default Login;
