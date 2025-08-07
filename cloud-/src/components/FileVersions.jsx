import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';

const FileVersions = ({ objectKey }) => {
  const [versions, setVersions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowVersions = async () => {
    if (show) {
      setShow(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/list-versions`,
        {
          params: {
            workspaceId: objectKey.split('/')[0],
            objectKey,
          },
        }
      );
      setVersions(res.data.versions || []);
      setShow(true);
    } catch (err) {
      console.error('❌ Failed to fetch versions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (versionId) => {
    try {
      const res = await axiosInstance.get(
        `https://2nyk16bq5g.execute-api.us-east-2.amazonaws.com/download-version`,
        {
          params: {
            workspaceId: objectKey.split('/')[0],
            objectKey,
            versionId,
          },
        }
      );

      const link = document.createElement('a');
      link.href = res.data.downloadUrl;
      link.download = objectKey.split('/').pop();
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('❌ Download failed', err);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={toggleShowVersions}
        className="text-blue-600 hover:underline text-sm"
      >
        {show ? 'Hide Versions' : 'Show Versions'}
      </button>

      {loading && (
        <p className="text-xs text-gray-500 mt-1">Loading versions...</p>
      )}

      {show && versions.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm pl-4">
          {versions.map((v) => (
            <li
              key={v.versionId}
              className="flex items-center justify-between gap-2 bg-gray-100 px-2 py-1 rounded"
            >
              <div className="flex flex-col">
                <span className="truncate">
                  📄 {new Date(v.lastModified).toLocaleString()} — {(v.size / 1024).toFixed(1)} KB
                  {v.tags && v.tags.length > 0 && (
                    <span className="ml-2 text-gray-600 italic">
                      [{v.tags.join(', ')}]
                    </span>
                  )}
                </span>
                {v.uploaderEmail && (
                  <span className="text-gray-500 text-xs">
                    Uploaded by: <span className="font-mono">{v.uploaderEmail}</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => handleDownload(v.versionId)}
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}

      {show && versions.length === 0 && !loading && (
        <p className="text-xs text-gray-500 mt-1">No previous versions found.</p>
      )}
    </div>
  );
};

export default FileVersions;
