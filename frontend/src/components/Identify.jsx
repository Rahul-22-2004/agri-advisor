import { useState, useRef } from "react";
import axios from "axios";
import { Camera, UploadCloud, Loader2, Leaf, AlertCircle } from "lucide-react";

const Identify = () => {
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
    setResult(null);
    setError("");
  };

  const identifyPlant = async () => {
    if (!photo) {
      setError("Please select an image before uploading.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to use this feature.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photo);

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/external/identify",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ JWT Token Added
          },
        }
      );
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Error identifying plant. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-50 p-6">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-green-200 transition-transform hover:scale-[1.02] duration-300">
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Leaf className="w-8 h-8 text-green-600" />
          <h2 className="text-3xl font-extrabold text-green-700">
            🌿 Identify Plant / Pest
          </h2>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-2xl p-6 cursor-pointer bg-green-50 hover:bg-green-100 transition-all"
          onClick={() => fileInputRef.current.click()}
        >
          {photo ? (
            <img
              src={URL.createObjectURL(photo)}
              alt="Preview"
              className="w-40 h-40 object-cover rounded-xl shadow-lg border border-green-200 mb-4"
            />
          ) : (
            <Camera className="w-16 h-16 text-green-500 mb-3" />
          )}
          <p className="text-gray-600">
            {photo ? "Click to change image" : "Click to capture / upload image"}
          </p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Upload Button */}
        <button
          className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all"
          onClick={identifyPlant}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Identifying...
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5" />
              Upload & Identify
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-8 bg-gradient-to-br from-green-50 to-white shadow-lg rounded-2xl p-6 border border-green-100 transition-transform hover:scale-[1.01] duration-300">
            <h3 className="text-2xl font-bold text-green-700 mb-3">
              🌱 Best Match: {result.bestMatch}
            </h3>
            <p className="text-gray-700">
              <strong>Confidence:</strong> {(result.results[0].score * 100).toFixed(2)}%
            </p>
            <p className="text-gray-700">
              <strong>Common Names:</strong>{" "}
              {result.results[0].species.commonNames.join(", ") || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Family:</strong> {result.results[0].species.family.scientificName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Identify;
