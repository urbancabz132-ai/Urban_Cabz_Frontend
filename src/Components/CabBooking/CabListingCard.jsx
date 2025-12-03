// src/Components/CabBooking/CabListingCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function CabListingCard({
  listing = {},
  from,
  to,
  distanceKm,
  rideType = "oneway",
  pickupDate,
  pickupTime,
}) {
  const {
    name,
    seats = 4,
    bags = 2,
    basePrice = 12,
    tags = [],
    rating,
    vehicleType = "Sedan",
    image, // Add image prop
  } = listing;

  const calculatePrice = () => {
    if (!distanceKm) return 0;

    const tripMultiplier = rideType === "roundtrip" ? 2 : 1;
    const billableDistance = distanceKm * tripMultiplier;

    let pricePerKm = basePrice;

    if (billableDistance > 300) {
      pricePerKm = basePrice * 0.9;
    }

    const totalPrice = Math.round(billableDistance * pricePerKm);
    return totalPrice;
  };

  const isRoundTrip = rideType === "roundtrip";
  const price = calculatePrice();
  const originalPrice = price > 0 ? Math.round(price * 1.15) : 0;
  const discountPercent = 13;

  const navigate = useNavigate();

  const onBookNow = () => {
    // Validate that location and calculation are done
    if (!distanceKm || distanceKm <= 0) {
      alert("Please wait for distance calculation to complete before booking.");
      return;
    }

    if (!from || !to || from === "Pickup location" || to === "Drop location") {
      alert("Please ensure both pickup and drop locations are selected.");
      return;
    }

    navigate("/cab-booking-details", {
      state: {
        listing,
        from,
        to,
        distanceKm,
        rideType,
        pickupDate,
        pickupTime,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* CAR IMAGE */}
          <div className="w-full sm:w-36 flex-shrink-0 mx-auto sm:mx-0">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl h-32 sm:h-28 flex items-center justify-center overflow-hidden p-3 border border-slate-200">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'block';
                    }
                  }}
                />
              ) : (
                <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              )}
              <svg style={{ display: 'none' }} className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div className="text-center text-xs mt-2 text-slate-600 font-semibold bg-slate-100 rounded-full py-1.5 px-3">
              {vehicleType}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0">
            {/* Header: Name, Rating */}
            <div className="mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 truncate">{name}</h3>
              {rating && (
                <div className="text-sm text-yellow-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <span className="font-semibold">{rating}</span>
                </div>
              )}
            </div>

            {/* Features: Seats, Bags, Distance */}
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center text-xs sm:text-sm text-slate-600 mb-3">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">{seats} Seats</span>
              </div>

              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span className="font-medium">{bags} Bags</span>
              </div>
              
              {distanceKm && (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-medium">
                    {isRoundTrip ? `${(distanceKm * 2).toFixed(1)} km` : `${distanceKm} km`}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 bg-slate-50 text-slate-700 rounded-full font-medium border border-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ACTION BUTTON SECTION - Aligned with price */}
          <div className="flex flex-col items-end gap-3 sm:gap-4 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6 sm:self-start">
            {/* Price Section */}
            <div className="text-right w-full sm:w-auto">
              {price > 0 && originalPrice && (
                <div className="text-xs sm:text-sm line-through text-gray-400 mb-0.5">
                  ₹{originalPrice.toLocaleString()}
                </div>
              )}
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {price > 0 ? `₹${price.toLocaleString()}` : <span className="text-gray-400 text-lg">Calculating...</span>}
              </div>
              {price > 0 && (
                <div className="flex flex-col items-end gap-1 mt-1">
                  <span className="text-xs sm:text-sm text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block w-fit">
                    {discountPercent}% off
                  </span>
                  {isRoundTrip && (
                    <span className="text-xs text-gray-500">
                      Includes return
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Free Cancellation Badge */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Free Cancellation</span>
            </div>

            {/* Book Now Button */}
            <button
              onClick={onBookNow}
              disabled={!price}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base whitespace-nowrap"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}