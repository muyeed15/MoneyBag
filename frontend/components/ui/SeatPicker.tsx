"use client";

import { useMemo, useState } from "react";

type Props = {
  category: string;
  passengers?: number;
  onSelect: (seats: string[]) => void;
};

const LAYOUTS: Record<string, { cols: number; rows: number; labels: string[] }> = {
  bus: { cols: 4, rows: 10, labels: ["A", "B", "C", "D"] },
  train: { cols: 5, rows: 12, labels: ["A", "B", "C", "D", "E"] },
  airline: { cols: 6, rows: 8, labels: ["A", "B", "C", "D", "E", "F"] },
  cinema: { cols: 8, rows: 6, labels: ["A", "B", "C", "D", "E", "F", "G", "H"] },
  ferry: { cols: 3, rows: 8, labels: ["A", "B", "C"] },
  event: { cols: 5, rows: 6, labels: ["A", "B", "C", "D", "E"] },
};

function generateLayout(cols: number, rows: number, labels: string[]) {
  const booked = new Set<string>();
  const total = cols * rows;
  const toBook = Math.floor(total * 0.3);
  while (booked.size < toBook) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    booked.add(`${labels[c]}${r + 1}`);
  }

  const seats: { label: string; row: number; col: number; booked: boolean }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      seats.push({ label: labels[c], row: r + 1, col: c, booked: booked.has(`${labels[c]}${r + 1}`) });
    }
  }
  return seats;
}

function coachName(rows: number, cols: number): string {
  if (cols === 4) return "2+2";
  if (cols === 5) return "3+2";
  if (cols === 6) return "3+3";
  if (cols === 3) return "1+2";
  return `${cols} seats/row`;
}

export default function SeatPicker({ category, passengers = 1, onSelect }: Props) {
  const layout = LAYOUTS[category] ?? LAYOUTS.bus;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [layoutKey] = useState(() => Math.random());

  const seats = useMemo(
    () => generateLayout(layout.cols, layout.rows, layout.labels),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, layoutKey],
  );
  const maxCols = layout.cols;

  function toggleSeat(label: string, row: number, seatId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        if (next.size >= passengers) next.clear();
        next.add(seatId);
      }
      onSelect(Array.from(next));
      return next;
    });
  }

  const selectedList = Array.from(selected);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-muted">
          Select Seat{passengers > 1 ? "s" : ""} ({coachName(layout.rows, maxCols)})
        </p>
        {passengers > 1 && (
          <span className="text-xs text-navy-muted">
            {selectedList.length}/{passengers} selected
          </span>
        )}
      </div>

      <div className="flex justify-center">
        <div
          className="grid gap-1 sm:gap-1.5 p-3 bg-sage/50 rounded-2xl"
          style={{ gridTemplateColumns: `repeat(${maxCols + 1}, minmax(0, 1fr))` }}
        >
          {/* Header row - column numbers */}
          <div className="h-6" />
          {Array.from({ length: maxCols }).map((_, ci) => (
            <div key={ci} className="h-6 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-navy-muted">{layout.labels[ci]}</span>
            </div>
          ))}

          {/* Seat rows */}
          {Array.from({ length: layout.rows }).map((_, ri) => {
            const rowNum = ri + 1;
            return (
              <div key={rowNum} className="contents">
                <div className="h-7 sm:h-8 flex items-center justify-end pr-1.5">
                  <span className="text-[9px] font-semibold text-navy-muted">{rowNum}</span>
                </div>
                {Array.from({ length: maxCols }).map((_, ci) => {
                  const seatId = `${layout.labels[ci]}${rowNum}`;
                  const seat = seats.find((s) => s.row === rowNum && s.col === ci);
                  if (!seat) {
                    return <div key={`empty-${ci}`} className="h-7 sm:h-8" />;
                  }
                  const isBooked = seat.booked;
                  const isSelected = selected.has(seatId);
                  const isAisle = ci === Math.floor(maxCols / 2) - 1 || ci === Math.floor(maxCols / 2);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      disabled={isBooked}
                      onClick={() => toggleSeat(seat.label, seat.row, seatId)}
                      title={isBooked ? `${seatId} - Booked` : isSelected ? `${seatId} - Selected` : `${seatId} - Available`}
                      className={`h-7 sm:h-8 rounded-md text-[8px] sm:text-[9px] font-bold transition-all duration-100
                        ${isBooked ? "bg-sage-mid/30 text-sage-mid cursor-not-allowed" : ""}
                        ${isSelected ? "bg-teal text-white ring-2 ring-teal/30 scale-105" : ""}
                        ${!isBooked && !isSelected ? "bg-white border border-sage-mid hover:border-teal hover:bg-teal/5 text-navy-muted cursor-pointer" : ""}
                        ${isAisle ? "mr-1.5 sm:mr-2" : ""}
                      `}
                    >
                      {seatId}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Legend */}
          <div className="col-span-full flex items-center justify-center gap-4 mt-3 pt-3 border-t border-sage-mid">
            <span className="flex items-center gap-1.5 text-[9px] text-navy-muted">
              <span className="w-3 h-3 rounded bg-white border border-sage-mid" /> Available
            </span>
            <span className="flex items-center gap-1.5 text-[9px] text-navy-muted">
              <span className="w-3 h-3 rounded bg-teal" /> Selected
            </span>
            <span className="flex items-center gap-1.5 text-[9px] text-navy-muted">
              <span className="w-3 h-3 rounded bg-sage-mid/30" /> Booked
            </span>
          </div>
        </div>
      </div>

      {selectedList.length > 0 && (
        <div className="bg-white border border-teal rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-teal">
            {selectedList.length === 1 ? "Seat" : "Seats"}:
          </span>
          <span className="text-sm font-bold text-navy">{selectedList.join(", ")}</span>
        </div>
      )}

      <input type="hidden" name="seat_number" value={selectedList.join(", ")} />
    </div>
  );
}
