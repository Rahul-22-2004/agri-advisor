import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth.js";
import axiosInstance from "../utils/axiosInstance";
import { AlertTriangle, Clock, Trash2 } from "lucide-react";

const History = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const { token } = useAuth();

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        setError("Please log in to view your advice history.");
        setLoading(false);
        return;
      }
      const res = await axiosInstance.get(`/api/history?offset=${offset}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistories(res.data.histories);
      setTotal(res.data.total);
    } catch (err) {
      console.error("History Error:", err.response?.data || err.message);
      setError(err.response?.status === 401
        ? "Please log in to view your advice history."
        : err.response?.data?.error || "Failed to fetch history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advice history?")) return;
    try {
      await axiosInstance.delete(`/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistories(histories.filter((history) => history._id !== id));
      setTotal(total - 1);
      setError("");
    } catch (err) {
      console.error("Delete History Error:", err.response?.data || err.message);
      setError(err.response?.status === 401
        ? "Please log in to delete advice history."
        : err.response?.data?.error || "Failed to delete history. Please try again.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [offset, token]);

  const handleNext = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const handlePrev = () => {
    if (offset > 0) {
      setOffset(offset - limit);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-purple-200 p-8">
        <h2 className="text-3xl font-extrabold text-purple-700 mb-6 text-center">
          📜 Advice History
        </h2>
        {loading && (
          <div className="flex justify-center my-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg border border-red-300 mb-4 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {histories.length === 0 && !loading && !error && (
          <p className="text-center text-gray-600">No advice history found.</p>
        )}
        {histories.length > 0 && (
          <div className="space-y-4">
            {histories.map((history, index) => (
              <div
                key={history._id || index}
                className="relative bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-sm"
              >
                <div className="absolute left-4 top-4 w-2 h-2 bg-purple-600 rounded-full"></div>
                <div className="ml-8 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(history.queriedAt).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 font-semibold">Query: {history.query}</p>
                    <p className="text-gray-600">Response: {history.response}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(history._id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                    title="Delete this history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {total > limit && (
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={offset === 0}
              className={`px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 ${
                offset === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={offset + limit >= total}
              className={`px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 ${
                offset + limit >= total ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;