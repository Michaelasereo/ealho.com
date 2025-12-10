/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total users", value: "12,480" },
  { label: "Active dietitians", value: "214" },
  { label: "Bookings (30d)", value: "3,420" },
  { label: "Payouts pending", value: "₦4.8m" },
];

const seedSessions = [
  {
    id: "sess-1",
    title: "Follow-up consult",
    patient: "Amaka Bello",
    dietitian: "Dt. Sarah Ogun",
    when: "Today, 2:30 PM",
  },
  {
    id: "sess-2",
    title: "Initial assessment",
    patient: "Tom Ade",
    dietitian: "Dt. Kemi Musa",
    when: "Tomorrow, 11:00 AM",
  },
  {
    id: "sess-3",
    title: "Meal plan review",
    patient: "Lisa John",
    dietitian: "Dt. Tayo Bisi",
    when: "Fri, 9:00 AM",
  },
];

export default function AdminOverviewPage() {
  const [sessions, setSessions] = useState(seedSessions);

  const hasSessions = useMemo(() => sessions.length > 0, [sessions]);

  const handleDelete = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="text-white/60">Quick pulse on the platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => (
          <Card
            key={item.label}
            className="bg-[#FFF4E0] border-[#f1e2c0] text-black shadow-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-black/70">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold text-black">
                {item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white">Upcoming sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasSessions ? (
            sessions.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[#1f1f1f] rounded-lg px-4 py-3 bg-[#0c0c0c]"
              >
                <div className="space-y-1 text-sm">
                  <div className="text-white font-medium">{s.title}</div>
                  <div className="text-white/70">
                    {s.patient} with {s.dietitian}
                  </div>
                  <div className="text-white/50">{s.when}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => handleDelete(s.id)}
                >
                  Delete
                </Button>
              </div>
            ))
          ) : (
            <div className="text-sm text-white/60">No upcoming sessions.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
