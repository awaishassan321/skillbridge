import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Admin = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [skills, setSkills] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const itemsPerPage = 10;

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetchAllData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab, selectedStatus, selectedRole, selectedCategory]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
            fetchStats(),
            fetchUsers(),
            fetchSkills(),
            fetchRequests()
        ]);
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data.stats);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.users);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/skills`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSkills(res.data.skills);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data.requests);
        } catch (err) {
            console.error(err);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 3000);
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess('User deleted successfully');
            fetchUsers();
            fetchStats();
        } catch (err) {
            showError('Failed to delete user');
        }
    };

    const deleteSkill = async (id) => {
        if (!window.confirm('Are you sure you want to delete this skill? This action cannot be undone.')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/admin/skills/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess('Skill deleted successfully');
            fetchSkills();
            fetchStats();
        } catch (err) {
            showError('Failed to delete skill');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/admin/requests/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess(`Request ${status} successfully`);
            fetchRequests();
        } catch (err) {
            showError('Failed to update status');
        }
    };

    const exportToCSV = (type) => {
        let data = [];
        let filename = '';
        
        if (type === 'users') {
            data = filteredUsers.map(u => ({ Name: u.name, Email: u.email, Role: u.role, Location: u.location || 'N/A', Joined: u.created_at }));
            filename = 'users_export.csv';
        } else if (type === 'skills') {
            data = filteredSkills.map(s => ({ Skill: s.skill_name, Category: s.category, Provider: s.provider?.name, Rate: s.hourly_rate }));
            filename = 'skills_export.csv';
        } else if (type === 'requests') {
            data = filteredRequests.map(r => ({ Skill: r.skill_name, From: r.sender?.name, To: r.receiver?.name, Status: r.status, Date: r.created_at }));
            filename = 'requests_export.csv';
        }
        
        if (data.length === 0) {
            showError('No data to export');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map(header => `"${row[header] || ''}"`);
            csvRows.push(values.join(','));
        }
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        showSuccess(`${type.toUpperCase()} exported successfully`);
    };

    // Filtering logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const filteredSkills = skills.filter(s => {
        const matchesSearch = s.skill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              s.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              s.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.skill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              r.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              r.receiver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const paginate = (data) => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    };

    const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

    const StatCard = ({ title, value, icon, color }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: color }}>{value}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}15`, color: color }}>
                    {icon}
                </div>
            </div>
        </div>
    );

    // Get unique categories for filter
    const categories = ['all', ...new Set(skills.map(s => s.category).filter(Boolean))];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf8f0' }}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#fdf8f0' }}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: '#800000' }}>Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage users, skills, and service requests</p>
                </div>

                {/* Success/Error Messages */}
                {successMsg && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6">
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6">
                        {errorMsg}
                    </div>
                )}

                {/* Stats Cards - Only on stats tab */}
                {activeTab === 'stats' && stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="#800000" />
                        <StatCard title="Total Providers" value={stats.totalProviders || 0} icon="🔧" color="#2e7d32" />
                        <StatCard title="Total Skills" value={stats.totalSkills} icon="📚" color="#e65100" />
                        <StatCard title="Total Requests" value={stats.totalRequests} icon="📋" color="#1565c0" />
                    </div>
                )}

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b mb-6">
                    {[
                        { id: 'stats', label: '📊 Statistics', color: '#800000' },
                        { id: 'users', label: '👥 Users', color: '#800000' },
                        { id: 'skills', label: '🔧 Skills', color: '#800000' },
                        { id: 'requests', label: '📋 Requests', color: '#800000' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
                                activeTab === tab.id 
                                    ? 'bg-white text-[#800000] border-b-2 border-[#800000] shadow-sm' 
                                    : 'text-gray-500 hover:text-[#800000]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search and Filters Bar */}
                {activeTab !== 'stats' && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#800000]"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-400">🔍</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                {activeTab === 'users' && (
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#800000]"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="provider">Provider</option>
                                        <option value="seeker">Seeker</option>
                                    </select>
                                )}
                                
                                {activeTab === 'skills' && (
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#800000]"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat === 'all' ? 'All Categories' : cat}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                
                                {activeTab === 'requests' && (
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#800000]"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                )}
                                
                                <button
                                    onClick={() => exportToCSV(activeTab)}
                                    className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    style={{ backgroundColor: '#800000', color: 'white' }}
                                >
                                    📥 Export
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Joined</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginate(filteredUsers).map((u, index) => (
                                        <tr key={u.user_id} className="border-t hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-4 py-3 font-medium">{u.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                            <td className="px-4 py-3 text-gray-500">{u.location || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    u.role === 'provider' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{u.created_at || '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => deleteUser(u.user_id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {totalPages(filteredUsers) > 1 && (
                            <div className="flex justify-center gap-2 px-4 py-4 border-t">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-gray-600">
                                    Page {currentPage} of {totalPages(filteredUsers)}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages(filteredUsers), p + 1))}
                                    disabled={currentPage === totalPages(filteredUsers)}
                                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No users found
                            </div>
                        )}
                    </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Skill Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Provider</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Hourly Rate</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Posted</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginate(filteredSkills).map((s, index) => (
                                        <tr key={s.skill_id} className="border-t hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-4 py-3 font-medium">{s.skill_name}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                                                    {s.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{s.provider?.name}</td>
                                            <td className="px-4 py-3 font-medium" style={{ color: '#800000' }}>Rs. {s.hourly_rate}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{s.created_at || '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => deleteSkill(s.skill_id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {totalPages(filteredSkills) > 1 && (
                            <div className="flex justify-center gap-2 px-4 py-4 border-t">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border disabled:opacity-50">Previous</button>
                                <span className="px-3 py-1">Page {currentPage} of {totalPages(filteredSkills)}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages(filteredSkills), p + 1))} disabled={currentPage === totalPages(filteredSkills)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
                            </div>
                        )}
                        
                        {filteredSkills.length === 0 && (
                            <div className="text-center py-12 text-gray-500">No skills found</div>
                        )}
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Skill</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">From</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">To</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Message</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginate(filteredRequests).map((r, index) => (
                                        <tr key={r.request_id} className="border-t hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-4 py-3 font-medium">{r.skill_name}</td>
                                            <td className="px-4 py-3">{r.sender?.name}</td>
                                            <td className="px-4 py-3">{r.receiver?.name}</td>
                                            <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.message || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    r.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                    r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{r.created_at || '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                {r.status === 'pending' && (
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => updateStatus(r.request_id, 'accepted')}
                                                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                                                        >
                                                            ✓ Accept
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(r.request_id, 'rejected')}
                                                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                                                        >
                                                            ✗ Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {totalPages(filteredRequests) > 1 && (
                            <div className="flex justify-center gap-2 px-4 py-4 border-t">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border disabled:opacity-50">Previous</button>
                                <span className="px-3 py-1">Page {currentPage} of {totalPages(filteredRequests)}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages(filteredRequests), p + 1))} disabled={currentPage === totalPages(filteredRequests)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
                            </div>
                        )}
                        
                        {filteredRequests.length === 0 && (
                            <div className="text-center py-12 text-gray-500">No requests found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;