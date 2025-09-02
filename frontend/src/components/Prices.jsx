import React, { useState, useEffect } from "react";
import { Loader2, IndianRupee, AlertCircle, Database } from "lucide-react";
import { useAuth } from '../context/useAuth.js';
import axiosInstance from "../utils/axiosInstance";

const Prices = () => {
  const [commodity, setCommodity] = useState("");
  const [state, setState] = useState("");
  const [market, setMarket] = useState("");
  const [variety, setVariety] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validParams, setValidParams] = useState({ commodities: [], states: [], markets: [], varieties: [] });
  const [validMarkets, setValidMarkets] = useState([]);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const { token } = useAuth();

  // Fetch valid parameters on component mount
  useEffect(() => {
    const fetchValidParams = async () => {
      setParamsLoading(true);
      try {
        const res = await axiosInstance.get("/api/external/valid-params", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Valid Params Response:', res.data);
        setValidParams(res.data);
        if (!res.data.commodities.length || !res.data.states.length) {
          setError("No data available from the external API. Using limited fallback data.");
        }
      } catch (err) {
        console.error("Valid Params Error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to fetch valid parameters. Using limited fallback data.");
      } finally {
        setParamsLoading(false);
      }
    };
    fetchValidParams();
  }, [token]);

  // Fetch valid markets when state or commodity changes
  useEffect(() => {
    const fetchValidMarkets = async () => {
      if (!state || !commodity) {
        setValidMarkets([]);
        setMarket("");
        return;
      }
      setParamsLoading(true);
      try {
        const res = await axiosInstance.get("/api/external/valid-markets", {
          params: { state, commodity },
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Valid Markets Response:', res.data);
        setValidMarkets(res.data.markets);
        setMarket("");
        if (res.data.markets.length === 0) {
          setError(`No markets found for ${commodity} in ${state}. Try a different combination or check fallback data.`);
        }
      } catch (err) {
        console.error("Valid Markets Error:", err.response?.data || err.message);
        setError(err.response?.data?.error || `Failed to fetch markets for ${commodity} in ${state}. Using fallback data.`);
      } finally {
        setParamsLoading(false);
      }
    };
    fetchValidMarkets();
  }, [state, commodity, token]);

  // Fetch prices
  const handleFetchPrices = async () => {
    if (!commodity || !state || !market) {
      setError("Please select commodity, state, and market.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/external/prices", {
        params: { commodity, state, market, variety, arrival_date: arrivalDate, offset, limit },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Prices Response:', res.data);
      setPrices(res.data.records || []);
      setTotal(res.data.total || 0);
      if (res.data.records.length === 0) {
        setError("No price data available for the selected parameters. Try different options or check fallback data.");
      }
    } catch (err) {
      console.error("Prices Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to fetch price data. Using fallback data if available.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(offset - limit);
    }
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-green-200 p-8">
        <h2 className="text-3xl font-extrabold text-green-700 mb-6 text-center">
          <IndianRupee className="inline-block w-8 h-8 mr-2" />
          Crop Price Checker
        </h2>
        {paramsLoading && (
          <div className="flex justify-center my-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg border border-red-300 mb-4 shadow-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full p-3 rounded-xl border border-green-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select Commodity</option>
              {validParams.commodities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-3 rounded-xl border border-green-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select State</option>
              {validParams.states.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Market
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full p-3 rounded-xl border border-green-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select Market</option>
              {validMarkets.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Variety (Optional)
            </label>
            <select
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              className="w-full p-3 rounded-xl border border-green-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select Variety (Optional)</option>
              {validParams.varieties.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Arrival Date (Optional, DD/MM/YYYY)
            </label>
            <input
              type="text"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full p-3 rounded-xl border border-green-300 bg-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
        <button
          onClick={handleFetchPrices}
          disabled={loading || paramsLoading}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300 ${
            loading || paramsLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Database className="w-5 h-5" />
          Fetch Prices
        </button>
        {loading && (
          <div className="flex justify-center my-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        )}
        {prices.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Price Results
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-green-100 text-green-700">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Min Price</th>
                    <th className="py-2 px-3">Max Price</th>
                    <th className="py-2 px-3">Modal Price</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-green-100 transition duration-200"
                    >
                      <td className="py-2 px-3">
                        {price.arrival_date || "N/A"}
                      </td>
                      <td className="py-2 px-3">₹{price.min_price || "N/A"}</td>
                      <td className="py-2 px-3">₹{price.max_price || "N/A"}</td>
                      <td className="py-2 px-3">
                        ₹{price.modal_price || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > limit && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                  className={`px-4 py-2 rounded-lg ${
                    offset === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={offset + limit >= total}
                  className={`px-4 py-2 rounded-lg ${
                    offset + limit >= total
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prices;