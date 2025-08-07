import React from "react";
import { Menu } from "lucide-react";

const Header = ({ toggleMenu }) => {
  return (
    <div className="flex items-center mb-4">
      <button
        onClick={toggleMenu}
        className="p-2 bg-white border rounded-md shadow-md hover:bg-gray-200"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-2xl font-bold text-gray-800 ml-4">Cloud File Storage</h1>
    </div>
  );
};

export default Header;
