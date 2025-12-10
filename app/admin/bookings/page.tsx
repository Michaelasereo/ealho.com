"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const seedBookings = [
  { id: "b1", title: "Follow-up consult", patient: "Amaka Bello", dietitian: "Dt. Sarah Ogun", when: "Tomorrow, 2:00 PM", status: "upcoming", type: "session" },
  { id: "b2", title: "Initial consult", patient: "Tom Ade", dietitian: "Dt. Kemi Musa", when: "Today, 11:00 AM", status: "unconfirmed", type: "session" },
  { id: "b3", title: "Meal plan review", patient: "Lisa John", dietitian: "Dt. Tayo Bisi", when: "Mon, 9:30 AM", status: "completed", type: "session" },
  { id: "m1", title: "Meal plan - Starter", patient: "Sam Ade", dietitian: "Dt. Sarah Ogun", when: "Pending delivery", status: "pending", type: "meal" },
  { id: "m2", title: "Meal plan - Premium", patient: "Kate Obi", dietitian: "Dt. Kemi Musa", when: "Paid, preparing", status: "paid", type: "meal" },
  { id: "m3", title: "Meal plan - Standard", patient: "Ife Tolu", dietitian: "Dt. Tayo Bisi", when: "Sent", status: "sent", type: "meal" },
];

const statusColor = {
  upcoming: "bg-emerald-500/20 text-emerald-200",
  unconfirmed: "bg-amber-500/20 text-amber-200",
  completed: "bg-blue-500/20 text-blue-200",
  pending: "bg-amber-500/20 text-amber-200",
  paid: "bg-blue-500/20 text-blue-200",
  sent: "bg-emerald-500/20 text-emerald-200",
};

const mealTabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "sent", label: "Sent" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(seedBookings);
  const [mealFilter, setMealFilter] = useState<"all" | "pending" | "paid" | "sent">("all");

  const handleDelete = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const mealPlans = useMemo(
    () => bookings.filter((b) => b.type === "meal"),
    [bookings]
  );

  const filteredMeals = useMemo(() => {
    if (mealFilter === "all") return mealPlans;
    return mealPlans.filter((m) => m.status === mealFilter);
  }, [mealPlans, mealFilter]);

  const sessions = useMemo(
    () => bookings.filter((b) => b.type === "session"),
    [bookings]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bookings</h1>
          <p className="text-white/60">Monitor sessions and meal plans.</p>
        </div>
      </div>

      {/* Sessions */}
      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-white">Sessions</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-[#1f1f1f]">
          {sessions.length === 0 ? (
            <div className="py-4 text-sm text-white/60">No sessions.</div>
          ) : (
            sessions.map((b) => (
              <div
                key={b.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-white/80"
              >
                <div className="space-y-1">
                  <div className="font-medium text-white">{b.title}</div>
                  <div className="text-white/60">
                    {b.patient} with {b.dietitian}
                  </div>
                  <div className="text-white/50">{b.when}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColor[b.status as keyof typeof statusColor]
                    }`}
                  >
                    {b.status}
                  </span>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Meal plans */}
      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-white">Meal plans</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {mealTabs.map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={mealFilter === tab.id ? "secondary" : "outline"}
                className={
                  mealFilter === tab.id
                    ? "bg-white text-black hover:bg-white"
                    : "border-white/20 text-white hover:bg-white/10"
                }
                onClick={() => setMealFilter(tab.id as typeof mealFilter)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-[#1f1f1f]">
          {filteredMeals.length === 0 ? (
            <div className="py-4 text-sm text-white/60">No meal plans in this filter.</div>
          ) : (
            filteredMeals.map((m) => (
              <div
                key={m.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-white/80"
              >
                <div className="space-y-1">
                  <div className="font-medium text-white">{m.title}</div>
                  <div className="text-white/60">
                    {m.patient} with {m.dietitian}
                  </div>
                  <div className="text-white/50">{m.when}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColor[m.status as keyof typeof statusColor]
                    }`}
                  >
                    {m.status}
                  </span>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleDelete(m.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
