// src/LoginPage.js
import React, { useEffect } from 'react';
import { getCurrentUser, signInWithRedirect } from '@aws-amplify/auth';

const LoginPage = () => {
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        await getCurrentUser();
        // If this succeeds, user is already signed in — do nothing.
      } catch {
        // Not signed in — redirect to Hosted UI
        await signInWithRedirect();
      }
    };

    checkUserAndRedirect();
  }, []);

  return <p>Redirecting to Cognito login...</p>;
};

export default LoginPage;
