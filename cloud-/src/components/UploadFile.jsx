// src/components/UploadFile.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

const UploadFile = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState("");

  // Load user's workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await axiosInstance.get("https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspaces");
        setWorkspaces(res.data);
      } catch (err) {
        console.error("Failed to load workspaces:", err);
      }
    };

    fetchWorkspaces();
  }, []);

  const handleUpload = async () => {
    if (!selectedWorkspace || !file) {
      setMessage("Please select a workspace and a file.");
      return;
    }

    setMessage("Generating upload URL...");

    try {
      // Step 1: Get pre-signed upload URL from backend
      const res = await axiosInstance.post("https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/generate-upload-url", {
        workspaceId: selectedWorkspace,
        fileName: file.name,
        contentType: file.type,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      });

      const { uploadUrl, s3Key } = res.data;

      setMessage("Uploading to S3...");

      // Step 2: Upload to S3 using the signed URL
      await axiosInstance.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      setMessage(`✅ File uploaded successfully as ${s3Key}`);
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("❌ Upload failed.");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded max-w-xl mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4">Upload File</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Workspace</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedWorkspace}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
        >
          <option value="">-- Choose --</option>
          {workspaces.map((ws) => (
            <option key={ws.workspaceId} value={ws.workspaceId}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select File</label>
        <input
          type="file"
          className="w-full"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <div className="mb-4">
  <label className="block mb-1 font-medium">Tags (comma separated)</label>
  <input
    type="text"
    className="w-full"
    value={tags}
    onChange={(e) => setTags(e.target.value)}
    placeholder="e.g. design,figma,v2"
  />
</div>


      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!file || !selectedWorkspace}
      >
        Upload
      </button>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default UploadFile;
