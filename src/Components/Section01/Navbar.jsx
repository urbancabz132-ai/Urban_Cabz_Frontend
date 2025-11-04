import React, { useState } from "react";
import LoginModal from "../Section01/Login_SignUp_Model";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* Keep your same glass navbar look */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] z-50 bg-white/40 backdrop-blur-2xl border border-white/30 shadow-xl rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Logo / Brand */}
          <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Urban <span className="text-yellow-500">Cabz</span>
          </h4>

          {/* Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2 rounded-xl border border-gray-800/70 text-gray-800 font-medium hover:bg-gray-900 hover:text-white hover:scale-105 transition-all duration-300 shadow-sm">
              Register Taxi
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="px-5 py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-yellow-500 hover:text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu (fix for accessibility) */}
          <div className="md:hidden flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg border border-gray-800/70 text-gray-800 font-medium hover:bg-gray-900 hover:text-white transition">
              Register
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="px-3 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-yellow-500 hover:text-gray-900 transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
