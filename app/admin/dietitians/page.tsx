"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const seedDietitians = [
  { id: "d1", name: "Dt. Sarah Ogun", specialty: "Sports nutrition", status: "verified" },
  { id: "d2", name: "Dt. Kemi Musa", specialty: "Weight management", status: "pending" },
  { id: "d3", name: "Dt. Tayo Bisi", specialty: "Pediatrics", status: "verified" },
];

export default function AdminDietitiansPage() {
  const [dietitians, setDietitians] = useState(seedDietitians);

  const handleDelete = (id: string) => {
    setDietitians((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSuspend = (id: string) => {
    setDietitians((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "suspended" } : d))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dietitians</h1>
        <p className="text-white/60">Verify and manage providers.</p>
      </div>

      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-white">Roster</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-[#1f1f1f]">
          {dietitians.length === 0 ? (
            <div className="py-4 text-sm text-white/60">No dietitians.</div>
          ) : (
            dietitians.map((d) => (
              <div
                key={d.id}
                className="py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-sm text-white/80 border-b border-[#1f1f1f] last:border-b-0"
              >
                <div>
                  <div className="font-medium text-white">{d.name}</div>
                  <div className="text-white/60">{d.specialty}</div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      d.status === "verified"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : d.status === "suspended"
                          ? "bg-red-500/20 text-red-200"
                          : "bg-amber-500/20 text-amber-200"
                    }`}
                  >
                    {d.status}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    View enrollment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleSuspend(d.id)}
                  >
                    Suspend
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleDelete(d.id)}
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
