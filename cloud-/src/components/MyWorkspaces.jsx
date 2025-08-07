import React, { useEffect, useState } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { Link, useNavigate } from 'react-router-dom';

const MyWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        const response = await fetch('https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspaces', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setWorkspaces(data.workspaces || []);
        } else {
          setError(data.message || 'Failed to load workspaces');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching workspaces');
      }
      setLoading(false);
    };

    fetchWorkspaces();
  }, []);

  const handleDelete = async (workspaceId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this workspace? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const response = await fetch(
        `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/delete-workspaces/${workspaceId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.ok) {
        setWorkspaces(prev => prev.filter(w => w.workspaceId !== workspaceId));
        alert('Workspace deleted successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete workspace');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting workspace');
    }
  };

  if (loading) return <p className="text-gray-600">Loading workspaces...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-bold mb-4">My Workspaces</h2>
      {workspaces.length === 0 ? (
        <p className="text-gray-500">You are not a member of any workspaces.</p>
      ) : (
        <ul className="space-y-4">
          {workspaces.map(ws => (
            <li key={ws.workspaceId} className="border p-4 rounded hover:bg-gray-50 transition">
              <Link to={`/workspace/${ws.workspaceId}`}>
                <h3 className="text-lg font-semibold text-blue-600 hover:underline">{ws.name}</h3>
              </Link>
              <p className="text-sm text-gray-600">Role: {ws.role}</p>
              <p className="text-sm text-gray-600">Created: {new Date(ws.createdAt).toLocaleString()}</p>

              {ws.role === 'owner' && (
                <button
                  className="mt-2 text-red-600 hover:underline text-sm"
                  onClick={() => handleDelete(ws.workspaceId)}
                >
                  Delete Workspace
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyWorkspaces;
