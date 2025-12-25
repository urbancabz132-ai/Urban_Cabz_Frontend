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
      {isLoading && <CabLoadingScreen message="Validating locations and calculating route..." />}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          bg-white/15 backdrop-blur-md border border-white/30 
          rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8
          mx-auto max-w-2xl w-[95%] 
          relative z-40 shadow-xl
        "
      >
        {/* Ride Type Tabs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-5 sm:mb-6 flex-wrap">
          {[
            { value: "airport", label: "✈️ Airport" },
            { value: "oneway", label: "🛣️ One-Way" },
            { value: "roundtrip", label: "🔁 Round Trip" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setRideType(option.value)}
              className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all duration-300 font-semibold text-xs sm:text-sm border ${rideType === option.value
                ? "bg-yellow-400 border-yellow-400 text-gray-900 shadow-lg scale-105"
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Input Form with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.form
            key={rideType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
          >
            {/* From Input */}
            <div className="relative group">
              <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 sm:mb-2 ml-1 tracking-wide">
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
                placeholder={rideType === "airport" ? "Select pickup airport" : "Enter pickup city"}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-white/30 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 bg-white/10 text-white placeholder-white/50 outline-none transition-all duration-300 font-medium text-sm sm:text-base"
              />

              {/* Suggestions */}
              <AnimatePresence>
                {showFromSuggestions && fromQuery && (
                  <motion.ul
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-0 right-0 bg-white text-gray-800 rounded-xl shadow-xl mt-1 z-[120] max-h-40 overflow-y-auto border border-gray-100"
                  >
                    {getSuggestions(fromQuery, rideType).length > 0 ? (
                      getSuggestions(fromQuery, rideType).map((s, i) => (
                        <li
                          key={i}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFromQuery(s);
                            setShowFromSuggestions(false);
                          }}
                          className="px-4 py-2.5 hover:bg-yellow-50 cursor-pointer text-sm font-medium transition-colors border-b border-gray-50 last:border-0"
                        >
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-gray-400 text-sm text-center">No matches found</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* To Input */}
            <div className="relative group">
              <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 sm:mb-2 ml-1 tracking-wide">
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
                placeholder={rideType === "airport" ? "Select destination airport" : "Enter destination city"}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-white/30 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 bg-white/10 text-white placeholder-white/50 outline-none transition-all duration-300 font-medium text-sm sm:text-base"
              />

              {/* Suggestions */}
              <AnimatePresence>
                {showToSuggestions && toQuery && (
                  <motion.ul
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-0 right-0 bg-white text-gray-800 rounded-xl shadow-xl mt-1 z-[120] max-h-40 overflow-y-auto border border-gray-100"
                  >
                    {getSuggestions(toQuery, rideType).length > 0 ? (
                      getSuggestions(toQuery, rideType).map((s, i) => (
                        <li
                          key={i}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setToQuery(s);
                            setShowToSuggestions(false);
                          }}
                          className="px-4 py-2.5 hover:bg-yellow-50 cursor-pointer text-sm font-medium transition-colors border-b border-gray-50 last:border-0"
                        >
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-gray-400 text-sm text-center">No matches found</li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Picking Date */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 sm:mb-2 ml-1 tracking-wide">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-white/30 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 bg-white/10 text-white outline-none transition-all duration-300 font-medium appearance-none text-sm sm:text-base"
              />
            </div>

            {/* Picking Time */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 sm:mb-2 ml-1 tracking-wide">
                Pickup Time
              </label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-white/30 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 bg-white/10 text-white outline-none transition-all duration-300 font-medium appearance-none text-sm sm:text-base"
              />
            </div>

            {/* Roundtrip Return Date */}
            {rideType === "roundtrip" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:col-span-2"
              >
                <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 sm:mb-2 ml-1 tracking-wide">
                  Return Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-white/30 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 bg-white/10 text-white outline-none transition-all duration-300 font-medium appearance-none text-sm sm:text-base"
                />
              </motion.div>
            )}
          </motion.form>
        </AnimatePresence>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBook}
            disabled={isLoading}
            className="
                    w-full sm:w-auto px-10 py-3 rounded-xl
                    bg-gradient-to-r from-yellow-400 to-yellow-500 
                    text-gray-900 font-bold text-lg 
                    shadow-lg shadow-yellow-400/30
                    hover:shadow-xl hover:from-yellow-300 hover:to-yellow-400
                    transition-all duration-300
                    disabled:opacity-50 disabled:grayscale
                "
          >
            {isLoading ? "⏳ Processing..." : "Book Your Ride"}
          </motion.button>
        </div>

        {/* Error Note */}
        {error && (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
            <p className="text-red-100 text-sm font-medium bg-red-500/20 py-2 px-4 rounded-lg inline-block border border-red-500/30">
              ⚠️ {error}
            </p>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
