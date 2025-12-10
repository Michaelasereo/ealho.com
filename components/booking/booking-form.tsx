"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BookingFormProps {
  eventType: {
    id: string;
    title: string;
    description?: string;
    length: number;
    price: number;
  };
  selectedDate: Date;
  selectedTime: string;
  onSubmit: (data: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export function BookingForm({
  eventType,
  selectedDate,
  selectedTime,
  onSubmit,
  isLoading,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{eventType.title}</CardTitle>
        <CardDescription>{eventType.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 800 000 0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requirements or information..."
              rows={4}
            />
          </div>
          <div className="pt-4 border-t border-[#e5e7eb]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[#6b7280]">Duration</span>
              <span className="font-medium">{eventType.length} minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6b7280]">Price</span>
              <span className="text-xl font-semibold">
                ₦{eventType.price.toLocaleString()}
              </span>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Continue to Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
