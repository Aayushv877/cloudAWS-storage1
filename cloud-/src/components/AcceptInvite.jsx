// src/components/AcceptInvite.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAuthSession } from '@aws-amplify/auth';
import axiosInstance from '../axiosInstance';
import axios from 'axios';

const AcceptInvite = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Checking...');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const acceptInvite = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('❌ Invalid invite link.');
        return;
      }

      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        const res = await axios.get(
          `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/accept-invite?token=${token}`,
          {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (res.status === 200) {
          setSuccess(true);
          setStatus('✅ You have successfully joined the workspace!');
          setTimeout(() => navigate('/my-workspaces'), 3000);
        } else {
          setStatus('❌ Failed to accept invite.');
        }
      } catch (err) {
        console.error(err);
        setStatus('❌ Invite is invalid or expired.');
      }
    };

    acceptInvite();
  }, [location, navigate]);

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Accepting Invite</h2>
      <p className="text-lg">{status}</p>
      {success && <p className="text-sm mt-2 text-gray-500">Redirecting to dashboard...</p>}
    </div>
  );
};

export default AcceptInvite;
