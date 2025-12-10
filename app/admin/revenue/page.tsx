"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const transactions = [
  { id: "t1", type: "Session", dietitian: "Dt. Sarah Ogun", gross: 20000, companyCutPct: 10, date: "2025-03-01" },
  { id: "t2", type: "Meal plan", dietitian: "Dt. Kemi Musa", gross: 45000, companyCutPct: 12, date: "2025-03-02" },
  { id: "t3", type: "Session", dietitian: "Dt. Tayo Bisi", gross: 18000, companyCutPct: 10, date: "2025-03-03" },
  { id: "t4", type: "Meal plan", dietitian: "Dt. Sarah Ogun", gross: 70000, companyCutPct: 12, date: "2025-03-04" },
];

const formatCurrency = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function AdminRevenuePage() {
  const totals = useMemo(() => {
    const gross = transactions.reduce((sum, t) => sum + t.gross, 0);
    const companyCut = transactions.reduce((sum, t) => sum + (t.companyCutPct / 100) * t.gross, 0);
    const dietitianNet = gross - companyCut;
    return { gross, companyCut, dietitianNet };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Revenue</h1>
        <p className="text-white/60">Company cut totals and transaction history.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#FFF4E0] border-[#f1e2c0] text-black shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-black/70">Gross</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-black">
            {formatCurrency(totals.gross)}
          </CardContent>
        </Card>
        <Card className="bg-[#FFF4E0] border-[#f1e2c0] text-black shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-black/70">Company cut</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-black">
            {formatCurrency(totals.companyCut)}
          </CardContent>
        </Card>
        <Card className="bg-[#FFF4E0] border-[#f1e2c0] text-black shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-black/70">Dietitian net</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-black">
            {formatCurrency(totals.dietitianNet)}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-white">Transaction history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/80">
          {transactions.map((t) => {
            const cut = Math.round((t.companyCutPct / 100) * t.gross);
            return (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] px-3 py-3"
              >
                <div className="space-y-1">
                  <div className="text-white font-medium">{t.type}</div>
                  <div className="text-white/70">{t.dietitian}</div>
                  <div className="text-white/50 text-xs">{t.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-white">
                    Gross: {formatCurrency(t.gross)}
                  </div>
                  <div className="text-white/70">
                    Cut: {t.companyCutPct}% ({formatCurrency(cut)})
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
