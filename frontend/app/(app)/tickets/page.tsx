"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Info, Bus, Train, Plane, Film, Calendar, Ship, ArrowLeft } from "lucide-react";
import { bookTicketAction, cancelTicketAction } from "@/app/actions";
import type { TicketProvider, TicketTrip, TicketBooking } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import SeatPicker from "@/components/ui/SeatPicker";
import { PageTransition } from "@/components/ui/PageTransition";

const initBook = { ok: false, message: "" };
const initCancel = { ok: false, message: "" };
const BADGE_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
  refunded: "bg-yellow-100 text-yellow-700", pending: "bg-gray-100 text-gray-700",
};

const CATEGORIES = [
  { key: "bus", label: "Bus", icon: Bus },
  { key: "train", label: "Train", icon: Train },
  { key: "airline", label: "Airline", icon: Plane },
  { key: "ferry", label: "Ferry", icon: Ship },
  { key: "cinema", label: "Cinema", icon: Film },
  { key: "event", label: "Event", icon: Calendar },
] as const;

type CategoryKey = "bus" | "train" | "airline" | "ferry" | "cinema" | "event";

export default function TicketsPage() {
  const router = useRouter();
  const [bookState, bookAction, bookPending] = useActionState(bookTicketAction, initBook);
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelTicketAction, initCancel);
  const { data: providerData } = useSWR<TicketProvider[]>("/api/ticket-providers");
  const { data: bookingData } = useSWR<{ results: TicketBooking[] }>("/api/tickets?page=1");
  const providerList = providerData ?? [];
  const bookings = bookingData?.results ?? [];
  const feedbackMsg = bookState.message || cancelState.message;
  const feedbackOk = bookState.ok || cancelState.ok;

  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<number>(0);
  const [selectedTripId, setSelectedTripId] = useState<number>(0);

  const filteredProviders = category ? providerList.filter((p) => p.category === category) : ([] as TicketProvider[]);
  const provider = filteredProviders.find((p) => p.id === selectedProviderId) ?? null;
  const trips = provider?.trips ?? [];
  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;

  const isTravel = category ? ["bus", "train", "airline", "ferry"].includes(category) : false;
  const catLabel = category ? CATEGORIES.find((c) => c.key === category)?.label ?? "" : "";

  function handleBack() {
    if (selectedTripId > 0) setSelectedTripId(0);
    else if (selectedProviderId > 0) { setSelectedProviderId(0); setSelectedTripId(0); }
    else if (category) setCategory(null);
    else router.back();
  }

  return (
    <PageTransition>
      <div className="bg-white px-4 h-16 flex items-center gap-3 border-b border-sage/80">
        <button type="button" onClick={handleBack} aria-label="Go back"
          className="text-navy-muted hover:text-navy active:scale-90 transition-all duration-150">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div>
          <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
            {category ? `Book ${catLabel}` : "Tickets"}
          </p>
          <h1 className="text-navy font-bold text-lg leading-tight mt-0.5">
            {selectedTrip ? selectedTrip.name : category ? catLabel : "What would you like?"}
          </h1>
        </div>
      </div>

      <div className="px-4 py-5 lg:px-8 lg:py-8 mx-auto max-w-2xl space-y-5">
        {feedbackOk && feedbackMsg && (
          <div className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 text-sm font-medium text-teal">{feedbackMsg}</div>
        )}

        {!category && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted mb-3">Select Category</p>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setCategory(key as CategoryKey)}
                  className="flex flex-col items-center gap-2 bg-white border border-sage-mid rounded-2xl p-5 hover:border-teal hover:shadow-sm active:scale-95 transition-all duration-150">
                  <div className="h-12 w-12 bg-teal rounded-2xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-navy">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {category && filteredProviders.length > 0 && !selectedTrip && (
          <div className="space-y-5">
            <div className="bg-white border border-sage-mid rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted mb-2">Provider</p>
                <select value={selectedProviderId} onChange={(e) => { setSelectedProviderId(Number(e.target.value)); setSelectedTripId(0); }}
                  className="w-full border border-sage-mid px-3.5 py-3 text-sm text-navy bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/10 focus:border-teal transition-all duration-150">
                  <option value={0}>Select provider</option>
                  {filteredProviders.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>

              {trips.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted mb-2">
                    {isTravel ? "Select Trip" : "Select Show/Event"}
                  </p>
                  <div className="space-y-2">
                    {trips.map((t) => {
                      const isSelected = selectedTripId === t.id;
                      return (
                        <label key={t.id}
                          className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer hover:border-teal/50 transition-all duration-150 ${isSelected ? "border-teal bg-teal/5 shadow-sm" : "border-sage-mid"}`}>
                          <input type="radio" name="trip_radio" checked={isSelected}
                            onChange={() => setSelectedTripId(t.id)} className="accent-teal mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy">{t.name}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                              {t.origin ? <span className="text-xs text-navy-muted">{t.origin} &rarr; {t.destination}</span> : null}
                              <span className="text-xs text-navy-muted">{t.departure_time}</span>
                              {t.arrival_time ? <span className="text-xs text-navy-muted">&rarr; {t.arrival_time}</span> : null}
                              <span className="text-xs text-navy-muted">{t.coach_class}</span>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-navy whitespace-nowrap">৳{t.price}</p>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTrip && (
          <form action={bookAction} className="bg-white border border-sage-mid rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex gap-2 items-start">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-navy-muted" />
              <p className="text-xs leading-snug text-navy-muted">
                {isTravel ? "Travel tickets confirmed instantly. 70% refund on cancellation." : "Tickets confirmed instantly."}
              </p>
            </div>

            <input type="hidden" name="provider_id" value={selectedTrip.provider} />
            <input type="hidden" name="trip_id" value={selectedTrip.id} />
            <input type="hidden" name="trip_name" value={selectedTrip.name} />
            <input type="hidden" name="departure_time" value={selectedTrip.departure_time} />
            <input type="hidden" name="coach_class" value={selectedTrip.coach_class} />
            <input type="hidden" name="origin" value={selectedTrip.origin} />
            <input type="hidden" name="destination" value={selectedTrip.destination} />

            <div className="bg-sage/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-navy-muted">{isTravel ? "Trip" : "Show"}</span>
                <span className="text-navy font-semibold">{selectedTrip.name}</span>
              </div>
              {selectedTrip.origin ? (
                <div className="flex justify-between text-sm">
                  <span className="text-navy-muted">Route</span>
                  <span className="text-navy">{selectedTrip.origin} &rarr; {selectedTrip.destination}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm">
                <span className="text-navy-muted">{isTravel ? "Departure" : "Time"}</span>
                <span className="text-navy">{selectedTrip.departure_time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-muted">{isTravel ? "Class" : "Category"}</span>
                <span className="text-navy">{selectedTrip.coach_class}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-sage-mid">
                <span className="text-navy-muted">Price per ticket</span>
                <span className="text-navy font-bold">৳{selectedTrip.price}</span>
              </div>
            </div>

            <Input name="journey_date" label={isTravel ? "Journey Date" : "Date"} type="date" required />
            <Input name="passengers" label={isTravel ? "Passengers" : "Number of Tickets"} type="number" placeholder="1" defaultValue={1} />
            {isTravel && <SeatPicker category={category ?? "bus"} passengers={1} onSelect={() => {}} />}
            <Input name="amount" label="Total Amount (৳)" type="number" placeholder={selectedTrip.price} required />

            {bookState.message && !bookState.ok && (
              <div className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 rounded-r">{bookState.message}</div>
            )}

            <Button type="submit" loading={bookPending} className="w-full h-auto py-4 text-base rounded-xl">
              {bookPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        )}

        {category && filteredProviders.length === 0 && (
          <div className="bg-white border border-sage-mid px-6 py-16 text-center rounded-2xl shadow-sm">
            <p className="text-navy font-semibold">No providers available</p>
            <p className="text-sm text-navy-muted mt-1">No {catLabel} providers at this time.</p>
          </div>
        )}

        {bookings.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted mb-3">My Bookings</p>
            <div className="bg-white border border-sage-mid rounded-2xl divide-y divide-sage-mid overflow-hidden shadow-sm">
              {bookings.map((b) => (
                <div key={b.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy">{b.trip_name || b.provider_name}</p>
                      {b.origin ? <p className="text-xs text-navy-muted mt-0.5">{b.origin} &rarr; {b.destination}</p> : null}
                      <p className="text-xs text-navy-muted">
                        {b.journey_date}{b.departure_time ? ` \u00B7 ${b.departure_time}` : ""}{b.passengers > 1 ? ` \u00B7 ${b.passengers} pax` : ""}
                      </p>
                      {b.coach_class ? <p className="text-xs text-navy-muted">{b.coach_class}{b.seat_number ? ` \u00B7 ${b.seat_number}` : ""}</p> : null}
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-sm font-semibold text-navy">৳{b.amount}</p>
                        <p className="text-[10px] text-navy-muted">Ref: {b.booking_reference}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${BADGE_COLORS[b.status] ?? "bg-gray-100 text-gray-700"}`}>{b.status}</span>
                  </div>
                  {b.status === "confirmed" && (
                    <form action={cancelAction} className="mt-3">
                      <input type="hidden" name="ticket_id" value={b.id} />
                      <Button type="submit" loading={cancelPending} variant="secondary" size="sm">
                        Cancel{b.origin ? " (70% refund)" : ""}
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
