import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CreateWorkspaceForm from './components/CreateWorkspaceForm';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar menuOpen={menuOpen} />

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <Header toggleMenu={toggleMenu} />
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Welcome{user?.username ? `, ${user.username}` : ''}.
        </h2>

        <div className="bg-white shadow rounded-lg p-6 mt-4">
          <h3 className="text-lg font-bold mb-2">Dashboard</h3>
          <p className="text-gray-700">You can now manage your files and workspaces here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
