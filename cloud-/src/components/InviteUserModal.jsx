// src/components/InviteUserModal.jsx
import React, { useState } from 'react';

const InviteUserModal = ({ isOpen, onClose, onInvite, loading }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onInvite(email, role);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Invite User to Workspace</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">User Email</label>
            <input
              type="email"
              required
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
