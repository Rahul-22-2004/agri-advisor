import { useState, useRef } from "react";
import { Mic, Square, Loader2, Volume2, AlertTriangle } from "lucide-react";
import { useAuth } from '../context/useAuth.js';
import axiosInstance from "../utils/axiosInstance";

const Advice = () => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [adviceText, setAdviceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("hi-IN");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { token } = useAuth();

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setAudioUrl(null);
      setAdviceText("");
      setError("");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied. Please enable it.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setLoading(true);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];

        const formData = new FormData();
        formData.append("audio", audioBlob, "query.webm");
        formData.append("language", language);

        try {
          if (!token) {
            setError("Please log in to get personalized advice.");
            setLoading(false);
            return;
          }

          const res = await axiosInstance.post("/api/advice", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${token}`,
            },
            responseType: "json",
          });

          const { adviceText, audioBase64 } = res.data;
          const binaryString = atob(audioBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioBlob = new Blob([bytes], { type: "audio/mpeg" });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setAdviceText(adviceText || "No advice available.");
          setError("");
        } catch (err) {
          console.error("Advice Error:", err.response?.data || err.message);
          const errorMessage = err.response?.status === 401
            ? "Please log in to get personalized advice."
            : err.response?.data?.error || "Failed to fetch advice. Please try again later.";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-blue-200 p-8">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          🌱 Get Agricultural Advice
        </h2>
        <div className="mb-4">
          <label htmlFor="language" className="block text-gray-700 font-semibold mb-2">
            Select Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hi-IN">Hindi</option>
            <option value="kn-IN">Kannada</option>
            <option value="ta-IN">Tamil</option>
            <option value="te-IN">Telugu</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-4">
          <button
            onClick={startRecording}
            disabled={recording || loading}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 ${
              recording || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            }`}
          >
            <Mic className="w-5 h-5" />
            {recording ? "Recording..." : "Start Recording"}
          </button>
          <button
            onClick={stopRecording}
            disabled={!recording || loading}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 ${
              !recording || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            }`}
          >
            <Square className="w-5 h-5" />
            Stop & Get Advice
          </button>
        </div>
        {loading && (
          <div className="flex justify-center my-4">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg border border-red-300 mb-4 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {audioUrl && (
          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-inner">
            <div className="flex items-center gap-3 mb-3">
              <Volume2 className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-blue-700">Your Personalized Advice</span>
            </div>
            <audio
              key={audioUrl}
              className="w-full mt-2 rounded-lg shadow-sm border border-blue-300"
              controls
              autoPlay
              src={audioUrl}
            />
            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm border border-blue-300">
              <p className="text-gray-700">{adviceText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Advice;