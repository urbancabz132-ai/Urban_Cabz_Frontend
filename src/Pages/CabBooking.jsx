// src/Pages/CabBooking.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import CabListingCard from "../Components/CabBooking/CabListingCard";
import BookingSidebar from "../Components/CabBooking/BookingSidebar";

export default function CabBooking() {
  const { state } = useLocation();
  const from = state?.from || "Pickup location";
  const to = state?.to || "Drop location";
  const pickupDate = state?.pickupDate || "—";
  const pickupTime = state?.pickupTime || "—";
  const rideType = state?.rideType || "airport";

  // Dummy listings (replace with API later)
  const listings = [
    {
      id: 1,
      name: "Dzire or Similar",
      seats: 4,
      bags: 2,
      price: 28738,
      originalPrice: 31931,
      discountPercent: 10,
      tags: ["CNG", "Tissues", "Sanitiser"],
      rating: 4.5,
      vehicleType: "Sedan",
    },
    {
      id: 2,
      name: "Innova or Similar",
      seats: 6,
      bags: 3,
      price: 38900,
      originalPrice: 42000,
      discountPercent: 7,
      tags: ["Tissues", "Car Freshner"],
      rating: 4.6,
      vehicleType: "SUV",
    },
    {
      id: 3,
      name: "Swift Dzire or Similar",
      seats: 4,
      bags: 2,
      price: 25500,
      originalPrice: 27999,
      discountPercent: 8,
      tags: ["Sanitiser"],
      rating: 4.3,
      vehicleType: "Hatchback",
    },
  ];

  return (
    <div className="pt-24 pb-12 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top summary bar */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl p-4 mb-6 shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-lg font-semibold">
              {rideType === "airport" ? "Airport Transfer" : "Trip"} — {from} → {to}
            </div>
            <div className="text-sm opacity-90">
              Pickup: {pickupDate} • {pickupTime}
            </div>
          </div>
        </div>

        {/* Main layout: left listings (2/3) and right sidebar (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Render vehicle cards */}
            {listings.map((l) => (
              <CabListingCard key={l.id} listing={l} from={from} to={to} />
            ))}

            {/* Info note */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="font-semibold">Flexible cancellation</div>
              <div className="text-sm text-gray-700">
                Free cancellation up to 1 hour before pickup (demo text).
              </div>
            </div>
          </div>

          <div>
            <BookingSidebar from={from} to={to} pickupDate={pickupDate} pickupTime={pickupTime} />
          </div>
        </div>
      </div>
    </div>
  );
}
