import React, { useEffect, useState } from "react";
import axios from "../axiosInstance";
import { fetchAuthSession } from '@aws-amplify/auth';


const UploadSection = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");



  // Fetch all workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await axios.get("https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/workspaces", {
          withCredentials: true,
        });
        setWorkspaces(res.data);
      } catch (err) {
        console.error("Error fetching workspaces:", err);
      }
    };
    fetchWorkspaces();
  }, []);

  const handleUpload = async () => {
    if (!file || !selectedWorkspace) {
      setMessage("Please select a file and workspace.");
      return;
    }

    try {
      // Request pre-signed URL
      const res = await axios.post(
        "https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/generate-upload-url",
        {
          fileName: file.name,
          workspaceId: selectedWorkspace.workspaceId,
        },
        { withCredentials: true }
      );

      const { uploadUrl } = res.data;
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          Authorization: `Bearer ${idToken}`,
        },
      });

      setMessage("✅ File uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("❌ Upload failed.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4">Upload File to Workspace</h2>

      {/* Workspace selection */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Select Workspace
        </label>
        <select
          className="w-full border p-2 rounded"
          onChange={(e) => {
            const ws = workspaces.find((w) => w.workspaceId === e.target.value);
            setSelectedWorkspace(ws);
            setMessage("");
          }}
        >
          <option value="">-- Choose --</option>
          {workspaces.map((ws) => (
            <option key={ws.workspaceId} value={ws.workspaceId}>
              {ws.name} ({ws.role})
            </option>
          ))}
        </select>
      </div>

      {/* Upload section shown only if workspace is selected */}
      {selectedWorkspace && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2 text-gray-800">
            Upload to: <span className="text-blue-600">{selectedWorkspace.name}</span>
          </h3>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4"
          />

          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload File
          </button>

          {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default UploadSection;
