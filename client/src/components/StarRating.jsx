import React from 'react';

function StarRating({ rating, count }) {
  const numRating = parseFloat(rating) || 0;
  if (!count || count === '0' || count === 0) {
    return <span className="text-xs text-gray-400">No reviews yet</span>;
  }
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-500 text-sm">
        {'★'.repeat(Math.round(numRating))}{'☆'.repeat(5 - Math.round(numRating))}
      </span>
      <span className="text-xs text-gray-500">{numRating.toFixed(1)} ({count})</span>
    </div>
  );
}

export default StarRating;
