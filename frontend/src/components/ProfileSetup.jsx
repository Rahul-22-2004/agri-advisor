import { useState, useEffect } from "react";
import axios from "axios";
import { User, MapPin, Leaf, Wheat, CheckCircle2, AlertCircle } from "lucide-react";

const ProfileSetup = ({ userId }) => {
  const [location, setLocation] = useState("");
  const [soilType, setSoilType] = useState("");
  const [crops, setCrops] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setLocation(res.data.location || "");
        setSoilType(res.data.soilType || "");
        setCrops(res.data.crops.join(", ") || "");
      } catch (err) {
        if (err.response?.status === 404)
          setMessage("No profile found. Create one below.");
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/users/", {
        userId,
        location,
        soilType,
        crops: crops.split(",").map((c) => c.trim()),
      });
      setMessage("Profile saved successfully!");
    } catch (err) {
      setMessage("Error saving profile",err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl border border-green-200 p-8 transition-transform duration-300 hover:scale-[1.02]">
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <User className="w-7 h-7 text-green-600" />
          <h2 className="text-3xl font-extrabold text-green-700">
            🌿 Farm Profile Setup
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-green-600" />
              <label className="text-sm font-semibold text-gray-700">
                Location
              </label>
            </div>
            <input
              className="w-full p-3 rounded-xl border border-green-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              placeholder="e.g., Jaipur, Rajasthan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Soil Type */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-5 h-5 text-green-600" />
              <label className="text-sm font-semibold text-gray-700">
                Soil Type
              </label>
            </div>
            <input
              className="w-full p-3 rounded-xl border border-green-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              placeholder="e.g., Sandy Loam"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
            />
          </div>

          {/* Crops */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wheat className="w-5 h-5 text-green-600" />
              <label className="text-sm font-semibold text-gray-700">
                Crops
              </label>
            </div>
            <input
              className="w-full p-3 rounded-xl border border-green-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              placeholder="e.g., Wheat, Maize"
              value={crops}
              onChange={(e) => setCrops(e.target.value)}
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "💾 Save Profile"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-5 flex items-center gap-2 justify-center text-center px-4 py-3 rounded-xl shadow-inner ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-600 border border-red-300"
            }`}
          >
            {message.includes("successfully") ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
