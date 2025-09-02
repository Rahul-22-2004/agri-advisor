// src/components/Auth.jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth.js";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      login(res.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        email,
        password,
      });
      setActiveTab("login"); // Redirect to login tab after signup
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-green-200 p-8 transition-all duration-300 hover:scale-[1.02]">
        {/* Tabs */}
        <div className="flex justify-between mb-6">
          <button
            className={`flex-1 py-3 text-lg font-semibold rounded-t-xl transition-all duration-300 ${
              activeTab === "login"
                ? "bg-green-500 text-white shadow-md"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 text-lg font-semibold rounded-t-xl transition-all duration-300 ${
              activeTab === "signup"
                ? "bg-green-500 text-white shadow-md"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={activeTab === "login" ? handleLogin : handleSignup}
          className="space-y-5 transition-all duration-500 ease-in-out"
        >
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3 text-green-600" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 pl-10 rounded-xl border border-green-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-green-600" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 pl-10 pr-10 rounded-xl border border-green-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {/* {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />} */}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-lg shadow-sm text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300"
          >
            {activeTab === "login" ? (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-5">
          {activeTab === "login" ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setActiveTab("signup")}
                className="text-green-600 font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setActiveTab("login")}
                className="text-green-600 font-semibold hover:underline cursor-pointer"
              >
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
