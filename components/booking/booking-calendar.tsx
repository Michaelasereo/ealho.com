"use client";

import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/en-gb";
import { cn } from "@/lib/utils";

const localizer = momentLocalizer(moment);

interface BookingCalendarProps {
  events: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
  }>;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  className?: string;
}

export function BookingCalendar({
  events,
  onSelectSlot,
  className,
}: BookingCalendarProps) {
  return (
    <div className={cn("h-[600px] w-full", className)}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={onSelectSlot}
        selectable
        defaultView="month"
        views={["month", "week", "day"] as View[]}
        style={{ height: "100%" }}
        className="rounded-lg border border-[#e5e7eb]"
      />
    </div>
  );
}
