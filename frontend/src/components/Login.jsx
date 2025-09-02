import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/useAuth.js";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      login(res.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-green-200 p-8 transition-all duration-300 hover:scale-[1.02]">
        {/* Title */}
        <div className="flex flex-col items-center mb-6">
          <LogIn className="w-10 h-10 text-green-600 mb-2" />
          <h2 className="text-3xl font-extrabold text-green-700">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">
            Login to access your Agri-Advisor account 🌿
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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
                autoComplete="email"
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
                autoComplete="current-password"
                className="w-full p-3 pl-10 pr-10 rounded-xl border border-green-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-lg shadow-sm text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300"
          >
            <LogIn className="w-5 h-5" />
            Login
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 text-sm mt-5">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;