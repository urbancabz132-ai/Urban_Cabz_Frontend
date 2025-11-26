// src/Components/CabBooking/BookingSidebar.jsx
import React from "react";

export default function BookingSidebar({ from, to, pickupDate, pickupTime }) {
  // demo values; replace with real calculations
  const distance = "Approx 120 km";
  const duration = "2h 30m";

  return (
    <div className="bg-white rounded-xl shadow p-4 sticky top-28">
      <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-sm text-gray-500">
        Map placeholder
      </div>

      <div className="text-sm text-gray-700 space-y-3">
        <div>
          <div className="font-semibold">Your trip</div>
          <div className="mt-2">
            <div className="text-xs text-green-600">From</div>
            <div className="text-sm">{from}</div>
          </div>

          <div className="mt-2">
            <div className="text-xs text-red-600">To</div>
            <div className="text-sm">{to}</div>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="font-medium">Date</div>
            <div className="ml-auto">{pickupDate}</div>
          </div>

          <div className="flex items-center gap-2 text-sm mt-2">
            <div className="font-medium">Time</div>
            <div className="ml-auto">{pickupTime}</div>
          </div>

          <div className="flex items-center gap-2 text-sm mt-2">
            <div className="font-medium">Distance</div>
            <div className="ml-auto">{distance}</div>
          </div>

          <div className="flex items-center gap-2 text-sm mt-2">
            <div className="font-medium">Duration</div>
            <div className="ml-auto">{duration}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
