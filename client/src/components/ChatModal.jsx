import React from 'react';
import ChatThread from './ChatThread';

function ChatModal({ request, currentUserId, onClose }) {
  const otherPartyName = currentUserId === request.SENDER_ID ? request.RECEIVER_NAME : request.SENDER_NAME;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col" style={{ height: '32rem' }}>
        <div className="bg-primary text-white px-6 py-4 rounded-t-2xl flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold">{otherPartyName}</h3>
            <p className="text-xs text-red-100">{request.SKILL_NAME}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-200 text-xl leading-none">×</button>
        </div>

        <ChatThread requestId={request.REQUEST_ID} currentUserId={currentUserId} />
      </div>
    </div>
  );
}

export default ChatModal;
