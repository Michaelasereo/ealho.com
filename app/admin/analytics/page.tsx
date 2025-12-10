import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const kpis = [
  { label: "Weekly bookings", value: "820" },
  { label: "Active users", value: "6,140" },
  { label: "Dietitian utilization", value: "78%" },
  { label: "No-show rate", value: "4.1%" },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-white/60">
          High-level metrics to track platform health.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="bg-[#FFF4E0] border-[#f1e2c0] text-black shadow-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-black/70">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold text-black">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
