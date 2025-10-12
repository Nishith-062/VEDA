import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Online from "./Online";
import Languageselector from "../pages/Languageselector";
import DropDownhover from "./DropDownhover";

const Navbar = ({ authUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left - Logo + Brand */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpg"
              alt="VEDA"
              className="h-9 w-9 rounded-md object-cover"
            />
            <span className="text-lg font-semibold text-gray-800">VEDA</span>
          </div>

          {/* Right - User Dropdown + Other items */}
          <div className="flex items-center gap-2">
            <Online />
            <Languageselector />

            {/* User Dropdown */}
            <div className="relative">
              {authUser ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex justify-center items-center h-9 w-9 bg-amber-950 hover:bg-amber-900 cursor-pointer text-md font-medium rounded-full transition"
                  >
                    <span className="text-amber-100">{authUser.fullName.slice(0,1).toUpperCase()}</span>

                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-md py-1 flex flex-col">
                      <span className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{authUser.fullName}</span>
                      <button
                        onClick={() => {
                          useAuthStore.getState().logout();
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 cursor-pointer py-2 text-sm text-red-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}

                </>
              ) : (
                <span className="text-gray-600 text-sm">Not Logged In</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
