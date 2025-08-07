// src/components/WorkspaceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import { fetchAuthSession } from '@aws-amplify/auth';
import FileVersions from './FileVersions';
import InviteUserModal from './InviteUserModal';

const WorkspaceDetail = () => {
  const { id: workspaceId } = useParams();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [workspaceName, setWorkspaceName] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [role, setRole] = useState('');
  const [scope, setScope] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [tagsInput, setTagsInput] = useState('');

    const [continuationToken, setContinuationToken] = useState({ keyMarker: null, versionIdMarker: null });


  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
  if (!selectedFile) return;

  setUploading(true);
  setMessage('');

  try {
    // Prepare tags
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Step 1: Get presigned upload URL
    const res = await axiosInstance.post(
      'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/generate-upload-url',
      {
        workspaceId,
        fileName: selectedFile.name,
        contentType: selectedFile.type,
      }
    );

    const { uploadUrl, objectKey } = res.data;

    if (!uploadUrl || !objectKey) {
      console.error("❌ Missing uploadUrl or objectKey in response:", res.data);
      throw new Error("Missing uploadUrl or objectKey");
    }

    // Step 2: Upload to S3
    await axios.put(uploadUrl, selectedFile, {
      headers: { 'Content-Type': selectedFile.type },
    });

    // Step 3: Fetch version ID
    const versionRes = await axiosInstance.get(
      `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/get-version-id?objectKey=${encodeURIComponent(objectKey)}`
    );

    const versionId = versionRes.data.versionId;
    if (!versionId) {
      console.error("❌ Missing versionId from response", versionRes.data);
      throw new Error("Missing versionId");
    }

    // Step 4: Record metadata
    await axiosInstance.post(
      'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/record-file-metadata',
      {
        workspaceId,
        objectKey,
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        size: selectedFile.size,
        tags,
        versionId,
      }
    );

    setMessage(`✅ File uploaded: ${selectedFile.name}`);
    setSelectedFile(null);
    setTagsInput('');
    fetchFiles();
  } catch (err) {
    console.error('Upload error:', err);
    if (err.response?.data?.message) {
      setMessage(`❌ Upload failed: ${err.response.data.message}`);
    } else {
      setMessage('❌ Upload failed');
    }
  } finally {
    setUploading(false);
  }
};



  const getOriginalFileName = (key) => {
    const nameWithUUID = key.split('/').pop();
    const idx = nameWithUUID.indexOf('_');
    return idx !== -1 ? nameWithUUID.slice(idx + 1) : nameWithUUID;
  };

  const handleInvite = async (email, role) => {
    setInviteLoading(true);
    setInviteMessage('');

    try {
      await fetchAuthSession(); // token not used here but may be needed for headers

      const res = await axiosInstance.post(
        'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/invite-user',
        {
          workspaceId,
          email,
          role,
        }
      );

      setInviteMessage(
        res.status === 200
          ? '✅ Invitation sent successfully.'
          : '❌ Failed to send invite.'
      );
    } catch (err) {
      console.error(err);
      setInviteMessage('❌ Error sending invite.');
    } finally {
      setInviteLoading(false);
      setInviteOpen(false);
    }
  };


const fetchFiles = async (token = {}, append = false) => {
  try {
    const queryParams = new URLSearchParams({
      workspaceId,
      scope,
    });

    if (token.keyMarker && token.versionIdMarker) {
      queryParams.append('keyMarker', token.keyMarker);
      queryParams.append('versionIdMarker', token.versionIdMarker);
    }

    const url = `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/list-files?${queryParams.toString()}`;
    const res = await axiosInstance.get(url);

    const newFiles = res.data.files || [];
    setFiles(prev => (append ? [...prev, ...newFiles] : newFiles));

    if (res.data.nextKeyMarker && res.data.nextVersionIdMarker) {
      setContinuationToken({
        keyMarker: res.data.nextKeyMarker,
        versionIdMarker: res.data.nextVersionIdMarker,
      });
      setHasMore(true);
    } else {
      setContinuationToken({ keyMarker: null, versionIdMarker: null });
      setHasMore(false);
    }
  } catch (err) {
    console.error("❌ Failed to fetch files:", err);
  }
};




  useEffect(() => {
    const fetchWorkspaceName = async () => {
      try {
        const res = await axiosInstance.get(
          'https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspaces'
        );

        const allWorkspaces = res.data.workspaces || [];
        const matched = allWorkspaces.find((w) => w.workspaceId === workspaceId);
        setWorkspaceName(matched?.name || workspaceId);
      } catch (err) {
        console.error('Failed to load workspace name', err);
        setWorkspaceName(workspaceId);
      }
    };

    fetchWorkspaceName();
  }, [workspaceId]);

useEffect(() => {
  fetchFiles(); // first page, no token
}, [workspaceId, scope]);



  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axiosInstance.get(
          `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/user-role?workspaceId=${workspaceId}`
        );
        setRole(res.data.role);
      } catch (err) {
        console.error('❌ Failed to fetch user role', err);
        setRole('');
      }
    };

    fetchUserRole();
  }, [workspaceId]);

  useEffect(() => {
    const lower = searchText.toLowerCase();
    const results = files.filter(
      (file) =>
        file.key.toLowerCase().includes(lower) ||
        file.uploadedByEmail.toLowerCase().includes(lower)
    );
    setFilteredFiles(results);
  }, [searchText, files]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Workspace: {workspaceName}</h2>
      <p className="text-sm text-gray-500 mb-4">
        Your Role: <span className="font-medium capitalize">{role}</span>
      </p>

      {(role === 'admin' || role === 'Editor' || role === 'owner') && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Upload a File</h3>
          <input type="file" onChange={handleFileChange} className="mb-2" />
          <input
  type="text"
  placeholder="Enter tags (comma separated)"
  value={tagsInput}
  onChange={(e) => setTagsInput(e.target.value)}
  className="mb-2 w-full border border-gray-300 px-3 py-1 rounded text-sm"
/>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
        </div>
      )}

      {(role === 'admin' || role === 'owner') && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Invite Users</h3>
          <button
            onClick={() => setInviteOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Invite User
          </button>
          {inviteMessage && <p className="text-sm mt-2">{inviteMessage}</p>}
        </div>
      )}

      <InviteUserModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        loading={inviteLoading}
      />

      <div>
        <div className="mb-4">
          <label htmlFor="scope" className="mr-2 font-medium">
            Show:
          </label>
          <select
            id="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All Files</option>
            <option value="mine">My Files</option>
          </select>
        </div>

        <h3 className="text-lg font-semibold mb-2">Files</h3>
        {(searchText ? filteredFiles : files).length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {(searchText ? filteredFiles : files).map((file) => (
              <li key={file.key} className="bg-gray-100 p-2 rounded text-sm">
                <span className="font-semibold">
                  {getOriginalFileName(file.key)}
                </span>
                <span className="ml-2 text-gray-600 text-xs">
                  Uploaded by: {file.uploaderEmail || file.key.split('/')[1]}
                </span>
                <span className="ml-2 text-gray-600 text-xs">
                  • {(file.size / 1024).toFixed(1)} KB
                </span>
                <span className="ml-2 text-gray-600 text-xs">
                  • {new Date(file.lastModified).toLocaleString()}
                </span>
                {file.tags && file.tags.length > 0 && (
  <div className="mt-1 text-xs text-gray-600">
    Tags: {file.tags.join(', ')}
  </div>
)}


                <FileVersions objectKey={file.key} />
              </li>
            ))}
          </ul>
        )}
        {hasMore && (
  <button
    onClick={() =>
      fetchFiles(
        {
          keyMarker: continuationToken.keyMarker,
          versionIdMarker: continuationToken.versionIdMarker,
        },
        true
      )
    }
    className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
  >
    Load More
  </button>
)}


      </div>
    </div>
  );
};

export default WorkspaceDetail;
