import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Get user from localStorage on component mount and when localStorage changes
  useEffect(() => {
    const getUser = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const userName = localStorage.getItem('userName');

      if (token && userRole) {
        let avatarUrl = null;
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try { avatarUrl = JSON.parse(storedUser).avatarUrl; } catch (e) { /* ignore malformed cache */ }
        }
        setUser({
          role: userRole,
          name: userName || 'User',
          avatarUrl
        });
      } else {
        setUser(null);
      }
    };
    
    getUser();
    
    // Listen for storage changes (in case another tab updates)
    window.addEventListener('storage', getUser);
    return () => window.removeEventListener('storage', getUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50" style={{ backgroundColor: '#800000' }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-white text-primary w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg" style={{ color: '#800000' }}>
            S
          </div>
          <span className="text-white text-xl font-bold">SkillBridge</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-red-200 hover:text-white font-medium transition-all">
            Home
          </Link>
          <Link to="/skills" className="text-red-200 hover:text-white font-medium transition-all">
            Browse Skills
          </Link>

          {user ? (
            <>
              <Link to="/dashboard"
                className="text-red-200 hover:text-white font-medium transition-all">
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin"
                  className="text-yellow-300 hover:text-yellow-100 font-medium transition-all">
                  Admin Panel
                </Link>
              )}
              <div className="flex items-center gap-3 ml-2">
                <Link to="/profile"
                  className="bg-red-800 text-white pl-2 pr-4 py-2 rounded-lg text-sm hover:bg-red-900 transition-all flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img src={`${API_BASE_URL}${user.avatarUrl}`} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center text-xs font-bold" style={{ color: '#800000' }}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                  <span>
                    Hi, {user.name?.split(' ')[0] || 'User'}!
                    <span className="text-red-300 ml-1 text-xs">
                      ({user.role === 'admin' ? 'Admin' : user.role === 'provider' ? 'Provider' : 'Seeker'})
                    </span>
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-red-50 text-sm transition-all" style={{ color: '#800000' }}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"
                className="bg-white text-primary px-5 py-2 rounded-lg font-medium hover:bg-red-50 transition-all" style={{ color: '#800000' }}>
                Login
              </Link>
              <Link to="/register"
                className="bg-red-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-900 transition-all">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;