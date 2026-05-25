"use client";

import { useActionState, useTransition, useState } from "react";
import useSWR from "swr";
import { CreditCard, Plus, X } from "lucide-react";
import { addCardAction, blockCardAction } from "@/app/actions";
import type { Card } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageTransition } from "@/components/ui/PageTransition";

const CARD_STATUS_VARIANT: Record<string, "success" | "danger" | "neutral"> = {
  active: "success",
  blocked: "danger",
  expired: "neutral",
};

const initialState = { error: null, success: false };

export default function CardsPage() {
  const { data: cards = [], mutate } = useSWR<Card[]>("/api/cards");
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, pending] = useActionState(
    addCardAction,
    initialState,
  );
  const [blocking, startBlock] = useTransition();

  const handleBlock = (cardId: number) => {
    startBlock(async () => {
      await blockCardAction(cardId);
      mutate();
    });
  };

  const handleAddSuccess = () => {
    setShowForm(false);
    mutate();
  };

  if (state.success && showForm) {
    handleAddSuccess();
  }

  return (
    <PageTransition>
      <div className="bg-white border-b border-sage-mid px-6 h-16 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-navy-muted font-semibold uppercase tracking-widest leading-none">
            Payment Methods
          </p>
          <h1 className="text-navy font-bold text-lg leading-tight mt-0.5">
            My Cards
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          aria-label={showForm ? "Cancel" : "Add card"}
          className="flex items-center gap-1.5 text-xs font-semibold text-teal active:opacity-60 transition-opacity"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" aria-hidden="true" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add Card
            </>
          )}
        </button>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto space-y-5">
        {showForm && (
          <form action={formAction} className="bg-white border border-sage-mid">
            <div className="px-4 py-2 bg-sage border-b border-sage-mid">
              <p className="text-xs font-semibold uppercase tracking-widest text-navy-muted">
                Add New Card
              </p>
            </div>

            {state.error && (
              <div className="mx-5 mt-4 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <div className="divide-y divide-sage-mid">
              <div className="px-5 py-4">
                <Input
                  label="Last 4 Digits"
                  name="last_four"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  placeholder="e.g. 4242"
                />
              </div>
              <div className="px-5 py-4">
                <label className="block text-xs font-semibold uppercase tracking-widest text-navy-muted mb-2">
                  Card Type
                </label>
                <select
                  name="card_type"
                  required
                  className="w-full border border-sage-mid px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:ring-1 focus:ring-teal"
                >
                  <option value="debit">Debit Card</option>
                  <option value="prepaid">Prepaid Card</option>
                </select>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Month"
                  name="expiry_month"
                  type="number"
                  min={1}
                  max={12}
                  required
                  placeholder="MM"
                />
                <Input
                  label="Expiry Year"
                  name="expiry_year"
                  type="number"
                  min={2024}
                  required
                  placeholder="YYYY"
                />
              </div>
            </div>

            <div className="border-t border-sage-mid">
              <Button
                type="submit"
                variant="cta"
                loading={pending}
                className="w-full rounded-none h-auto py-4 text-base"
              >
                {pending ? "Adding…" : "Add Card"}
              </Button>
            </div>
          </form>
        )}

        {cards.length === 0 && !showForm ? (
          <div className="bg-white border border-sage-mid px-6 py-16 text-center">
            <CreditCard
              className="h-10 w-10 text-navy-muted mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-navy font-semibold">No cards linked</p>
            <p className="text-sm text-navy-muted mt-1">
              Add a card to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-navy text-white px-6 py-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">
                    {card.card_type === "debit" ? "Debit Card" : "Prepaid Card"}
                  </p>
                  <p className="text-xl font-bold tracking-widest tabular-nums">
                    •••• •••• •••• {card.last_four}
                  </p>
                  <p className="text-white/60 text-xs mt-2">
                    Expires {String(card.expiry_month).padStart(2, "0")}/
                    {card.expiry_year}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <Badge variant={CARD_STATUS_VARIANT[card.status]}>
                    {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                  </Badge>
                  {card.status === "active" && (
                    <button
                      type="button"
                      disabled={blocking}
                      onClick={() => handleBlock(card.id)}
                      className="text-xs font-semibold text-red-300 hover:text-red-200 active:opacity-60 transition-opacity disabled:opacity-40"
                    >
                      Block
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
