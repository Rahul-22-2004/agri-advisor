// src/components/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  CloudSun,
  Bot,
  DollarSign,
  Leaf,
  History,
  ArrowRight,
} from "lucide-react";

const Home = () => {
  const services = [
    {
      title: "Advice",
      path: "/advice",
      description: "Get personalized agricultural guidance.",
      icon: <Bot className="w-8 h-8 text-green-600" />,
      color: "from-green-200 to-green-50",
    },
    {
      title: "Weather",
      path: "/weather",
      description: "Check real-time weather forecasts.",
      icon: <CloudSun className="w-8 h-8 text-blue-600" />,
      color: "from-blue-200 to-blue-50",
    },
    {
      title: "Prices",
      path: "/prices",
      description: "View latest crop market prices.",
      icon: <DollarSign className="w-8 h-8 text-yellow-600" />,
      color: "from-yellow-200 to-yellow-50",
    },
    {
      title: "Identify",
      path: "/identify",
      description: "Scan plants or pests for instant detection.",
      icon: <Leaf className="w-8 h-8 text-green-700" />,
      color: "from-green-300 to-green-100",
    },
    {
      title: "History",
      path: "/history",
      description: "View your previous queries and results.",
      icon: <History className="w-8 h-8 text-purple-600" />,
      color: "from-purple-200 to-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col items-center justify-center p-6">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-3 drop-shadow-md">
          🌿 Welcome to Agri-Advisor
        </h1>
        <p className="text-lg text-gray-600">
          Your AI-powered assistant for smarter farming decisions.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
        {services.map((service, index) => (
          <Link
            key={index}
            to={service.path}
            className="group transform transition duration-300 hover:scale-105"
          >
            <div
              className={`bg-gradient-to-br ${service.color} backdrop-blur-xl shadow-xl rounded-2xl border border-gray-200 p-6 hover:shadow-2xl transition duration-300`}
            >
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                {service.icon}
              </div>
              {/* Title */}
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                {service.title}
              </h2>
              {/* Description */}
              <p className="text-gray-600 text-center">{service.description}</p>

              {/* Button */}
              <div className="flex justify-center mt-5">
                <span className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-600 transition">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Agri-Advisor. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
