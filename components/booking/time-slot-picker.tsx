"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimeSlotPickerProps {
  date: Date;
  duration: number; // in minutes
  availableSlots?: string[];
  onSelectTime: (time: string) => void;
  selectedTime?: string;
  className?: string;
}

// Generate time slots for a day (9 AM to 6 PM)
function generateTimeSlots(duration: number): string[] {
  const slots: string[] = [];
  const start = dayjs().hour(9).minute(0);
  const end = dayjs().hour(18).minute(0);

  let current = start;
  while (current.isBefore(end)) {
    slots.push(current.format("HH:mm"));
    current = current.add(duration, "minute");
  }

  return slots;
}

export function TimeSlotPicker({
  date,
  duration,
  availableSlots,
  onSelectTime,
  selectedTime,
  className,
}: TimeSlotPickerProps) {
  const allSlots = generateTimeSlots(duration);
  const slots = availableSlots || allSlots;

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-[#111827]">
        {dayjs(date).format("dddd, MMMM D, YYYY")}
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((time) => {
          const isSelected = selectedTime === time;
          const slotDateTime = dayjs(date).hour(parseInt(time.split(":")[0])).minute(parseInt(time.split(":")[1]));
          const isPast = slotDateTime.isBefore(dayjs());

          return (
            <Button
              key={time}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => !isPast && onSelectTime(time)}
              disabled={isPast}
              className={cn(
                "h-12",
                isPast && "opacity-50 cursor-not-allowed"
              )}
            >
              {time}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
