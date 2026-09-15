import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import ChatModal from '../components/ChatModal';
import ReviewsModal from '../components/ReviewsModal';
import { API_BASE_URL } from '../config';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('skills');
  const [newSkill, setNewSkill] = useState({ skillName: '', category: 'Teaching', description: '', hourlyRate: '' });
  const [addSkillError, setAddSkillError] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editSkill, setEditSkill] = useState({ skillName: '', category: 'Teaching', description: '', hourlyRate: '' });
  const [editSkillError, setEditSkillError] = useState('');
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [newSkillImage, setNewSkillImage] = useState(null);
  const [editSkillImage, setEditSkillImage] = useState(null);
  const [chattingRequest, setChattingRequest] = useState(null);
  const [addSkillSubmitting, setAddSkillSubmitting] = useState(false);
  const [editSkillSubmitting, setEditSkillSubmitting] = useState(false);
  const [contactingSkillId, setContactingSkillId] = useState(null);
  const [contactMsg, setContactMsg] = useState({ type: '', text: '' });
  const [reviewsFor, setReviewsFor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const skillsRes = await axios.get(`${API_BASE_URL}/api/skills`);
      setSkills(skillsRes.data.skills);

      const requestsRes = await axios.get(`${API_BASE_URL}/api/requests`, { headers });
      setRequests(requestsRes.data.requests);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setAddSkillError('');
    setAddSkillSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/skills`,
        newSkill,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (newSkillImage && res.data.skillId) {
        const formData = new FormData();
        formData.append('image', newSkillImage);
        await axios.post(`${API_BASE_URL}/api/upload/skill/${res.data.skillId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }

      setNewSkill({ skillName: '', category: 'Teaching', description: '', hourlyRate: '' });
      setNewSkillImage(null);
      setShowAddSkill(false);
      fetchData();
    } catch (err) {
      setAddSkillError(err.response?.data?.message || 'Failed to add skill');
    }
    setAddSkillSubmitting(false);
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Could not delete skill!');
    }
  };

  const startEditSkill = (skill) => {
    setEditingSkillId(skill.SKILL_ID);
    setEditSkill({
      skillName: skill.SKILL_NAME,
      category: skill.CATEGORY,
      description: skill.DESCRIPTION,
      hourlyRate: skill.HOURLY_RATE
    });
    setEditSkillError('');
  };

  const handleSaveEditSkill = async (e, skillId) => {
    e.preventDefault();
    setEditSkillError('');
    setEditSkillSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/skills/${skillId}`,
        editSkill,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (editSkillImage) {
        const formData = new FormData();
        formData.append('image', editSkillImage);
        await axios.post(`${API_BASE_URL}/api/upload/skill/${skillId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }

      setEditingSkillId(null);
      setEditSkillImage(null);
      fetchData();
    } catch (err) {
      setEditSkillError(err.response?.data?.message || 'Failed to update skill');
    }
    setEditSkillSubmitting(false);
  };

  const handleContactProvider = async (skill) => {
    setContactingSkillId(skill.SKILL_ID);
    setContactMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/requests`,
        {
          receiverId: skill.USER_ID,
          skillId: skill.SKILL_ID,
          message: `I am interested in your ${skill.SKILL_NAME} service`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContactMsg({ type: 'success', text: `Request sent to ${skill.NAME}! Track it in the "My Requests" tab.` });
      fetchData();
    } catch (err) {
      setContactMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send request.' });
    }
    setContactingSkillId(null);
    setTimeout(() => setContactMsg({ type: '', text: '' }), 4000);
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/requests/${requestId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      console.log(err);
      alert('Could not update request!');
    }
  };

  const openReviewForm = (req) => {
    setReviewingRequest(req);
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/reviews`,
        {
          targetId: reviewingRequest.RECEIVER_ID,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
          requestId: reviewingRequest.REQUEST_ID
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewingRequest(null);
      fetchData();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
    setReviewSubmitting(false);
  };

  // Provider ke liye incoming requests
  const incomingRequests = requests.filter(r =>
    r.RECEIVER_ID === user?.id && r.STATUS === 'pending'
  );

  // Provider ke liye accepted requests (ongoing work, chat available)
  const acceptedAsProvider = requests.filter(r =>
    r.RECEIVER_ID === user?.id && r.STATUS === 'accepted'
  );

  // Provider ke liye jobs jo complete ho chuki hain
  const completedAsProvider = requests.filter(r =>
    r.RECEIVER_ID === user?.id && r.STATUS === 'completed'
  );

  // Seeker ke liye sent requests
  const sentRequests = requests.filter(r =>
    r.SENDER_ID === user?.id
  );

  const isProvider = user?.role === 'provider';

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="bg-primary text-white rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 break-words">
              Welcome, {user?.name}!
            </h1>
            <p className="text-maroon-100">
              Role: {isProvider ? 'Skill Provider' : 'Service Seeker'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto bg-white text-primary px-6 py-2 rounded-lg font-medium hover:bg-beige">
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {isProvider ? (
            <>
              <div className="bg-white p-6 rounded-xl border border-maroon-100 text-center">
                <h3 className="text-3xl font-bold text-primary">{skills.filter(s => s.USER_ID === user?.id).length}</h3>
                <p className="text-gray-600 mt-1">My Skills</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-maroon-100 text-center">
                <h3 className="text-3xl font-bold text-primary">{incomingRequests.length}</h3>
                <p className="text-gray-600 mt-1">Pending Requests</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-maroon-100 text-center">
                <h3 className="text-3xl font-bold text-primary">
                  {acceptedAsProvider.length}
                </h3>
                <p className="text-gray-600 mt-1">Ongoing</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-xl border border-maroon-100 text-center">
                <h3 className="text-3xl font-bold text-primary">{skills.length}</h3>
                <p className="text-gray-600 mt-1">Total Skills</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-maroon-100 text-center">
                <h3 className="text-3xl font-bold text-primary">{sentRequests.length}</h3>
                <p className="text-gray-600 mt-1">My Requests</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-maroon-100 text-center">
                <h3 className="text-3xl font-bold text-primary">
                  {sentRequests.filter(r => r.STATUS === 'accepted' || r.STATUS === 'completed').length}
                </h3>
                <p className="text-gray-600 mt-1">Accepted</p>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'skills'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-maroon-200'
            }`}>
            {isProvider ? 'My Skills' : 'Browse Skills'}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'requests'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-maroon-200'
            }`}>
            {isProvider ? 'Incoming Requests' : 'My Requests'}
          </button>
        </div>

        {/* PROVIDER VIEW */}
        {isProvider ? (
          <>
            {/* Provider Skills Tab */}
            {activeTab === 'skills' && (
              <div>
                <div className="mb-6">
                  {showAddSkill ? (
                    <div className="bg-white rounded-xl border border-maroon-100 p-6">
                      <h3 className="text-lg font-bold text-primary mb-4">Add a New Skill</h3>
                      {addSkillError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{addSkillError}</div>
                      )}
                      <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Skill name (e.g. Math Tutoring)"
                          value={newSkill.skillName}
                          onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                          className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary col-span-2"
                          required
                        />
                        <select
                          value={newSkill.category}
                          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                          className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary">
                          <option value="Teaching">Teaching</option>
                          <option value="Technical">Technical</option>
                          <option value="Design">Design</option>
                          <option value="Healthcare">Healthcare</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Hourly rate (Rs.)"
                          value={newSkill.hourlyRate}
                          onChange={(e) => setNewSkill({ ...newSkill, hourlyRate: e.target.value })}
                          className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                          min="0"
                          required
                        />
                        <textarea
                          placeholder="Description"
                          value={newSkill.description}
                          onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                          className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary col-span-2"
                          rows="3"
                          required
                        />
                        <div className="col-span-2">
                          <label className="block text-gray-700 font-medium mb-2 text-sm">Photo (optional)</label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(e) => setNewSkillImage(e.target.files[0] || null)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="col-span-2 flex gap-3">
                          <button type="submit" disabled={addSkillSubmitting}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary disabled:opacity-60">
                            {addSkillSubmitting ? 'Saving...' : 'Save Skill'}
                          </button>
                          <button type="button" onClick={() => { setShowAddSkill(false); setNewSkillImage(null); }}
                            className="border border-gray-200 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddSkill(true)}
                      className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary">
                      + Add New Skill
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {skills.filter(s => s.USER_ID === user?.id).length === 0 ? (
                    <div className="col-span-3 text-center py-20 text-gray-500">
                      No skills added yet!
                    </div>
                  ) : (
                    skills.filter(s => s.USER_ID === user?.id).map((skill) => (
                      editingSkillId === skill.SKILL_ID ? (
                        <div key={skill.SKILL_ID}
                          className="bg-white rounded-xl border-2 border-primary p-6">
                          {editSkillError && (
                            <div className="bg-red-50 text-red-600 p-2 rounded-lg mb-3 text-xs">{editSkillError}</div>
                          )}
                          <form onSubmit={(e) => handleSaveEditSkill(e, skill.SKILL_ID)} className="space-y-3">
                            <input
                              type="text"
                              value={editSkill.skillName}
                              onChange={(e) => setEditSkill({ ...editSkill, skillName: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                              required
                            />
                            <select
                              value={editSkill.category}
                              onChange={(e) => setEditSkill({ ...editSkill, category: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                              <option value="Teaching">Teaching</option>
                              <option value="Technical">Technical</option>
                              <option value="Design">Design</option>
                              <option value="Healthcare">Healthcare</option>
                            </select>
                            <textarea
                              value={editSkill.description}
                              onChange={(e) => setEditSkill({ ...editSkill, description: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                              rows="2"
                              required
                            />
                            <input
                              type="number"
                              value={editSkill.hourlyRate}
                              onChange={(e) => setEditSkill({ ...editSkill, hourlyRate: e.target.value })}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                              min="0"
                              required
                            />
                            <div>
                              <label className="block text-gray-700 font-medium mb-1 text-xs">Photo (optional)</label>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(e) => setEditSkillImage(e.target.files[0] || null)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" disabled={editSkillSubmitting}
                                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary disabled:opacity-60">
                                {editSkillSubmitting ? 'Saving...' : 'Save'}
                              </button>
                              <button type="button" onClick={() => { setEditingSkillId(null); setEditSkillImage(null); }}
                                className="flex-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div key={skill.SKILL_ID}
                          className="h-full flex flex-col bg-white rounded-xl border border-maroon-100 overflow-hidden hover:shadow-md transition-all">
                          {skill.IMAGE_URL && (
                            <img src={`${API_BASE_URL}${skill.IMAGE_URL}`} alt={skill.SKILL_NAME} className="w-full h-36 object-cover shrink-0" />
                          )}
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start gap-2">
                              <span className="bg-maroon-100 text-primary px-3 py-1 rounded-full text-sm shrink-0">
                                {skill.CATEGORY}
                              </span>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => startEditSkill(skill)}
                                  className="text-gray-500 hover:text-primary text-sm">
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteSkill(skill.SKILL_ID)}
                                  className="text-red-500 hover:text-red-700 text-sm">
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mt-3 mb-1 line-clamp-2">
                              {skill.SKILL_NAME}
                            </h3>
                            <div className="mb-2">
                              {Number(skill.REVIEW_COUNT) > 0 ? (
                                <button onClick={() => setReviewsFor({ userId: skill.USER_ID, name: skill.SKILL_NAME })}
                                  className="hover:underline">
                                  <StarRating rating={skill.AVG_RATING} count={skill.REVIEW_COUNT} />
                                </button>
                              ) : (
                                <StarRating rating={skill.AVG_RATING} count={skill.REVIEW_COUNT} />
                              )}
                            </div>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-3">{skill.DESCRIPTION}</p>
                            <p className="text-primary font-bold mt-auto pt-2">Rs. {skill.HOURLY_RATE}/hr</p>
                          </div>
                        </div>
                      )
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Provider Incoming Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4">Pending Requests</h3>
                <div className="space-y-4 mb-10">
                  {incomingRequests.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No pending requests!</div>
                  ) : (
                    incomingRequests.map((req) => (
                      <div key={req.REQUEST_ID}
                        className="bg-white rounded-xl border border-maroon-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800">{req.SKILL_NAME}</h3>
                          <p className="text-gray-500 text-sm">{req.MESSAGE}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            From: <span className="font-medium text-primary">{req.SENDER_NAME}</span>
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateRequest(req.REQUEST_ID, 'accepted')}
                            className="flex-1 sm:flex-none bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-all hover:scale-105">
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleUpdateRequest(req.REQUEST_ID, 'rejected')}
                            className="flex-1 sm:flex-none bg-red-100 text-red-600 px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition-all hover:scale-105">
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-700 mb-4">Accepted — Ongoing</h3>
                <div className="space-y-4 mb-10">
                  {acceptedAsProvider.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No ongoing requests yet.</div>
                  ) : (
                    acceptedAsProvider.map((req) => (
                      <div key={req.REQUEST_ID}
                        className="bg-white rounded-xl border border-maroon-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800">{req.SKILL_NAME}</h3>
                          <p className="text-gray-500 text-sm">{req.MESSAGE}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            With: <span className="font-medium text-primary">{req.SENDER_NAME}</span>
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setChattingRequest(req)}
                            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-secondary transition-all">
                            💬 Chat
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Mark this job as completed? The seeker will be able to leave a review afterwards.')) {
                                handleUpdateRequest(req.REQUEST_ID, 'completed');
                              }
                            }}
                            className="bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-all">
                            ✓ Mark Completed
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-700 mb-4">Completed</h3>
                <div className="space-y-4">
                  {completedAsProvider.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No completed jobs yet.</div>
                  ) : (
                    completedAsProvider.map((req) => (
                      <div key={req.REQUEST_ID}
                        className="bg-white rounded-xl border border-maroon-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800">{req.SKILL_NAME}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            With: <span className="font-medium text-primary">{req.SENDER_NAME}</span>
                          </p>
                        </div>
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 self-start sm:self-auto">
                          Completed
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* SEEKER VIEW */}
            {/* Seeker Skills Tab */}
            {activeTab === 'skills' && (
              <div>
                {contactMsg.text && (
                  <div className={`p-3 rounded-lg mb-4 text-sm ${contactMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {contactMsg.text}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {skills.map((skill) => (
                  <div key={skill.SKILL_ID}
                    className="h-full flex flex-col bg-white rounded-xl border border-maroon-100 overflow-hidden hover:shadow-md transition-all">
                    {skill.IMAGE_URL && (
                      <img src={`${API_BASE_URL}${skill.IMAGE_URL}`} alt={skill.SKILL_NAME} className="w-full h-36 object-cover shrink-0" />
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <span className="bg-maroon-100 text-primary px-3 py-1 rounded-full text-sm self-start">
                        {skill.CATEGORY}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800 mt-3 mb-1 line-clamp-2">
                        {skill.SKILL_NAME}
                      </h3>
                      <div className="mb-2">
                        {Number(skill.REVIEW_COUNT) > 0 ? (
                          <button onClick={() => setReviewsFor({ userId: skill.USER_ID, name: skill.NAME })}
                            className="hover:underline">
                            <StarRating rating={skill.AVG_RATING} count={skill.REVIEW_COUNT} />
                          </button>
                        ) : (
                          <StarRating rating={skill.AVG_RATING} count={skill.REVIEW_COUNT} />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-3">{skill.DESCRIPTION}</p>
                      <div className="flex items-center gap-2 mb-3 mt-auto">
                        {skill.PROVIDER_AVATAR ? (
                          <img src={`${API_BASE_URL}${skill.PROVIDER_AVATAR}`} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-maroon-100 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {skill.NAME?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                        <span className="text-sm text-gray-600 truncate">{skill.NAME}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-primary font-bold shrink-0">Rs. {skill.HOURLY_RATE}/hr</p>
                        <button
                          onClick={() => handleContactProvider(skill)}
                          disabled={contactingSkillId === skill.SKILL_ID}
                          className="shrink-0 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary disabled:opacity-60">
                          {contactingSkillId === skill.SKILL_ID ? 'Sending...' : 'Contact'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}

            {/* Seeker Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {sentRequests.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">No requests sent yet!</div>
                ) : (
                  sentRequests.map((req) => (
                    <div key={req.REQUEST_ID}
                      className="bg-white rounded-xl border border-maroon-100 p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{req.SKILL_NAME}</h3>
                        <p className="text-gray-500 text-sm">{req.MESSAGE}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          To: <span className="font-medium text-primary">{req.RECEIVER_NAME}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {(req.STATUS === 'accepted' || req.STATUS === 'completed') && (
                          <button
                            onClick={() => setChattingRequest(req)}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-secondary transition-all">
                            💬 Chat
                          </button>
                        )}
                        {req.STATUS === 'completed' && !req.HAS_REVIEW && (
                          <button
                            onClick={() => openReviewForm(req)}
                            className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-200 transition-all">
                            ⭐ Leave a Review
                          </button>
                        )}
                        {req.STATUS === 'completed' && req.HAS_REVIEW && (
                          <span className="text-xs text-gray-400">✓ Reviewed</span>
                        )}
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          req.STATUS === 'accepted' ? 'bg-maroon-100 text-primary' :
                          req.STATUS === 'completed' ? 'bg-blue-100 text-blue-700' :
                          req.STATUS === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.STATUS}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Leave a Review Modal */}
      {reviewingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Leave a Review</h3>
            <p className="text-gray-500 text-sm mb-6">
              For <span className="font-medium text-primary">{reviewingRequest.RECEIVER_NAME}</span> — {reviewingRequest.SKILL_NAME}
            </p>

            {reviewError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{reviewError}</div>
            )}

            <form onSubmit={handleSubmitReview}>
              <label className="block text-gray-700 font-medium mb-2">Rating</label>
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`text-3xl transition-all ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
              </div>

              <label className="block text-gray-700 font-medium mb-2">Comment (optional)</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-primary"
                rows="3"
                placeholder="How was your experience?"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewingRequest(null)}
                  className="flex-1 border border-gray-200 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary disabled:opacity-60">
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chattingRequest && (
        <ChatModal
          request={chattingRequest}
          currentUserId={user?.id}
          onClose={() => setChattingRequest(null)}
        />
      )}

      {/* Reviews Modal */}
      {reviewsFor && (
        <ReviewsModal
          userId={reviewsFor.userId}
          providerName={reviewsFor.name}
          onClose={() => setReviewsFor(null)}
        />
      )}

      <footer className="bg-primary text-maroon-100 text-center py-6 mt-8">
        <p>2026 SkillBridge - Connecting Communities</p>
      </footer>
    </div>
  );
}

export default Dashboard;