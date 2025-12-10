"use client";

import { useState } from "react";
import Image from "next/image";
import { UserDashboardSidebar } from "@/components/layout/user-dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Clock, Video, ExternalLink, X } from "lucide-react";
import dayjs from "dayjs";

interface Dietician {
  id: string;
  name: string;
  qualification: string;
  profileImage?: string;
  description: string;
}

// Mock dieticians
const mockDieticians: Dietician[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    qualification: "Licensed Dietician, RD",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    description: "Dr. Sarah Johnson is a licensed registered dietitian with over 10 years of experience in clinical nutrition and wellness coaching. She specializes in weight management, diabetes care, and creating personalized meal plans that fit your lifestyle. Her approach focuses on sustainable dietary changes that promote long-term health and well-being.",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    qualification: "Certified Nutritionist, MS",
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    description: "Dr. Michael Chen is a certified nutritionist with a Master's degree in Nutritional Sciences. He has extensive experience in sports nutrition, meal planning for athletes, and helping individuals achieve their fitness goals through proper nutrition. His evidence-based approach combines the latest research with practical dietary strategies.",
  },
];

export default function BookACallPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 5 is success screen
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    notes: "",
  });
  const [selectedDietician, setSelectedDietician] = useState<string>("");
  const [viewingProfile, setViewingProfile] = useState<Dietician | null>(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Mock available dates (dates with dark grey background)
  const availableDates = ["12", "15", "17", "22", "29", "31"];

  // Mock time slots
  const timeSlots = [
    "01:15", "02:45", "03:30", "04:15", "05:00", "05:45",
    "06:30", "07:15", "08:00", "08:45", "09:30", "10:15",
    "11:00", "11:45", "12:30", "13:15", "14:00", "14:45",
  ];

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const handlePreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const handleDateClick = (day: number) => {
    const date = currentMonth.date(day).toDate();
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const isDateAvailable = (day: number) => {
    const dateStr = currentMonth.date(day).format("D");
    return availableDates.includes(dateStr);
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return dayjs(selectedDate).isSame(currentMonth.date(day), "day");
  };

  const isToday = (day: number) => {
    return dayjs().isSame(currentMonth.date(day), "day");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleCheckout = () => {
    if (selectedDate && selectedTime && selectedDietician) {
      const dietician = mockDieticians.find(d => d.id === selectedDietician);
      setBookingDetails({
        date: selectedDate,
        time: selectedTime,
        dietician: dietician?.name || "",
        duration: "45m",
        meetingLink: "https://meet.google.com/abc-defg-hij",
      });
      setStep(5); // Show success screen
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <UserDashboardSidebar />
      <main className="flex-1 bg-[#101010] overflow-y-auto ml-64 rounded-tl-lg flex items-center justify-center p-8">
        {/* Modal-like Container */}
        <div className="w-full max-w-7xl bg-[#171717] border border-[#262626] rounded-lg shadow-xl">
          {/* Step Indicator */}
          {step < 5 && (
            <div className="border-b border-[#262626] px-8 py-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= s
                          ? "bg-white text-black"
                          : "bg-[#262626] text-[#9ca3af]"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 4 && (
                      <div
                        className={`w-12 h-0.5 ${
                          step > s ? "bg-white" : "bg-[#262626]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Content - Center Aligned */}
          {step === 1 && (
            <div className="flex justify-center p-8">
              <div className="w-full max-w-5xl grid grid-cols-2 divide-x divide-[#262626]">
                {/* Left Pane - Service Information */}
                <div className="p-8 space-y-6">
                  {/* Logo and Brand */}
                  <div className="flex items-center gap-2 mb-4">
                    <Image
                      src="/daiyet logo.svg"
                      alt="Daiyet"
                      width={100}
                      height={30}
                      className="h-6 w-auto"
                    />
                  </div>

              {/* Service Title and Description */}
              <div>
                <h2 className="text-2xl font-semibold text-[#f9fafb] mb-4">
                  1-on-1 with a Licensed Dietician
                </h2>
                <p className="text-sm text-[#9ca3af] leading-relaxed mb-6">
                  This discovery call is your first step toward sustainable health. We'll discuss your goals, challenges, and lifestyle to determine how our 1-on-1 dietitian matching service can create a custom plan for you.
                </p>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#9ca3af]" />
                  <span className="text-sm text-[#f9fafb]">45m</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-[#9ca3af]" />
                  <span className="text-sm text-[#f9fafb]">Google Meet</span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-[#9ca3af]" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#f9fafb]">Africa/Lagos</span>
                    <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
                  </div>
                </div>
                  </div>
                </div>

                {/* Middle Pane - Enter Information */}
                <div className="p-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#f9fafb] mb-6">Enter your information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#D4D4D4] mb-2">
                          Name
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#D4D4D4] mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb]"
                        />
                      </div>
                      <div>
                        <Button
                          disabled
                          className="w-full bg-[#262626] text-[#9ca3af] cursor-not-allowed"
                        >
                          Signed in with Google
                        </Button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#D4D4D4] mb-2">
                          Additional Notes
                        </label>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={4}
                          className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb]"
                          placeholder="Any special requirements or information..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => setStep(2)}
                        className="bg-white hover:bg-gray-100 text-black px-6 py-2"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Two Columns */}
          {step === 2 && (
            <div className="flex justify-center p-8">
              <div className="w-full max-w-5xl grid grid-cols-2 divide-x divide-[#262626]">
                {/* Left Pane - Service Information */}
                <div className="p-8 space-y-6">
                  {/* Logo and Brand */}
                  <div className="flex items-center gap-2 mb-4">
                    <Image
                      src="/daiyet logo.svg"
                      alt="Daiyet"
                      width={100}
                      height={30}
                      className="h-6 w-auto"
                    />
                  </div>

                  {/* Service Title and Description */}
                  <div>
                    <h2 className="text-2xl font-semibold text-[#f9fafb] mb-4">
                      1-on-1 with a Licensed Dietician
                    </h2>
                    <p className="text-sm text-[#9ca3af] leading-relaxed mb-6">
                      This discovery call is your first step toward sustainable health. We'll discuss your goals, challenges, and lifestyle to determine how our 1-on-1 dietitian matching service can create a custom plan for you.
                    </p>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-[#9ca3af]" />
                      <span className="text-sm text-[#f9fafb]">45m</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-[#9ca3af]" />
                      <span className="text-sm text-[#f9fafb]">Google Meet</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-[#9ca3af]" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#f9fafb]">Africa/Lagos</span>
                        <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Pane - Select Dietician */}
                <div className="p-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#f9fafb] mb-6">Select Dietician</h2>
                    <div className="space-y-4">
                      {mockDieticians.map((dietician) => {
                        const isSelected = selectedDietician === dietician.id;
                        return (
                          <div
                            key={dietician.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected
                                ? "border-white bg-[#171717] ring-1 ring-white/30"
                                : "border-[#262626] bg-transparent hover:bg-[#171717]"
                            }`}
                            onClick={() => setSelectedDietician(dietician.id)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Profile Image */}
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#262626]">
                                  {dietician.profileImage ? (
                                    <Image
                                      src={dietician.profileImage}
                                      alt={dietician.name}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover grayscale"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-lg font-semibold">
                                        {dietician.name.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Name and Qualification */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-[#f9fafb] mb-1">
                                    {dietician.name}
                                  </h3>
                                  {isSelected && (
                                    <div className="flex items-center gap-1 text-xs text-white bg-[#2b2b2b] px-2 py-1 rounded-full">
                                      <Check className="h-3 w-3" />
                                      Selected
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-[#9ca3af]">
                                  {dietician.qualification}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-3 py-1 text-xs flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingProfile(dietician);
                                }}
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-6 py-2"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!selectedDietician}
                        className="bg-white hover:bg-gray-100 text-black px-6 py-2 disabled:opacity-50"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Three Columns */}
          {step === 3 && (
            <div className="flex justify-center p-8">
              <div className="w-full max-w-7xl grid grid-cols-3 divide-x divide-[#262626]">
                {/* Left Pane - Service Information */}
                <div className="p-8 space-y-6">
                  {/* Logo and Brand */}
                  <div className="flex items-center gap-2 mb-4">
                    <Image
                      src="/daiyet logo.svg"
                      alt="Daiyet"
                      width={100}
                      height={30}
                      className="h-6 w-auto"
                    />
                  </div>

                  {/* Service Title and Description */}
                  <div>
                    <h2 className="text-2xl font-semibold text-[#f9fafb] mb-4">
                      1-on-1 with a Licensed Dietician
                    </h2>
                    <p className="text-sm text-[#9ca3af] leading-relaxed mb-6">
                      This discovery call is your first step toward sustainable health. We'll discuss your goals, challenges, and lifestyle to determine how our 1-on-1 dietitian matching service can create a custom plan for you.
                    </p>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-[#9ca3af]" />
                      <span className="text-sm text-[#f9fafb]">45m</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-[#9ca3af]" />
                      <span className="text-sm text-[#f9fafb]">Google Meet</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-[#9ca3af]" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#f9fafb]">Africa/Lagos</span>
                        <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-6 py-2"
                    >
                      Back
                    </Button>
                  </div>
                </div>

                {/* Middle Pane - Calendar */}
                <div className="p-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handlePreviousMonth}
                      className="text-[#D4D4D4] hover:text-[#f9fafb]"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-sm font-medium text-[#f9fafb]">
                      {currentMonth.format("MMMM YYYY")}
                    </h3>
                    <button
                      onClick={handleNextMonth}
                      className="text-[#D4D4D4] hover:text-[#f9fafb]"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="text-xs text-[#9ca3af] text-center py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="h-10" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const day = idx + 1;
                      const isAvailable = isDateAvailable(day);
                      const isSelected = isDateSelected(day);
                      const isTodayDate = isToday(day);

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={`h-10 rounded text-sm transition-colors ${
                            isSelected
                              ? "bg-white text-black font-medium"
                              : isAvailable
                              ? "bg-[#262626] text-[#f9fafb] hover:bg-[#404040]"
                              : "text-[#9ca3af] opacity-50 cursor-not-allowed"
                          } ${isTodayDate && !isSelected ? "ring-1 ring-[#404040]" : ""}`}
                          disabled={!isAvailable}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-xs text-[#9ca3af]">Cal.com</span>
                  </div>
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => setStep(4)}
                        disabled={!selectedDate || !selectedTime}
                        className="bg-white hover:bg-gray-100 text-black px-6 py-2 disabled:opacity-50"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Pane - Time Slots */}
                {selectedDate && (
                  <div className="p-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-[#f9fafb]">
                          {dayjs(selectedDate).format("ddd D")}
                        </h3>
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 bg-white text-black rounded">
                            12h
                          </button>
                          <button className="text-xs px-2 py-1 bg-transparent text-[#9ca3af] rounded">
                            24h
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {timeSlots.map((time) => {
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              className={`w-full h-10 rounded text-xs flex items-center gap-2 px-3 transition-colors ${
                                isSelected
                                  ? "bg-white text-black font-medium"
                                  : "bg-transparent border border-[#262626] text-[#f9fafb] hover:bg-[#171717]"
                              }`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              {formatTime(time)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4 - One Column */}
          {step === 4 && (
            <div className="flex justify-center p-8">
              <div className="w-full max-w-2xl">
                <div className="p-8">
                  <h2 className="text-lg font-semibold text-[#f9fafb] mb-6">Order Summary</h2>
                  <div className="border border-[#262626] rounded-lg p-6 space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9ca3af]">Dietician</span>
                      <span className="text-[#f9fafb]">
                        {mockDieticians.find(d => d.id === selectedDietician)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9ca3af]">Date</span>
                      <span className="text-[#f9fafb]">
                        {selectedDate ? dayjs(selectedDate).format("MMM D, YYYY") : ""}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9ca3af]">Time</span>
                      <span className="text-[#f9fafb]">{formatTime(selectedTime)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9ca3af]">Duration</span>
                      <span className="text-[#f9fafb]">45 minutes</span>
                    </div>
                    <div className="border-t border-[#262626] pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-[#f9fafb]">Total</span>
                        <span className="text-lg font-semibold text-[#f9fafb]">₦5,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(3)}
                      variant="outline"
                      className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-6 py-2"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      className="bg-white hover:bg-gray-100 text-black px-6 py-2"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Screen */}
          {step === 5 && bookingDetails && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-[#f9fafb] mb-2">Booking Confirmed!</h2>
              <p className="text-sm text-[#9ca3af] mb-6">
                Your booking has been confirmed
              </p>
              <div className="border border-[#262626] rounded-lg p-6 space-y-4 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-[#9ca3af]" />
                  <div>
                    <div className="text-xs text-[#9ca3af]">Date</div>
                    <div className="text-sm text-[#f9fafb]">
                      {dayjs(bookingDetails.date).format("MMM D, YYYY")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#9ca3af]" />
                  <div>
                    <div className="text-xs text-[#9ca3af]">Time</div>
                    <div className="text-sm text-[#f9fafb]">
                      {formatTime(bookingDetails.time)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#9ca3af]" />
                  <div>
                    <div className="text-xs text-[#9ca3af]">Duration</div>
                    <div className="text-sm text-[#f9fafb]">{bookingDetails.duration}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-[#9ca3af]" />
                  <div>
                    <div className="text-xs text-[#9ca3af]">Meeting Link</div>
                    <a
                      href={bookingDetails.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {bookingDetails.meetingLink}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mt-6 max-w-md mx-auto">
                <Button
                  onClick={() => window.open(bookingDetails.meetingLink, '_blank')}
                  className="w-full bg-white hover:bg-gray-100 text-black px-6 py-2"
                >
                  Join Meeting
                </Button>
                <div className="text-sm text-[#9ca3af] mb-2">Add to Calendar</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2 text-xs"
                  >
                    Google Calendar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2 text-xs"
                  >
                    Outlook
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2 text-xs"
                  >
                    iCal
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setStep(1);
                    setSelectedDate(null);
                    setSelectedTime("");
                    setSelectedDietician("");
                    setBookingDetails(null);
                  }}
                  variant="outline"
                  className="w-full bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-6 py-2"
                >
                  Book Another Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* View Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#171717] border border-[#262626] rounded-lg w-full max-w-2xl p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f9fafb]">Dietician Profile</h2>
              <button
                onClick={() => setViewingProfile(null)}
                className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-[#262626]">
                  {viewingProfile.profileImage ? (
                    <Image
                      src={viewingProfile.profileImage}
                      alt={viewingProfile.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover grayscale"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-3xl font-semibold">
                        {viewingProfile.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Qualification */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#f9fafb] mb-2">
                  {viewingProfile.name}
                </h3>
                <p className="text-sm text-[#9ca3af]">
                  {viewingProfile.qualification}
                </p>
              </div>

              {/* Description */}
              <div className="border-t border-[#262626] pt-6">
                <h4 className="text-sm font-medium text-[#D4D4D4] mb-3">About</h4>
                <p className="text-sm text-[#9ca3af] leading-relaxed">
                  {viewingProfile.description}
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-[#262626]">
                <Button
                  onClick={() => setViewingProfile(null)}
                  className="bg-white hover:bg-gray-100 text-black px-6 py-2"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
