import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDetailsMain from "../Components/BookingDetails/BookingDetailsMain";
import BookingDetailsSidebar from "../Components/BookingDetails/BookingDetailsSidebar";

/**
 * CabBookingDetails page
 * Receives state via navigation and shows the BookingDetailsMain and Sidebar.
 *
 * Expect state: { listing, from, to, pickupDate, pickupTime, distanceKm }
 */
export default function CabBookingDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const listing = state?.listing || {};
  const from = state?.from || "Pickup location";
  const to = state?.to || "Drop location";
  const pickupDate = state?.pickupDate || "—";
  const pickupTime = state?.pickupTime || "—";
  const distanceKm = state?.distanceKm ?? null;
  const rideType = state?.rideType || "oneway";
  const isRoundTrip = rideType === "roundtrip";

  const basePrice = listing.basePrice ?? 12;

  const calculatePrice = () => {
    if (!distanceKm) return 0;
    const billableDistance = distanceKm * (isRoundTrip ? 2 : 1);
    let pricePerKm = basePrice;
    if (billableDistance > 300) pricePerKm = basePrice * 0.9;
    return Math.round(billableDistance * pricePerKm);
  };

  const price = calculatePrice();

  const goBack = () => navigate(-1);
  const onPayNow = (amount) => {
    // Replace with payment flow
    alert(`Proceed to payment for ₹${amount}`);
  };

  return (
    <div className="pt-24 pb-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-yellow-600">
              Review & confirm
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900">
              Cab booking summary
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Check your trip details and choose how you want to pay.
            </p>
          </div>

          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300"
          >
            <span className="text-base">←</span>
            Back to cab options
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: booking details (scrolls with page) */}
          <div className="lg:col-span-2 space-y-6">
            <BookingDetailsMain
              listing={listing}
              from={from}
              to={to}
              pickupDate={pickupDate}
              pickupTime={pickupTime}
              distanceKm={distanceKm}
              rideType={rideType}
              price={price}
              onBack={goBack}
            />
          </div>

          {/* Right: payment summary (floats on large screens) */}
          <aside>
            <BookingDetailsSidebar price={price} onPayNow={onPayNow} />
          </aside>
        </div>
      </div>
    </div>
  );
}
