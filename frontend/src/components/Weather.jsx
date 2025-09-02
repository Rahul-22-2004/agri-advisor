import { useState, useEffect } from "react";
import axios from "axios";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Thermometer,
  Wind,
  Droplets,
  MapPin,
  Loader2,
  Crosshair,
} from "lucide-react";

const Weather = () => {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchWeather = async (city = query) => {
    if (!city.trim()) {
      setError("Please enter a valid city name or use your location.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to fetch weather data.");
      return;
    }

    setLoading(true);
    setWeather(null);
    setError("");

    try {
      const res = await axios.get(
        `http://localhost:5000/api/external/weather?city=${encodeURIComponent(city)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWeather(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("City not found / Check if the entered city spelling is correct.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to fetch weather. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (main) => {
    switch (main?.toLowerCase()) {
      case "clear":
        return <Sun className="w-12 h-12 text-yellow-400" />;
      case "clouds":
        return <Cloud className="w-12 h-12 text-gray-500" />;
      case "rain":
        return <CloudRain className="w-12 h-12 text-blue-400" />;
      case "thunderstorm":
        return <CloudLightning className="w-12 h-12 text-purple-600" />;
      default:
        return <Sun className="w-12 h-12 text-yellow-400" />;
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to fetch weather data.");
          setLocationLoading(false);
          return;
        }

        try {
          const res = await axios.get(
            `http://localhost:5000/api/external/weather?lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setWeather(res.data);
        } catch (err) {
          setError("Failed to fetch weather based on location." , err);
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enter a city name.");
        setLocationLoading(false);
      }
    );
  };

  // Remove automatic geolocation from useEffect
  useEffect(() => {
    // No automatic geolocation here; it will trigger on button click
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6">
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-blue-200">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
          <Cloud className="inline-block w-8 h-8 mr-2" />
          Weather Checker
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter city name (e.g., Mysore)"
            className="flex-1 p-3 rounded-xl border border-blue-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => fetchWeather()}
            disabled={loading}
            className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Fetch Weather"}
          </button>
          <button
            onClick={getUserLocation}
            disabled={locationLoading || loading}
            className={`px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg transition duration-300 ${
              locationLoading || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {locationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg border border-red-300 mb-4 shadow-sm">
            <Loader2 className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {weather && (
          <div className="text-center">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <p className="text-lg font-semibold text-gray-700">
                  {weather.name}, {weather.sys.country}
                </p>
              </div>

              {getWeatherIcon(weather.weather[0].main)}

              <h3 className="text-2xl font-bold text-gray-800 capitalize">
                {weather.weather[0].description}
              </h3>

              <p className="text-4xl font-extrabold text-blue-700 mt-2">
                {weather.main.temp}°C
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 text-center">
              <div className="bg-white shadow rounded-xl p-4 border border-gray-100">
                <Thermometer className="w-6 h-6 mx-auto text-red-500" />
                <p className="text-gray-600 text-sm mt-1">Feels Like</p>
                <p className="font-bold text-gray-800">
                  {weather.main.feels_like}°C
                </p>
              </div>

              <div className="bg-white shadow rounded-xl p-4 border border-gray-100">
                <Wind className="w-6 h-6 mx-auto text-green-500" />
                <p className="text-gray-600 text-sm mt-1">Wind</p>
                <p className="font-bold text-gray-800">{weather.wind.speed} m/s</p>
              </div>

              <div className="bg-white shadow rounded-xl p-4 border border-gray-100">
                <Droplets className="w-6 h-6 mx-auto text-blue-500" />
                <p className="text-gray-600 text-sm mt-1">Humidity</p>
                <p className="font-bold text-gray-800">{weather.main.humidity}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;