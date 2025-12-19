"use client";

import { useState } from "react";
import { UserDashboardSidebar } from "@/components/layout/user-dashboard-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

interface SessionNote {
  id: string;
  booking_id: string;
  therapist_id: string;
  client_id: string;
  client_name: string;
  session_number: number;
  session_date: string;
  session_time: string;
  therapist_name: string;
  location: string;
  patient_complaint?: string;
  personal_history?: string;
  family_history?: string;
  presentation?: string;
  formulation_and_diagnosis?: string;
  treatment_plan?: string;
  assignments?: string;
  status: "PENDING" | "COMPLETED";
  created_at: string;
  updated_at: string;
  completed_at?: string;
  bookings?: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    booking_status: string;
  };
  therapist?: {
    id: string;
    name: string;
    email: string;
  };
}

interface SessionNotesPageClientProps {
  notes: SessionNote[];
}

export default function SessionNotesPageClient({
  notes: initialNotes,
}: SessionNotesPageClientProps) {
  const [notes] = useState(initialNotes);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNote = (noteId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      {/* Sidebar */}
      <UserDashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 bg-[#101010] overflow-y-auto w-full lg:w-auto lg:ml-64 lg:rounded-tl-lg pb-16 lg:pb-0">
        <div className="p-6 lg:p-8 pt-14 lg:pt-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[15px] font-semibold text-[#f9fafb] mb-1">
              Session Notes
            </h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              View your therapy session notes (read-only).
            </p>
          </div>

          {/* Notes List */}
          <div className="space-y-4">
            {notes.length === 0 ? (
              <div className="text-center py-12 text-[#9ca3af]">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No session notes available</p>
              </div>
            ) : (
              notes.map((note) => {
                const isExpanded = expandedNotes.has(note.id);
                return (
                  <div
                    key={note.id}
                    className="bg-[#171717] border border-[#262626] rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleNote(note.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-[#404040] text-[#f9fafb] px-2 py-1 rounded text-xs font-medium">
                          Session {note.session_number}
                        </span>
                        <div className="text-left">
                          <p className="text-[#f9fafb] font-medium">
                            {formatDate(note.session_date)} • {note.session_time}
                          </p>
                          <p className="text-sm text-[#9ca3af]">
                            Therapist: {note.therapist_name}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-[#9ca3af]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#9ca3af]" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-[#262626] space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-[#9ca3af] mb-1">
                            Patient's Complaint
                          </h4>
                          <p className="text-[#f9fafb]">
                            {note.patient_complaint || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#9ca3af] mb-1">
                            Personal History
                          </h4>
                          <p className="text-[#f9fafb]">
                            {note.personal_history || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#9ca3af] mb-1">
                            Family History
                          </h4>
                          <p className="text-[#f9fafb]">
                            {note.family_history || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#9ca3af] mb-1">
                            Presentation
                          </h4>
                          <p className="text-[#f9fafb]">
                            {note.presentation || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#9ca3af] mb-1">
                            Formulation and Diagnosis
                          </h4>
                          <p className="text-[#f9fafb]">
                            {note.formulation_and_diagnosis || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#9ca3af] mb-1">
                            Treatment Plan
                          </h4>
                          <p className="text-[#f9fafb]">
                            {note.treatment_plan || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#9ca3af] mb-1">
                            Assignments
                          </h4>
                          <p className="text-[#f9fafb]">
                            {note.assignments || "Not provided"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

