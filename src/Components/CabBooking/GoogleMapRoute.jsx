// src/Components/CabBooking/GoogleMapRoute.jsx
import React, { useEffect, useRef } from "react";

export default function GoogleMapRoute({ from, to, onDistanceCalculated }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    if (!window.google || !window.google.maps) {
      console.error("Google Maps JS API not loaded. Add script tag with your API key.");
      return;
    }

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: 20.5937, lng: 78.9629 }, // India center
    });

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({ suppressMarkers: false });
    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin: from,
        destination: to,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidTolls: false,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
          const route = result.routes[0].legs[0];
          const distanceKm = route.distance?.value ? route.distance.value / 1000 : 0;
          if (typeof onDistanceCalculated === "function") onDistanceCalculated(distanceKm);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );

    // cleanup
    return () => {
      directionsRenderer.setMap(null);
    };
  }, [from, to, onDistanceCalculated]);

  return <div ref={mapRef} className="w-full h-40 rounded-lg" />;
}
