"use client";

import { useState } from "react";
import { MoreVertical, Video } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";

interface BookingCardProps {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  title: string;
  description: string;
  message?: string;
  participants: string[];
  meetingLink?: string;
}

export function BookingCard({
  id,
  date,
  startTime,
  endTime,
  title,
  description,
  message,
  participants,
  meetingLink,
}: BookingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedDate = dayjs(date).format("ddd, D MMM");
  const formattedStartTime = dayjs(startTime).format("h:mma").toLowerCase();
  const formattedEndTime = dayjs(endTime).format("h:mma").toLowerCase();

  return (
    <div 
      className="w-full border border-[#262626] rounded-lg px-6 py-4 transition-colors mb-4"
      style={{ 
        backgroundColor: isHovered ? '#171717' : 'transparent'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Date and Time */}
          <div className="mb-3">
            <div className="text-sm font-medium text-[#f9fafb] mb-1">
              {formattedDate}
            </div>
            <div className="text-sm text-[#A2A2A2] mb-2">
              {formattedStartTime} - {formattedEndTime}
            </div>
            {meetingLink && (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#262626] text-xs h-7 px-3 mb-3"
                onClick={() => window.open(meetingLink, '_blank')}
              >
                <Video className="h-3 w-3 mr-1.5" />
                Join Google Meet
              </Button>
            )}
          </div>

          {/* Event Description */}
          <div className="text-sm text-[#d1d5db] mb-3">
            {description}
          </div>

          {/* Quote Bubble */}
          {message && (
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-md px-3 py-2 mb-3">
              <p className="text-sm text-[#d1d5db] italic">"{message}"</p>
            </div>
          )}

          {/* Participants */}
          <div className="text-sm text-[#A2A2A2]">
            {participants.join(" and ")}
          </div>
        </div>

        {/* Ellipsis Menu */}
        <div className="flex items-center ml-6">
          <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
