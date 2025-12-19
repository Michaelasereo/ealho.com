"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface SessionNote {
  id: string;
  booking_id: string;
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
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export function ClientDetailsModal({
  isOpen,
  onClose,
  clientId,
}: ClientDetailsModalProps) {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientNotes();
    }
  }, [isOpen, clientId]);

  const fetchClientNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/session-notes/client/${clientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch client notes");
      }
      const { notes: clientNotes } = await response.json();
      setNotes(clientNotes || []);
    } catch (error) {
      console.error("Error fetching client notes:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#262626] p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-[#f9fafb]">
            Client Session Notes
          </h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#f9fafb] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-[#9ca3af]">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 text-[#9ca3af]">
              No session notes found for this client.
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => {
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
                            {note.therapist_name}
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

