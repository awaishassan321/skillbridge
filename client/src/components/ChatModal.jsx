import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const POLL_INTERVAL_MS = 4000;

function ChatModal({ request, currentUserId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const otherPartyName = currentUserId === request.SENDER_ID ? request.RECEIVER_NAME : request.SENDER_NAME;

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/requests/${request.REQUEST_ID}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    }
    setLoading(false);
  }, [request.REQUEST_ID]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/requests/${request.REQUEST_ID}/messages`,
        { body: input.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, { ...res.data.message, SENDER_NAME: 'You' }]);
      setInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col" style={{ height: '32rem' }}>
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="font-bold">{otherPartyName}</h3>
            <p className="text-xs text-red-100">{request.SKILL_NAME}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-200 text-xl leading-none">×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-light">
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-10">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">No messages yet. Say hello! 👋</div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.SENDER_ID === currentUserId;
              return (
                <div key={msg.MESSAGE_ID} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                  }`}>
                    <p>{msg.BODY}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-red-100' : 'text-gray-400'}`}>
                      {msg.CREATED_AT?.slice(5, 16)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">{error}</div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatModal;
