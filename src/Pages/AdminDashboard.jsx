import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminBookings,
  fetchAdminBookingTicket,
  upsertTaxiAssignment,
  fetchAdminMe,
} from "../services/adminService";

const statusBadgeClasses = {
  PENDING_PAYMENT:
    "bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs px-2 py-1 rounded-full",
  PAID: "bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2 py-1 rounded-full",
  COMPLETED:
    "bg-sky-100 text-sky-800 border border-sky-200 text-xs px-2 py-1 rounded-full",
  CANCELLED:
    "bg-rose-100 text-rose-800 border border-rose-200 text-xs px-2 py-1 rounded-full",
};

function StatusBadge({ value }) {
  if (!value) return null;
  const cls = statusBadgeClasses[value] || statusBadgeClasses.PAID;
  return <span className={cls}>{value}</span>;
}

function AssignStatusPill({ value }) {
  const v = value || "NOT_ASSIGNED";
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border";
  if (v === "ASSIGNED") {
    return (
      <span className={`${base} border-emerald-400/60 bg-emerald-500/10 text-emerald-200`}>
        ● Assigned
      </span>
    );
  }
  return (
    <span className={`${base} border-amber-400/60 bg-amber-500/10 text-amber-200`}>
      ● Not assigned
    </span>
  );
}

function useWhatsAppTemplate(booking, assignmentForm) {
  return useMemo(() => {
    if (!booking) return "";

    const userName = booking.user?.name || "Customer";
    const bookingId = booking.id;
    const pickup = booking.pickup_location;
    const drop = booking.drop_location;

    let whenText = "ASAP";
    if (booking.scheduled_at) {
      try {
        const d = new Date(booking.scheduled_at);
        whenText = d.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (_) {}
    }

    const vehicleLine = assignmentForm.cabName
      ? `${assignmentForm.cabName} (${assignmentForm.cabNumber || "Cab"})`
      : "Cab will be shared shortly";

    const driverLine = assignmentForm.driverName
      ? `${assignmentForm.driverName} (${assignmentForm.driverNumber || "Driver contact will be shared shortly"})`
      : "Driver details will be shared shortly";

    const lines = [
      `UrbanCabz 🚖`,
      ``,
      `Hi ${userName}, your ride is confirmed! 🎉`,
      ``,
      `Booking ID: BK-${bookingId}`,
      ``,
      `Pickup: ${whenText}`,
      ``,
      `From: ${pickup}`,
      `To: ${drop}`,
      ``,
      `Vehicle: ${vehicleLine}`,
      `Driver: ${driverLine}`,
      ``,
      `Thank you for choosing UrbanCabz!`,
    ];

    return lines.join("\n");
  }, [assignmentForm.cabName, assignmentForm.cabNumber, assignmentForm.driverName, assignmentForm.driverNumber, booking]);
}

function useDriverTemplate(booking) {
  return useMemo(() => {
    if (!booking) return "";
    const userName = booking.user?.name || "Customer";
    const userPhone = booking.user?.phone || "N/A";
    const pickup = booking.pickup_location;
    const drop = booking.drop_location;
    const totalAmount = booking.total_amount
      ? `₹${booking.total_amount.toFixed(0)}`
      : "N/A";

    let whenText = "ASAP";
    if (booking.scheduled_at) {
      try {
        const d = new Date(booking.scheduled_at);
        whenText = d.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (_) {}
    }

    const lines = [
      `UrbanCabz Dispatch ✅`,
      ``,
      `Customer: ${userName}`,
      `Phone: ${userPhone}`,
      ``,
      `Pickup: ${pickup}`,
      `Drop: ${drop}`,
      `Pickup time: ${whenText}`,
      ``,
      `Total Fare: ${totalAmount}`,
      ``,
      `Please confirm pickup and keep the passenger updated.`,
    ];

    return lines.join("\n");
  }, [booking]);
}

function getRemainingAmount(booking) {
  const total = booking?.total_amount || 0;
  const paid = (booking?.payments || []).reduce((sum, payment) => {
    if (!payment) return sum;
    const status = (payment.status || "").toUpperCase();
    if (status === "SUCCESS" || status === "PAID") {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0);
  const remaining = total - paid;
  return remaining > 0 ? remaining : 0;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({
    driverName: "",
    driverNumber: "",
    cabNumber: "",
    cabName: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);
  const [section, setSection] = useState("READY"); // READY, ASSIGNED, PENDING, ALL
  const [search, setSearch] = useState("");
  const [customerNotified, setCustomerNotified] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError("");
      const result = await fetchAdminBookings();
      if (!result.success) {
        if (!cancelled) {
          setError(result.message || "Failed to load tickets.");
        }
        return;
      }
      if (!cancelled) {
        setTickets(result.data.bookings || []);
      }
    };

    (async () => {
      setLoading(true);
      const me = await fetchAdminMe();
      if (!me.success) {
        setError(
          me.message || "You are not authorized to view the admin panel."
        );
        setLoading(false);
        return;
      }
      setAdminInfo(me.data?.user || null);

      await load();
      setLoading(false);

      // Poll every 10 seconds for live updates
      const intervalId = setInterval(load, 10000);
      return () => {
        cancelled = true;
        clearInterval(intervalId);
      };
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTickets = useMemo(() => {
    let list = tickets;

    if (section === "READY") {
      list = list.filter(
        (b) =>
          b.status === "PAID" &&
          (b.taxi_assign_status !== "ASSIGNED" ||
            !b.taxi_assign_status ||
            b.taxi_assign_status === "NOT_ASSIGNED")
      );
    } else if (section === "ASSIGNED") {
      list = list.filter(
        (b) => b.status === "PAID" && b.taxi_assign_status === "ASSIGNED"
      );
    } else if (section === "PENDING") {
      list = list.filter((b) => b.status === "PENDING_PAYMENT");
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => {
        const idMatch = String(b.id).includes(q);
        const nameMatch = (b.user?.name || "").toLowerCase().includes(q);
        const emailMatch = (b.user?.email || "").toLowerCase().includes(q);
        const routeMatch = `${b.pickup_location} ${b.drop_location}`
          .toLowerCase()
          .includes(q);
        return idMatch || nameMatch || emailMatch || routeMatch;
      });
    }

    return list;
  }, [section, search, tickets]);

  const summary = useMemo(() => {
    const total = tickets.length;
    const paid = tickets.filter((b) => b.status === "PAID").length;
    const pendingPayment = tickets.filter(
      (b) => b.status === "PENDING_PAYMENT"
    ).length;
    const assigned = tickets.filter(
      (b) => b.status === "PAID" && b.taxi_assign_status === "ASSIGNED"
    ).length;
    const readyToAssign = paid - assigned;
    return { total, assigned, readyToAssign, pendingPayment };
  }, [tickets]);

  const whatsappText = useWhatsAppTemplate(selectedTicket, form);
  const driverText = useDriverTemplate(selectedTicket);

  useEffect(() => {
    if (selectedTicket?.taxi_assign_status === "ASSIGNED") {
      setCustomerNotified(true);
    } else {
      setCustomerNotified(false);
    }
  }, [selectedTicket?.id, selectedTicket?.taxi_assign_status]);

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setMessage("");
    setError("");

    const result = await fetchAdminBookingTicket(ticket.id);
    if (!result.success) {
      setError(result.message || "Unable to load ticket details.");
      return;
    }
    const booking = result.data.booking;
    const assignment = booking.assign_taxis?.[0] || null;
    setSelectedTicket(booking);
    setForm({
      driverName: assignment?.driver_name || "",
      driverNumber: assignment?.driver_number || "",
      cabNumber: assignment?.cab_number || "",
      cabName: assignment?.cab_name || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSaving(true);
    setMessage("");
    setError("");
    if (!customerNotified) {
      setError("Please share the WhatsApp message with the customer before marking as assigned.");
      return;
    }
    const result = await upsertTaxiAssignment(selectedTicket.id, {
      ...form,
      markAssigned: customerNotified,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.message || "Unable to save assignment.");
      return;
    }
    setMessage("Taxi assignment saved and ticket updated.");
  };

  const handleCopyWhatsapp = async () => {
    if (!whatsappText) return;
    try {
      await navigator.clipboard.writeText(whatsappText);
      setMessage("WhatsApp message copied to clipboard.");
      setCustomerNotified(true);
    } catch {
      setError("Unable to copy message. Please copy manually.");
    }
  };

  const handleCopyDriver = async () => {
    if (!driverText) return;
    try {
      await navigator.clipboard.writeText(driverText);
      setMessage("Driver message copied to clipboard.");
    } catch {
      setError("Unable to copy message. Please copy manually.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Urban Cabz Admin
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              View paid bookings, assign cabs & drivers, and share details with
              customers.
            </p>
          </div>
          {adminInfo && (
            <div className="flex flex-col items-end gap-2 text-xs">
              <div className="rounded-full bg-slate-900/80 px-4 py-2 text-slate-300 border border-slate-700">
                Logged in as{" "}
                <span className="font-medium text-sky-300">
                  {adminInfo.email}
                </span>
              </div>
              <div className="flex gap-2 text-[11px] text-slate-400">
                <span>
                  Paid:{" "}
                  <span className="font-semibold text-slate-100">
                    {summary.paid}
                  </span>
                </span>
                <span>
                  Ready to assign:{" "}
                  <span className="font-semibold text-sky-300">
                    {summary.readyToAssign}
                  </span>
                </span>
                <span>
                  Pending payment:{" "}
                  <span className="font-semibold text-amber-300">
                    {summary.pendingPayment}
                  </span>
                </span>
              </div>
            </div>
          )}
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,3fr)]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/40">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Bookings
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Live view of pending payments and paid bookings.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/70 p-1 text-[11px] text-slate-200">
                  <button
                    type="button"
                    onClick={() => setSection("READY")}
                    className={`rounded-full px-3 py-1 transition ${
                      section === "READY"
                        ? "bg-sky-500 text-slate-950"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    Ready to assign
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection("ASSIGNED")}
                    className={`rounded-full px-3 py-1 transition ${
                      section === "ASSIGNED"
                        ? "bg-emerald-500 text-slate-950"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    Assigned
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection("PENDING")}
                    className={`rounded-full px-3 py-1 transition ${
                      section === "PENDING"
                        ? "bg-amber-500 text-slate-950"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    Pending payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection("ALL")}
                    className={`rounded-full px-3 py-1 transition ${
                      section === "ALL"
                        ? "bg-slate-300 text-slate-900"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    All
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by ID, name, route..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-44 rounded-full border border-slate-700 bg-slate-950/80 px-3 pr-7 text-[11px] text-slate-100 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="pointer-events-none absolute right-2 top-1.5 text-[10px] text-slate-500">
                    ⌕
                  </span>
                </div>
                {loading && (
                  <span className="text-[11px] text-slate-400">Loading...</span>
                )}
              </div>
            </div>
            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {filteredTickets.length === 0 && !loading && (
                <p className="py-10 text-center text-xs text-slate-500">
                  No tickets match your filters. Adjust the filters or wait for
                  new paid bookings.
                </p>
              )}
              {filteredTickets.map((b) => {
                const assignment = b.assign_taxis?.[0] || null;
                const remainingAmount =
                  section === "PENDING" ? getRemainingAmount(b) : null;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleSelectTicket(b)}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                      selectedTicket?.id === b.id
                        ? "border-sky-400/70 bg-sky-500/10"
                        : "border-slate-800/80 bg-slate-900/60 hover:border-sky-500/40 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="font-medium text-slate-100">
                          #{b.id} • {b.pickup_location} → {b.drop_location}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.user?.name || b.user?.email || "Customer"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge value={b.status} />
                        <AssignStatusPill value={b.taxi_assign_status} />
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span>
                        ₹{b.total_amount?.toFixed(0)} •{" "}
                        {section === "PENDING" && remainingAmount !== null ? (
                          <span className="text-amber-300">
                            Remaining ₹{remainingAmount.toFixed(0)}
                          </span>
                        ) : b.distance_km ? (
                          `${b.distance_km.toFixed(1)} km`
                        ) : (
                          "—"
                        )}
                      </span>
                      <span className="truncate">
                        {assignment ? (
                          <span className="text-emerald-300">
                            Driver: {assignment.driver_name}
                          </span>
                        ) : (
                          <span className="text-amber-300">
                            Cab not assigned
                          </span>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/40">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Ticket details
              </h2>
              {selectedTicket && (
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Booking #{selectedTicket.id}</span>
                  <AssignStatusPill value={selectedTicket.taxi_assign_status} />
                </span>
              )}
            </div>

            {!selectedTicket && (
              <p className="py-10 text-center text-xs text-slate-500">
                Select a ticket from the left to view details, assign a cab, and
                generate a WhatsApp message for the customer.
              </p>
            )}

            {selectedTicket && (
              <div className="space-y-6 text-sm">
                <div className="grid gap-4 rounded-xl bg-slate-950/40 p-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Customer
                    </h3>
                    <p className="mt-2 text-slate-100">
                      {selectedTicket.user?.name || "N/A"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedTicket.user?.phone || "-"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedTicket.user?.email || "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Trip
                    </h3>
                    <p className="mt-2 text-slate-100">
                      {selectedTicket.pickup_location} →{" "}
                      {selectedTicket.drop_location}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Distance:{" "}
                      {selectedTicket.distance_km
                        ? `${selectedTicket.distance_km.toFixed(1)} km`
                        : "-"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Amount: ₹{selectedTicket.total_amount?.toFixed(0)}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Assign cab / driver
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Taxi status:{" "}
                      <span className="font-semibold text-sky-300">
                        {selectedTicket.taxi_assign_status || "NOT_ASSIGNED"}
                      </span>
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs text-slate-300">
                        Driver name
                      </label>
                      <input
                        type="text"
                        name="driverName"
                        value={form.driverName}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                        placeholder="e.g. Rajesh Kumar"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300">
                        Driver mobile number
                      </label>
                      <input
                        type="text"
                        name="driverNumber"
                        value={form.driverNumber}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300">
                        Cab number
                      </label>
                      <input
                        type="text"
                        name="cabNumber"
                        value={form.cabNumber}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                        placeholder="GJ 01 AB 1234"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300">
                        Cab name / model
                      </label>
                      <input
                        type="text"
                        name="cabName"
                        value={form.cabName}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                        placeholder="Dzire, Ertiga, Innova..."
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                      <p>
                        Share the WhatsApp message below with the customer
                        before marking this booking as assigned.
                      </p>
                      <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-400"
                          checked={customerNotified}
                          onChange={(e) => setCustomerNotified(e.target.checked)}
                        />
                        I have shared the assignment details with the customer.
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={saving || !customerNotified}
                      className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:shadow-none"
                    >
                      {saving ? "Saving..." : "Save & mark as assigned"}
                    </button>
                  </div>
                </form>

                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      WhatsApp message (copy & send to client)
                    </h3>
                    <button
                      type="button"
                      onClick={handleCopyWhatsapp}
                      disabled={!whatsappText}
                      className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-100 hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                    >
                      Copy message
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={whatsappText}
                    className="h-40 w-full resize-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    You can paste this message into WhatsApp / SMS and edit if
                    needed before sending.
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Share customer details with driver
                    </h3>
                    <button
                      type="button"
                      onClick={handleCopyDriver}
                      disabled={!driverText}
                      className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-100 hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                    >
                      Copy driver message
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={driverText}
                    className="h-32 w-full resize-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Send this to the driver so they have the customer contact,
                    pickup and drop information handy.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

