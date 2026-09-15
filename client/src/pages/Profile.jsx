import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';
import { isPushSupported, getPushPermissionState, getCurrentSubscription, subscribeToPush, unsubscribeFromPush } from '../utils/push';

function Profile() {
  const [profile, setProfile] = useState({ name: '', location: '', email: '', role: '', createdAt: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    getCurrentSubscription().then((sub) => setPushEnabled(!!sub)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePush = async () => {
    setPushError('');
    setPushBusy(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
      } else {
        await subscribeToPush();
        setPushEnabled(true);
      }
    } catch (err) {
      setPushError(err.message || 'Something went wrong');
    }
    setPushBusy(false);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.user);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarError('');
    setAvatarUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await axios.post(`${API_BASE_URL}/api/upload/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setProfile({ ...profile, avatarUrl: res.data.url });

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.avatarUrl = res.data.url;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar');
    }
    setAvatarUploading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/auth/profile`,
        { name: profile.name, location: profile.location },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Keep localStorage in sync so Navbar / Dashboard reflect the new name immediately
      localStorage.setItem('userName', profile.name);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.name = profile.name;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      window.dispatchEvent(new Event('storage'));

      setProfileMsg({ type: 'success', text: 'Profile updated successfully! ✅' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
    setSaving(false);
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/auth/password`,
        { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully! ✅' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light">
        <Navbar />
        <div className="text-center py-20 text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-primary mb-2">My Profile</h1>
        <p className="text-gray-500 mb-8">Manage your account information and password</p>

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-maroon-100 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={`${API_BASE_URL}${profile.avatarUrl}`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-maroon-100"
                />
              ) : (
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <label
                htmlFor="avatarInput"
                className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer hover:bg-gray-50"
                title="Change photo">
                📷
              </label>
              <input
                id="avatarInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-500 text-sm">{profile.email}</p>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-maroon-100 text-primary capitalize">
                {profile.role}
              </span>
              {avatarUploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
              {avatarError && <p className="text-xs text-red-500 mt-1">{avatarError}</p>}
            </div>
          </div>

          {profileMsg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${profileMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name || ''}
                onChange={handleProfileChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location || ''}
                onChange={handleProfileChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                placeholder="e.g. Islamabad"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-secondary transition-all disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Notifications Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-maroon-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Push Notifications</h2>
          <p className="text-gray-500 text-sm mb-4">
            Get notified on this device when someone sends you a request, accepts one, or messages you.
          </p>

          {!isPushSupported() ? (
            <p className="text-sm text-gray-400">Not supported on this browser.</p>
          ) : getPushPermissionState() === 'denied' ? (
            <p className="text-sm text-red-500">
              Notifications are blocked for this site in your browser settings. Allow them there to enable this.
            </p>
          ) : (
            <>
              {pushError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{pushError}</div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  {pushEnabled ? 'Notifications are on' : 'Notifications are off'}
                </span>
                <button
                  onClick={handleTogglePush}
                  disabled={pushBusy}
                  className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-60 ${pushEnabled ? 'bg-primary' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${pushEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-maroon-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Change Password</h2>

          {passwordMsg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-secondary transition-all disabled:opacity-60">
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
