"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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

interface FillNotesFormProps {
  note: SessionNote;
  onSave: (updatedNote: Partial<SessionNote>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function FillNotesForm({
  note,
  onSave,
  onCancel,
  isLoading = false,
}: FillNotesFormProps) {
  const [formData, setFormData] = useState({
    patient_complaint: note.patient_complaint || "",
    personal_history: note.personal_history || "",
    family_history: note.family_history || "",
    presentation: note.presentation || "",
    formulation_and_diagnosis: note.formulation_and_diagnosis || "",
    treatment_plan: note.treatment_plan || "",
    assignments: note.assignments || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.patient_complaint.trim()) {
      newErrors.patient_complaint = "Patient's complaint is required";
    }
    if (!formData.personal_history.trim()) {
      newErrors.personal_history = "Personal history is required";
    }
    if (!formData.family_history.trim()) {
      newErrors.family_history = "Family history is required";
    }
    if (!formData.presentation.trim()) {
      newErrors.presentation = "Presentation is required";
    }
    if (!formData.formulation_and_diagnosis.trim()) {
      newErrors.formulation_and_diagnosis = "Formulation and diagnosis is required";
    }
    if (!formData.treatment_plan.trim()) {
      newErrors.treatment_plan = "Treatment plan is required";
    }
    if (!formData.assignments.trim()) {
      newErrors.assignments = "Assignments is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSave(formData);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Biodata Section (Read-only) */}
      <div className="space-y-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
        <h3 className="text-lg font-semibold text-[#f9fafb] mb-4">
          Biodata
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[#9ca3af] text-sm">Client Name</Label>
            <Input
              value={note.client_name}
              disabled
              className="bg-[#0a0a0a] border-[#262626] text-[#6b7280] cursor-not-allowed"
            />
          </div>
          <div>
            <Label className="text-[#9ca3af] text-sm">Session Number</Label>
            <Input
              value={`Session ${note.session_number}`}
              disabled
              className="bg-[#0a0a0a] border-[#262626] text-[#6b7280] cursor-not-allowed"
            />
          </div>
          <div>
            <Label className="text-[#9ca3af] text-sm">Date</Label>
            <Input
              value={formatDate(note.session_date)}
              disabled
              className="bg-[#0a0a0a] border-[#262626] text-[#6b7280] cursor-not-allowed"
            />
          </div>
          <div>
            <Label className="text-[#9ca3af] text-sm">Time</Label>
            <Input
              value={note.session_time}
              disabled
              className="bg-[#0a0a0a] border-[#262626] text-[#6b7280] cursor-not-allowed"
            />
          </div>
          <div>
            <Label className="text-[#9ca3af] text-sm">Therapist Name</Label>
            <Input
              value={note.therapist_name}
              disabled
              className="bg-[#0a0a0a] border-[#262626] text-[#6b7280] cursor-not-allowed"
            />
          </div>
          <div>
            <Label className="text-[#9ca3af] text-sm">Location</Label>
            <Input
              value={note.location}
              disabled
              className="bg-[#0a0a0a] border-[#262626] text-[#6b7280] cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-6">
        <div>
          <Label htmlFor="patient_complaint" className="text-[#f9fafb]">
            Patient's Complaint <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="patient_complaint"
            value={formData.patient_complaint}
            onChange={(e) =>
              setFormData({ ...formData, patient_complaint: e.target.value })
            }
            placeholder="Describe the patient's complaint..."
            rows={4}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#404040] resize-none mt-2"
          />
          {errors.patient_complaint && (
            <p className="text-red-500 text-sm mt-1">{errors.patient_complaint}</p>
          )}
        </div>

        <div>
          <Label htmlFor="personal_history" className="text-[#f9fafb]">
            Personal History <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="personal_history"
            value={formData.personal_history}
            onChange={(e) =>
              setFormData({ ...formData, personal_history: e.target.value })
            }
            placeholder="Describe the patient's personal history..."
            rows={4}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#404040] resize-none mt-2"
          />
          {errors.personal_history && (
            <p className="text-red-500 text-sm mt-1">{errors.personal_history}</p>
          )}
        </div>

        <div>
          <Label htmlFor="family_history" className="text-[#f9fafb]">
            Family History <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="family_history"
            value={formData.family_history}
            onChange={(e) =>
              setFormData({ ...formData, family_history: e.target.value })
            }
            placeholder="Describe the patient's family history..."
            rows={4}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#404040] resize-none mt-2"
          />
          {errors.family_history && (
            <p className="text-red-500 text-sm mt-1">{errors.family_history}</p>
          )}
        </div>

        <div>
          <Label htmlFor="presentation" className="text-[#f9fafb]">
            Presentation <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="presentation"
            value={formData.presentation}
            onChange={(e) =>
              setFormData({ ...formData, presentation: e.target.value })
            }
            placeholder="Describe the patient's presentation..."
            rows={4}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#404040] resize-none mt-2"
          />
          {errors.presentation && (
            <p className="text-red-500 text-sm mt-1">{errors.presentation}</p>
          )}
        </div>

        <div>
          <Label htmlFor="formulation_and_diagnosis" className="text-[#f9fafb]">
            Formulation and Diagnosis <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="formulation_and_diagnosis"
            value={formData.formulation_and_diagnosis}
            onChange={(e) =>
              setFormData({
                ...formData,
                formulation_and_diagnosis: e.target.value,
              })
            }
            placeholder="Provide formulation and diagnosis..."
            rows={4}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#404040] resize-none mt-2"
          />
          {errors.formulation_and_diagnosis && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formulation_and_diagnosis}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="treatment_plan" className="text-[#f9fafb]">
            Treatment Plan <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="treatment_plan"
            value={formData.treatment_plan}
            onChange={(e) =>
              setFormData({ ...formData, treatment_plan: e.target.value })
            }
            placeholder="Describe the treatment plan..."
            rows={4}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#404040] resize-none mt-2"
          />
          {errors.treatment_plan && (
            <p className="text-red-500 text-sm mt-1">{errors.treatment_plan}</p>
          )}
        </div>

        <div>
          <Label htmlFor="assignments" className="text-[#f9fafb]">
            Assignments <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="assignments"
            value={formData.assignments}
            onChange={(e) =>
              setFormData({ ...formData, assignments: e.target.value })
            }
            placeholder="Describe assignments given to the patient..."
            rows={4}
            className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#404040] resize-none mt-2"
          />
          {errors.assignments && (
            <p className="text-red-500 text-sm mt-1">{errors.assignments}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#262626]">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="bg-transparent border-[#404040] text-[#f9fafb] hover:bg-[#262626]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-white hover:bg-gray-100 text-black px-6 py-2 font-medium"
        >
          {isLoading ? "Saving..." : "Save Notes"}
        </Button>
      </div>
    </form>
  );
}

