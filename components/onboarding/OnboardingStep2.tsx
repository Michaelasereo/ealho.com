"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface OnboardingStep2Props {
  role: "THERAPIST" | "DIETITIAN";
  bio: string;
  licenseNumber: string;
  qualifications: string[];
  experience: string;
  specialization: string[];
  onFieldChange: (field: string, value: any) => void;
}

const THERAPIST_SPECIALIZATIONS = [
  "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)",
  "Psychodynamic Therapy",
  "Humanistic Therapy",
  "Trauma-Informed Therapy",
];

const DIETITIAN_SPECIALIZATIONS = [
  "Weight management",
  "Sports nutrition",
  "Pediatrics",
  "Clinical/medical",
  "Plant-based",
];

const EXPERIENCES = ["0-1", "1-3", "3-5", "5-10", "10+"];

export function OnboardingStep2({
  role,
  bio,
  licenseNumber,
  qualifications,
  experience,
  specialization,
  onFieldChange,
}: OnboardingStep2Props) {
  const [qualificationInput, setQualificationInput] = useState("");

  const specializations = role === "THERAPIST" ? THERAPIST_SPECIALIZATIONS : DIETITIAN_SPECIALIZATIONS;
  const bioWordCount = bio.trim().split(/\s+/).filter(Boolean).length;

  const handleAddQualification = () => {
    if (qualificationInput.trim() && !qualifications.includes(qualificationInput.trim())) {
      onFieldChange("qualifications", [...qualifications, qualificationInput.trim()]);
      setQualificationInput("");
    }
  };

  const handleRemoveQualification = (index: number) => {
    onFieldChange(
      "qualifications",
      qualifications.filter((_, i) => i !== index)
    );
  };

  const handleSpecializationToggle = (spec: string) => {
    if (specialization.includes(spec)) {
      onFieldChange(
        "specialization",
        specialization.filter((s) => s !== spec)
      );
    } else {
      if (specialization.length < 5) {
        onFieldChange("specialization", [...specialization, spec]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-32 h-32 mx-auto mb-4 bg-[#1f1f1f] rounded-full flex items-center justify-center">
          <svg
            className="w-16 h-16 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Professional Information</h2>
        <p className="text-white/60 text-sm">Share your professional background</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/80 text-sm">Professional Summary (100 words max) *</Label>
          <Textarea
            value={bio}
            onChange={(e) => onFieldChange("bio", e.target.value)}
            className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[120px]"
            placeholder="Briefly describe your background, approach, and focus areas."
          />
          <div
            className={`text-xs ${
              bioWordCount > 100 ? "text-red-300" : "text-white/60"
            }`}
          >
            {bioWordCount} / 100 words
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">License Number *</Label>
            <Input
              value={licenseNumber}
              onChange={(e) => onFieldChange("licenseNumber", e.target.value)}
              className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
              placeholder="State-issued license"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80 text-sm">Years of Experience *</Label>
            <select
              value={experience}
              onChange={(e) => onFieldChange("experience", e.target.value)}
              className="w-full rounded-md bg-[#0b0b0b] border border-[#1f1f1f] text-white px-3 py-3 min-h-[52px]"
            >
              <option value="">Select</option>
              {EXPERIENCES.map((exp) => (
                <option key={exp} value={exp}>
                  {exp} years
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80 text-sm">Qualifications</Label>
          <div className="flex gap-2">
            <Input
              value={qualificationInput}
              onChange={(e) => setQualificationInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddQualification();
                }
              }}
              className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
              placeholder="Add qualification (press Enter)"
            />
            <button
              type="button"
              onClick={handleAddQualification}
              className="px-4 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-colors"
            >
              Add
            </button>
          </div>
          {qualifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {qualifications.map((qual, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#1f1f1f] text-white rounded-md text-sm"
                >
                  {qual}
                  <button
                    type="button"
                    onClick={() => handleRemoveQualification(index)}
                    className="hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-white/80 text-sm">
            Specialization (Select up to 5) *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {specializations.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => handleSpecializationToggle(spec)}
                className={`p-3 rounded-md border text-left transition-colors ${
                  specialization.includes(spec)
                    ? "bg-white text-black border-white"
                    : "bg-[#0b0b0b] text-white border-[#1f1f1f] hover:border-white/50"
                }`}
                disabled={!specialization.includes(spec) && specialization.length >= 5}
              >
                {spec}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/60">
            Selected: {specialization.length} / 5
          </p>
        </div>
      </div>
    </div>
  );
}

