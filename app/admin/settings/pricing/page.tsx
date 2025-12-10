"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type MealPlan = {
  id: string;
  name: string;
  price: string;
  details: string;
};

const seedPackages: MealPlan[] = [
  { id: "p1", name: "Starter plan", price: "₦25,000", details: "1-week plan, email delivery" },
  { id: "p2", name: "Standard plan", price: "₦45,000", details: "2-week plan, email + PDF" },
  { id: "p3", name: "Premium plan", price: "₦70,000", details: "4-week plan, email + PDF + check-in" },
];

export default function AdminPricingPage() {
  const [packages, setPackages] = useState<MealPlan[]>(seedPackages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MealPlan>({
    id: "",
    name: "",
    price: "",
    details: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({ id: "", name: "", price: "", details: "" });
  };

  const handleSavePackage = () => {
    if (!form.name.trim() || !form.price.trim()) return;

    if (editingId) {
      setPackages((prev) =>
        prev.map((pkg) => (pkg.id === editingId ? { ...form, id: editingId } : pkg))
      );
    } else {
      const newId = `pkg-${Date.now()}`;
      setPackages((prev) => [...prev, { ...form, id: newId }]);
    }
    resetForm();
  };

  const handleEdit = (pkg: MealPlan) => {
    setEditingId(pkg.id);
    setForm(pkg);
  };

  const handleDelete = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Pricing</h1>
        <p className="text-white/60">
          Configure booking session rates and meal plan packages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111] border-[#1f1f1f]">
          <CardHeader>
            <CardTitle className="text-white">Booking sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80" htmlFor="session-price">
                Default session price
              </Label>
              <Input
                id="session-price"
                defaultValue="₦15,000"
                className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80" htmlFor="session-notes">
                Notes (internal)
              </Label>
              <Textarea
                id="session-notes"
                placeholder="Add internal notes about pricing rules or exceptions."
                className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
              />
            </div>
            <Button className="bg-white text-black hover:bg-white/90">Save session pricing</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-[#1f1f1f]">
          <CardHeader>
            <CardTitle className="text-white">
              Meal plan packages {editingId ? "(editing)" : "(add new)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80" htmlFor="plan-name">
                Package name
              </Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Premium 4-week plan"
                className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80" htmlFor="plan-price">
                Price
              </Label>
              <Input
                id="plan-price"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="₦70,000"
                className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80" htmlFor="plan-details">
                Details / deliverables
              </Label>
              <Textarea
                id="plan-details"
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                placeholder="What the package includes, delivery cadence, check-ins, etc."
                className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-white text-black hover:bg-white/90" onClick={handleSavePackage}>
                {editingId ? "Update package" : "Save package"}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={resetForm}
                >
                  Cancel edit
                </Button>
              )}
            </div>

            <div className="pt-2 space-y-3">
              <div className="text-sm text-white/70">Existing packages</div>
              <div className="space-y-2">
                {packages.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[#1f1f1f] bg-[#0b0b0b] px-3 py-3"
                  >
                    <div className="space-y-1">
                      <div className="text-white font-medium">{p.name}</div>
                      <div className="text-white/70 text-sm">{p.details}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-white font-semibold text-sm whitespace-nowrap">{p.price}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {packages.length === 0 && (
                  <div className="text-sm text-white/60">No packages configured.</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
