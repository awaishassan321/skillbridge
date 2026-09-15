import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import ReviewsModal from '../components/ReviewsModal';
import { API_BASE_URL } from '../config';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ show: false, type: '', message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [contactingSkillId, setContactingSkillId] = useState(null);
  const [reviewsFor, setReviewsFor] = useState(null);
  const navigate = useNavigate();
  const PAGE_SIZE = 9;

  const storedUser = localStorage.getItem('user');
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, keyword]);

  const fetchSkills = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/skills`);
      setSkills(res.data.skills);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleAISearch = async () => {
    if (!search) return;
    setAiLoading(true);
    setShowAI(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/recommend`, {
        query: search
      });
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.log(err);
    }
    setAiLoading(false);
  };

  const handleContact = async (skill) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setModal({
        show: true,
        type: 'login',
        message: 'Please login to contact this professional'
      });
      return;
    }
    setContactingSkillId(skill.SKILL_ID);
    try {
      await axios.post(`${API_BASE_URL}/api/requests`, {
        receiverId: skill.USER_ID,
        skillId: skill.SKILL_ID,
        message: `I am interested in your ${skill.SKILL_NAME} service`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModal({
        show: true,
        type: 'success',
        message: `Your request has been sent to ${skill.NAME} successfully! They will respond via their dashboard.`
      });
    } catch (err) {
      setModal({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'Failed to send request. Please try again.'
      });
    }
    setContactingSkillId(null);
  };

  const filtered = skills.filter(skill => {
    const matchCategory = category ? skill.CATEGORY === category : true;
    const kw = keyword.trim().toLowerCase();
    const matchKeyword = kw
      ? skill.SKILL_NAME?.toLowerCase().includes(kw) ||
        skill.DESCRIPTION?.toLowerCase().includes(kw) ||
        skill.NAME?.toLowerCase().includes(kw) ||
        skill.LOCATION?.toLowerCase().includes(kw)
      : true;
    return matchCategory && matchKeyword;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedSkills = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
            {modal.type === 'success' && (
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Request Sent Successfully!
                </h3>
                <p className="text-gray-500 mb-2">{modal.message}</p>
                <p className="text-sm text-gray-400 mb-6">
                  You can track your request status in your Dashboard.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal({ show: false })}
                    className="flex-1 border border-gray-200 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">
                    Close
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800">
                    View Dashboard
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'login' && (
              <div className="text-center">
                <div className="text-5xl mb-4">🔐</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Login Required
                </h3>
                <p className="text-gray-500 mb-6">{modal.message}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModal({ show: false })}
                    className="flex-1 border border-gray-200 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800">
                    Login
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'error' && (
              <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Something Went Wrong
                </h3>
                <p className="text-gray-500 mb-6">{modal.message}</p>
                <button
                  onClick={() => setModal({ show: false })}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-green-800 w-full">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-primary text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Browse Skills</h1>
        <p className="text-green-100">Find the perfect professional for your needs</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* AI Search */}
        <div className="bg-white rounded-2xl border border-green-100 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-primary mb-3">
            🤖 AI-Powered Search
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Describe what you need... e.g. 'I need a math teacher'"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleAISearch}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800">
              AI Search
            </button>
          </div>
        </div>

        {/* AI Results */}
        {showAI && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">
                🤖 AI Recommendations
              </h2>
              <button
                onClick={() => setShowAI(false)}
                className="text-gray-500 hover:text-primary text-sm">
                Clear Results
              </button>
            </div>
            {aiLoading ? (
              <div className="text-center py-10 text-gray-500">
                AI analyzing your request...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {recommendations.map((skill, index) => (
                  <div key={index}
                    className="h-full flex flex-col bg-white rounded-xl shadow-sm border-2 border-primary overflow-hidden">
                    {skill.IMAGE_URL && (
                      <img src={`${API_BASE_URL}${skill.IMAGE_URL}`} alt={skill.SKILL_NAME} className="w-full h-40 object-cover shrink-0" />
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <span className="bg-green-100 text-primary px-3 py-1 rounded-full text-sm font-medium shrink-0">
                          {skill.CATEGORY}
                        </span>
                        <span className="text-primary font-bold text-right shrink-0">
                          Rs. {skill.HOURLY_RATE}/hr
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2">
                        {skill.SKILL_NAME}
                      </h3>
                      <div className="mb-3">
                        {Number(skill.REVIEW_COUNT) > 0 ? (
                          <button onClick={() => setReviewsFor({ userId: skill.USER_ID, name: skill.NAME })}
                            className="hover:underline">
                            <StarRating rating={skill.AVG_RATING} count={skill.REVIEW_COUNT} />
                          </button>
                        ) : (
                          <StarRating rating={skill.AVG_RATING} count={skill.REVIEW_COUNT} />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                        {skill.DESCRIPTION}
                      </p>
                      <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-gray-50">
                        <div className="flex items-center gap-2 min-w-0">
                          {skill.PROVIDER_AVATAR ? (
                            <img src={`${API_BASE_URL}${skill.PROVIDER_AVATAR}`} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-green-100 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {skill.NAME?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">{skill.NAME}</p>
                            <p className="text-sm text-gray-500 truncate">{skill.LOCATION}</p>
                          </div>
                        </div>
                        {skill.USER_ID === currentUserId ? (
                          <span className="text-xs text-gray-400 italic shrink-0">Your skill</span>
                        ) : (
                          <button
                            onClick={() => handleContact(skill)}
                            disabled={contactingSkillId === skill.SKILL_ID}
                            className="shrink-0 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60">
                            {contactingSkillId === skill.SKILL_ID ? 'Sending...' : 'Contact'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search by skill, provider or location..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 min-w-[240px] border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary">
            <option value="">All Categories</option>
            <option value="Teaching">Teaching</option>
            <option value="Technical">Technical</option>
            <option value="Design">Design</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>

        {/* All Skills */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary">All Skills</h2>
          {!loading && filtered.length > 0 && (
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
          )}
        </div>
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading skills...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No skills match your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {paginatedSkills.map((skill) => (
              <div key={skill.SKILL_ID}
                className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden hover:shadow-md hover:border-primary transition-all">
                {skill.IMAGE_URL && (
                  <img src={`${API_BASE_URL}${skill.IMAGE_URL}`} alt={skill.SKILL_NAME} className="w-full h-40 object-cover shrink-0" />
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="bg-green-100 text-primary px-3 py-1 rounded-full text-sm font-medium shrink-0">
                      {skill.CATEGORY}
                    </span>
                    <span className="text-primary font-bold text-right shrink-0">
                      Rs. {skill.HOURLY_RATE}/hr
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2">
                    {skill.SKILL_NAME}
                  </h3>
                  <div className="mb-3">
                    {Number(skill.REVIEW_COUNT) > 0 ? (
                      <button onClick={() => setReviewsFor({ userId: skill.USER_ID, name: skill.NAME })}
                        className="hover:underline">
                        <StarRating rating={skill.AVG_RATING} count={skill.REVIEW_COUNT} />
                      </button>
                    ) : (
                      <StarRating rating={skill.AVG_RATING} count={skill.REVIEW_COUNT} />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                    {skill.DESCRIPTION}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-gray-50">
                    <div className="flex items-center gap-2 min-w-0">
                      {skill.PROVIDER_AVATAR ? (
                        <img src={`${API_BASE_URL}${skill.PROVIDER_AVATAR}`} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-green-100 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {skill.NAME?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{skill.NAME}</p>
                        <p className="text-sm text-gray-500 truncate">{skill.LOCATION}</p>
                      </div>
                    </div>
                    {skill.USER_ID === currentUserId ? (
                      <span className="text-xs text-gray-400 italic shrink-0">Your skill</span>
                    ) : (
                      <button
                        onClick={() => handleContact(skill)}
                        disabled={contactingSkillId === skill.SKILL_ID}
                        className="shrink-0 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60">
                        {contactingSkillId === skill.SKILL_ID ? 'Sending...' : 'Contact'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentPage === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">
              Next
            </button>
          </div>
        )}
      </div>

      <footer className="bg-primary text-green-100 text-center py-6 mt-8">
        <p>2026 SkillBridge - Connecting Communities</p>
      </footer>

      {reviewsFor && (
        <ReviewsModal
          userId={reviewsFor.userId}
          providerName={reviewsFor.name}
          onClose={() => setReviewsFor(null)}
        />
      )}
    </div>
  );
}

export default Skills;