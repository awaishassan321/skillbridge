import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const POLL_INTERVAL_MS = 4000;

// The message list + composer for one request's conversation. No header/chrome —
// ChatModal wraps this in a popup, Messages wraps it in an inbox layout.
function ChatThread({ requestId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/requests/${requestId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    }
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    setLoading(true);
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
        `${API_BASE_URL}/api/requests/${requestId}/messages`,
        { body: input.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data.message]);
      setInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-light">
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
                  <p className="whitespace-pre-wrap break-words">{msg.BODY}</p>
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
      <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2 shrink-0">
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
  );
}

export default ChatThread;
