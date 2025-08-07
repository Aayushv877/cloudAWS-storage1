import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from '@aws-amplify/auth';


const CreateWorkspaceForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Get current session and ID token
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const response = await fetch('https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Workspace created! ID: ${data.workspaceId}`);
        setName('');
      } else {
        setMessage(data.message || 'Error creating workspace.');
      }

    } catch (err) {
      console.error('Error:', err);
      setMessage('Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create a New Workspace</h2>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          placeholder="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Workspace'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default CreateWorkspaceForm;
