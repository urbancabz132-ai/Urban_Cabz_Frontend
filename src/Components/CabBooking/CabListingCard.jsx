// src/Components/CabBooking/CabListingCard.jsx
import React from "react";

export default function CabListingCard({ listing = {}, from, to }) {
  const {
    name,
    seats = 4,
    bags = 2,
    price = 0,
    originalPrice,
    discountPercent,
    tags = [],
    rating,
    vehicleType = "Sedan",
  } = listing;

  // demo handler — replace with actual booking navigation when ready
  const onBookNow = () => {
    alert(`Booking demo:\n${name}\nFrom: ${from}\nTo: ${to}\nPrice: ₹${price.toLocaleString()}`);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex gap-4 items-center">
      <div className="w-28 flex-shrink-0">
        <div className="bg-gray-100 rounded-lg h-20 flex items-center justify-center">
          {/* Use your own asset or public/car-placeholder.png */}
          <img
            src="/car-placeholder.png"
            alt={name}
            className="h-16 object-contain"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
        <div className="text-center text-sm mt-2 text-gray-500">{vehicleType}</div>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">{name}</div>
            {rating ? <div className="text-sm text-yellow-700 mt-1">★ {rating}</div> : null}
          </div>

          <div className="text-right">
            {originalPrice ? (
              <div className="text-sm line-through text-gray-400">₹{originalPrice.toLocaleString()}</div>
            ) : null}
            <div className="text-2xl font-bold">₹{price.toLocaleString()}</div>
            {discountPercent ? <div className="text-sm text-purple-700">{discountPercent}% off</div> : null}
          </div>
        </div>

        <div className="mt-3 flex gap-4 items-center text-sm text-gray-600">
          <div className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            {seats} Seater
          </div>

          <div className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            {bags} bags
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      <div className="w-36 flex flex-col justify-between items-end">
        <div className="text-right text-sm text-green-600 font-medium">Free Cancellation</div>
        <button
          onClick={onBookNow}
          className="mt-3 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
