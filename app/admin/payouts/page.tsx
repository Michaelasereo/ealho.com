"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PayoutRow = {
  id: string;
  dietitian: string;
  due: number;
  paid: number;
  sessionCount: number;
  platformCutPct: number;
};

const seedPayouts: PayoutRow[] = [
  { id: "p1", dietitian: "Dt. Sarah Ogun", due: 180000, paid: 0, sessionCount: 12, platformCutPct: 10 },
  { id: "p2", dietitian: "Dt. Kemi Musa", due: 92000, paid: 20000, sessionCount: 7, platformCutPct: 10 },
  { id: "p3", dietitian: "Dt. Tayo Bisi", due: 140000, paid: 140000, sessionCount: 10, platformCutPct: 12 },
];

const formatCurrency = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function AdminPayoutsPage() {
  const [rows, setRows] = useState<PayoutRow[]>(seedPayouts);

  const totals = useMemo(() => {
    const totalDue = rows.reduce((sum, r) => sum + r.due, 0);
    const totalPaid = rows.reduce((sum, r) => sum + r.paid, 0);
    return { totalDue, totalPaid, totalRemaining: totalDue - totalPaid };
  }, [rows]);

  const handlePaidChange = (id: string, value: string) => {
    const num = Number(value.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(num)) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, paid: num } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Payouts</h1>
          <p className="text-white/60">Track manual payouts and remaining balances.</p>
        </div>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
          Export CSV
        </Button>
      </div>

      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white">Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white">
          <div className="rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] p-3">
            <div className="text-white/60">Total due</div>
            <div className="text-xl font-semibold">{formatCurrency(totals.totalDue)}</div>
          </div>
          <div className="rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] p-3">
            <div className="text-white/60">Paid manually</div>
            <div className="text-xl font-semibold">{formatCurrency(totals.totalPaid)}</div>
          </div>
          <div className="rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] p-3">
            <div className="text-white/60">Remaining</div>
            <div className="text-xl font-semibold">{formatCurrency(totals.totalRemaining)}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-white">Payout queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((r) => {
            const remaining = Math.max(r.due - r.paid, 0);
            const platformCut = Math.round((r.platformCutPct / 100) * r.due);
            const dueAfterCut = Math.max(r.due - platformCut, 0);
            return (
              <div
                key={r.id}
                className="rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] px-4 py-3 space-y-3 text-sm text-white/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-white font-medium">{r.dietitian}</div>
                    <div className="text-white/60">Sessions: {r.sessionCount}</div>
                    <div className="text-white/60">
                      Platform cut: {r.platformCutPct}% ({formatCurrency(platformCut)})
                    </div>
                  </div>
                  <div className="space-y-1 text-right sm:text-right">
                    <div className="text-white">Due: {formatCurrency(r.due)}</div>
                    <div className="text-white/70">After cut: {formatCurrency(dueAfterCut)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <div className="text-white/70">Paid manually</div>
                    <Input
                      value={r.paid}
                      onChange={(e) => handlePaidChange(r.id, e.target.value)}
                      className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/70">Remaining</div>
                    <div className="text-white font-semibold">{formatCurrency(remaining)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/70">Platform cut (estimate)</div>
                    <div className="text-white font-semibold">{formatCurrency(platformCut)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
