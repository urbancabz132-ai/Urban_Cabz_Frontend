import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RoutingService from "../../../services/routingService";
import CabLoadingScreen from "../../Loading/CabLoadingScreen";

export default function Input() {
  const [rideType, setRideType] = useState("airport");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // ADDED: pickup date/time state (behavior only — UI unchanged)
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai",
    "Ahmedabad", "Jaipur", "Kolkata", "Surat", "Lucknow", "Indore",
    "Nagpur", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
    "Ludhiana", "Agra", "Nashik", "Rajkot", "Faridabad", "Meerut", "Kochi",
    "Varanasi", "Amritsar", "Coimbatore", "Vijayawada", "Mysore", "Chandigarh",
    "Guwahati", "Ranchi", "Raipur", "Jodhpur", "Noida", "Udaipur", "Dehradun"
  ];

  const airports = [
    "Indira Gandhi International Airport (Delhi)",
    "Chhatrapati Shivaji Maharaj International Airport (Mumbai)",
    "Kempegowda International Airport (Bangalore)",
    "Rajiv Gandhi International Airport (Hyderabad)",
    "Chennai International Airport (Chennai)",
    "Netaji Subhas Chandra Bose International Airport (Kolkata)",
    "Sardar Vallabhbhai Patel International Airport (Ahmedabad)",
    "Cochin International Airport (Kochi)",
    "Pune International Airport (Pune)",
    "Jaipur International Airport (Jaipur)",
    "Goa International Airport (Dabolim)",
    "Visakhapatnam International Airport (Visakhapatnam)"
  ];

  const getSuggestions = (query, type) =>
    (type === "airport" ? airports : cities).filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );

  const hideWithDelay = (setter) => {
    setTimeout(() => setter(false), 150);
  };

  // ADDED: navigation handler with validation and calculation
  const onBook = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Clear previous errors
    setError(null);

    // Basic validation
    if (!fromQuery || !toQuery) {
      setError("Please enter both From and To locations");
      return;
    }

    if (fromQuery.trim().toLowerCase() === toQuery.trim().toLowerCase()) {
      setError("Pickup and drop locations cannot be the same");
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      // Validate and calculate distance
      const metrics = await RoutingService.getDistanceAndDuration(fromQuery, toQuery);
      
      // Check if calculation was successful
      if (!metrics || !metrics.distanceKm) {
        throw new Error("Unable to calculate distance. Please check your locations.");
      }

      // If successful, navigate to cab-booking page
      navigate("/cab-booking", {
        state: {
          from: fromQuery,
          to: toQuery,
          pickupDate,
          pickupTime,
          rideType,
          distanceKm: metrics.distanceKm,
        },
      });
    } catch (err) {
      console.error("Location validation error:", err);
      setError(
        err.message || 
        "Unable to find or calculate route between these locations. Please check the location names and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Loading Screen */}
      {isLoading && <CabLoadingScreen message="Validating locations and calculating route..." />}

      {/* Note: if your header is fixed, make sure your page wrapper (e.g. <main>) has top padding like `pt-16` */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          bg-white/15 backdrop-blur-md border border-white/30 
          rounded-3xl p-4 md:p-6 lg:p-8
          mx-auto max-w-2xl w-[95%] 
          relative z-40
          /* keep component from exceeding viewport - allow inner scroll */
          max-h-[calc(100vh-140px)] overflow-y-auto
        "
      >
      {/* Ride Type Buttons */}
      <div className="flex justify-center gap-3 mb-5 flex-wrap">
        {[
          { value: "airport", label: "✈️ Airport" },
          { value: "oneway", label: "🛣️ One-Way" },
          { value: "roundtrip", label: "🔁 Round Trip" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setRideType(option.value)}
            className={`px-4 py-2 rounded-full transition-all duration-200 font-semibold text-sm ${
              rideType === option.value
                ? "bg-yellow-400 text-gray-900 shadow-md scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Form: stack on small and medium (laptop), go to 2-col only on large screens */}
      <AnimatePresence mode="wait">
        <motion.form
          key={rideType}
          layout
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* From */}
          <div className="relative">
            <label className="block text-sm font-semibold text-white mb-1">
              From
            </label>
            <input
              type="text"
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setShowFromSuggestions(true);
              }}
              onBlur={() => hideWithDelay(setShowFromSuggestions)}
              onFocus={() => fromQuery && setShowFromSuggestions(true)}
              placeholder={
                rideType === "airport"
                  ? "Select pickup airport"
                  : "Enter pickup city"
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 text-white outline-none bg-transparent text-sm"
            />
            {showFromSuggestions && fromQuery && (
              <ul className="absolute left-0 right-0 bg-white text-gray-800 rounded-lg shadow-lg mt-1 z-[120] max-h-40 overflow-y-auto">
                {getSuggestions(fromQuery, rideType).length > 0 ? (
                  getSuggestions(fromQuery, rideType).map((s, i) => (
                    <li
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setFromQuery(s);
                        setShowFromSuggestions(false);
                      }}
                      className="px-3 py-2 hover:bg-yellow-100 cursor-pointer text-sm"
                    >
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500 text-sm">No matches found</li>
                )}
              </ul>
            )}
          </div>

          {/* To */}
          <div className="relative">
            <label className="block text-sm font-semibold text-white mb-1">
              To
            </label>
            <input
              type="text"
              value={toQuery}
              onChange={(e) => {
                setToQuery(e.target.value);
                setShowToSuggestions(true);
              }}
              onBlur={() => hideWithDelay(setShowToSuggestions)}
              onFocus={() => toQuery && setShowToSuggestions(true)}
              placeholder={
                rideType === "airport"
                  ? "Select destination airport"
                  : "Enter destination city"
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-transparent text-sm"
            />
            {showToSuggestions && toQuery && (
              <ul className="absolute left-0 right-0 bg-white text-gray-800 rounded-lg shadow-lg mt-1 z-[120] max-h-40 overflow-y-auto">
                {getSuggestions(toQuery, rideType).length > 0 ? (
                  getSuggestions(toQuery, rideType).map((s, i) => (
                    <li
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setToQuery(s);
                        setShowToSuggestions(false);
                      }}
                      className="px-3 py-2 hover:bg-yellow-100 cursor-pointer text-sm"
                    >
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500 text-sm">No matches found</li>
                )}
              </ul>
            )}
          </div>

          {/* Pickup Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Pickup Date
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent text-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none text-sm"
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Pickup Time
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent text-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none text-sm"
            />
          </div>

          {/* Roundtrip Extra Fields
              Use lg:col-span-2 so these span both columns only on large screens;
              on laptops and smaller they will stack naturally (avoid cramped layout).
          */}
          {rideType === "roundtrip" && (
            <>
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-white mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent text-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none text-sm"
                />
              </div>

            </>
          )}
        </motion.form>
      </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm"
          >
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <div className="font-semibold mb-1">Error</div>
                <div>{error}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Book Button */}
        <div className="text-center mt-5 pb-3">
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.03 }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
            onClick={onBook}
            disabled={isLoading}
            className="px-8 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "⏳ Processing..." : "🚖 Book Ride"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
