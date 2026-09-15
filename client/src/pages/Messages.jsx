import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatThread from '../components/ChatThread';
import { API_BASE_URL } from '../config';

const POLL_INTERVAL_MS = 8000;

function Messages() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);
  const navigate = useNavigate();

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/requests/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data.conversations);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchConversations();
    const interval = setInterval(fetchConversations, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeConversation = conversations.find(c => c.REQUEST_ID === activeId);

  const openConversation = (id) => {
    setActiveId(id);
    setShowThreadOnMobile(true);
  };

  return (
    <div className="min-h-screen bg-light flex flex-col">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <h1 className="text-3xl font-bold text-primary mb-6">Messages</h1>

        <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] overflow-hidden" style={{ minHeight: '32rem' }}>

          {/* Conversation list */}
          <div className={`border-r border-gray-100 overflow-y-auto ${showThreadOnMobile ? 'hidden md:block' : 'block'}`}>
            {loading ? (
              <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
            ) : conversations.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10 px-4">
                No conversations yet. Chat unlocks once a request is accepted.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.REQUEST_ID}
                  onClick={() => openConversation(c.REQUEST_ID)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 flex items-center gap-3 transition-all hover:bg-light ${
                    activeId === c.REQUEST_ID ? 'bg-light' : ''
                  }`}>
                  {c.OTHER_USER_AVATAR ? (
                    <img src={`${API_BASE_URL}${c.OTHER_USER_AVATAR}`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-maroon-100 text-primary flex items-center justify-center font-bold shrink-0">
                      {c.OTHER_USER_NAME?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="font-medium text-gray-800 truncate">{c.OTHER_USER_NAME}</p>
                      {c.STATUS === 'completed' && (
                        <span className="text-[10px] text-blue-600 shrink-0">Completed</span>
                      )}
                    </div>
                    <p className="text-xs text-primary truncate">{c.SKILL_NAME}</p>
                    <p className="text-xs text-gray-400 truncate">{c.LAST_MESSAGE || 'No messages yet'}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Active thread */}
          <div className={`flex flex-col min-h-0 ${showThreadOnMobile ? 'flex' : 'hidden md:flex'}`}>
            {activeConversation ? (
              <>
                <div className="bg-primary text-white px-6 py-4 flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setShowThreadOnMobile(false)}
                    className="md:hidden text-white hover:text-red-200">
                    ←
                  </button>
                  <div>
                    <h3 className="font-bold">{activeConversation.OTHER_USER_NAME}</h3>
                    <p className="text-xs text-red-100">{activeConversation.SKILL_NAME}</p>
                  </div>
                </div>
                <ChatThread requestId={activeConversation.REQUEST_ID} currentUserId={user?.id} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
