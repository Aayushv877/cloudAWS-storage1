// src/components/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ menuOpen }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 ${
        menuOpen ? "w-48 p-4" : "w-0 p-0"
      } overflow-hidden`}
    >
      {menuOpen && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/create-workspace")}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-left"
          >
            Create Workspace
          </button>
          <button
            onClick={() => navigate("/my-workspaces")}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-left"
          >
            My Workspaces
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
