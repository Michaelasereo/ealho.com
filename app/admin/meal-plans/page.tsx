"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MealPlan = {
  id: string;
  title: string;
  patient: string;
  dietitian: string;
  status: "pending" | "paid" | "sent";
  note?: string;
  pdfUrl?: string;
};

const seedPlans: MealPlan[] = [
  { id: "m1", title: "Starter plan", patient: "Sam Ade", dietitian: "Dt. Sarah Ogun", status: "pending", note: "Awaiting payment confirmation" },
  { id: "m2", title: "Premium plan", patient: "Kate Obi", dietitian: "Dt. Kemi Musa", status: "paid", note: "Payment received, drafting" },
  {
    id: "m3",
    title: "Standard plan",
    patient: "Ife Tolu",
    dietitian: "Dt. Tayo Bisi",
    status: "sent",
    note: "Sent via email",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

const statusTone = {
  pending: "bg-amber-500/20 text-amber-200",
  paid: "bg-blue-500/20 text-blue-200",
  sent: "bg-emerald-500/20 text-emerald-200",
};

const tabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "sent", label: "Sent" },
];

export default function AdminMealPlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>(seedPlans);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "sent">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return plans;
    return plans.filter((p) => p.status === filter);
  }, [plans, filter]);

  const handleDelete = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Meal plans</h1>
          <p className="text-white/60">Track pending, paid, and sent plans.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={filter === tab.id ? "secondary" : "outline"}
              className={
                filter === tab.id
                  ? "bg-white text-black hover:bg-white"
                  : "border-white/20 text-white hover:bg-white/10"
              }
              onClick={() => setFilter(tab.id as typeof filter)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-white">Plans</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-[#1f1f1f]">
          {filtered.length === 0 ? (
            <div className="py-4 text-sm text-white/60">No meal plans in this filter.</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-white/80"
              >
                <div className="space-y-1">
                  <div className="text-white font-medium">{p.title}</div>
                  <div className="text-white/70">
                    {p.patient} with {p.dietitian}
                  </div>
                  <div className="text-white/50">{p.note || "No note"}</div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusTone[p.status as keyof typeof statusTone]
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.status === "sent" && (
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      disabled={!p.pdfUrl}
                      onClick={() => p.pdfUrl && window.open(p.pdfUrl, "_blank")}
                    >
                      View PDF
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleDelete(p.id)}
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
