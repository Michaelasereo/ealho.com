"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { NIGERIA_STATES } from "@/constants/nigeriaStates";

interface OnboardingStep1Props {
  fullName: string;
  age: string;
  gender: string;
  state: string;
  profileImage: string | null;
  onFieldChange: (field: string, value: string) => void;
  onImageChange: (image: string | null) => void;
}

const getInitials = (name: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function OnboardingStep1({
  fullName,
  age,
  gender,
  state,
  profileImage,
  onFieldChange,
  onImageChange,
}: OnboardingStep1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(profileImage);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      onImageChange(base64String);
    };
    reader.onerror = () => {
      alert("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {imagePreview ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#262626]">
              <Image
                src={imagePreview}
                alt="Profile preview"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#1f1f1f] border-2 border-[#262626] flex items-center justify-center">
              <span className="text-white/60 text-2xl font-semibold">
                {fullName ? getInitials(fullName) : "U"}
              </span>
            </div>
          )}
          {imagePreview && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xs"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="profile-image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="bg-transparent border-[#262626] text-white hover:bg-[#1f1f1f] px-4 py-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            {imagePreview ? "Change Photo" : "Upload Photo"}
          </Button>
          {!imagePreview && (
            <p className="text-xs text-white/40">Optional: Add a profile picture</p>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Personal Details</h2>
        <p className="text-white/60 text-sm">Tell us a bit about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/80 text-sm">Full Name *</Label>
          <Input
            value={fullName}
            onChange={(e) => onFieldChange("fullName", e.target.value)}
            className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
            placeholder="Enter your full name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">Age *</Label>
            <Input
              type="number"
              value={age}
              onChange={(e) => onFieldChange("age", e.target.value)}
              className="bg-[#0b0b0b] border-[#1f1f1f] text-white min-h-[52px]"
              placeholder="Enter your age"
              min="18"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80 text-sm">Gender *</Label>
            <select
              value={gender}
              onChange={(e) => onFieldChange("gender", e.target.value)}
              className="w-full rounded-md bg-[#0b0b0b] border border-[#1f1f1f] text-white px-3 py-3 min-h-[52px]"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80 text-sm">Location (State) *</Label>
          <select
            value={state}
            onChange={(e) => onFieldChange("state", e.target.value)}
            className="w-full rounded-md bg-[#0b0b0b] border border-[#1f1f1f] text-white px-3 py-3 min-h-[52px]"
          >
            <option value="">Select state</option>
            {NIGERIA_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

