import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function ReviewsModal({ userId, providerName, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reviews/${userId}`);
        setReviews(res.data.reviews);
      } catch (err) {
        setError('Failed to load reviews.');
      }
      setLoading(false);
    };
    fetchReviews();
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="bg-primary text-white px-6 py-4 rounded-t-2xl flex justify-between items-center shrink-0">
          <h3 className="font-bold">Reviews for {providerName}</h3>
          <button onClick={onClose} className="text-white hover:text-red-200 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">Loading reviews...</p>
          ) : error ? (
            <p className="text-center text-red-500 text-sm py-8">{error}</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.REVIEW_ID} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-gray-800">{r.REVIEWER_NAME}</p>
                  <span className="text-yellow-500 text-sm shrink-0">
                    {'★'.repeat(r.RATING)}{'☆'.repeat(5 - r.RATING)}
                  </span>
                </div>
                {r.COMMENT && <p className="text-gray-600 text-sm mt-1">{r.COMMENT}</p>}
                <p className="text-xs text-gray-400 mt-1">{r.CREATED_AT}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewsModal;
