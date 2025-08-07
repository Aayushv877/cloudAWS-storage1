// src/App.js
// src/App.js
import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@aws-amplify/auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import CreateWorkspaceForm from './components/CreateWorkspaceForm';
import MyWorkspaces from './components/MyWorkspaces'; // (optional for now)
import WorkspaceDetail from './components/WorkspaceDetail';
import AcceptInvite from './components/AcceptInvite';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  return (
  <Routes>
    <Route path="/create-workspace" element={<CreateWorkspaceForm />} />
    <Route path="/my-workspaces" element={<MyWorkspaces />} />
    <Route path="/workspace/:id" element={<WorkspaceDetail />} />
    <Route path="/invite" element={<AcceptInvite />} />
    <Route path="/*" element={<Dashboard user={user} onSignOut={signOut} />} />
  </Routes>
);

}

export default App;

