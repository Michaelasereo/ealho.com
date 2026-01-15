"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Bold, Italic, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { therapistService } from "@/lib/therapist-service";
import { TherapistProfile } from "@/types";
import { setupRealtimeUpdates } from "@/lib/realtime-updates";

// DEV MODE: Hardcoded therapist user ID for localhost testing
const DEV_THERAPIST_ID = 'b900e502-71a6-45da-bde6-7b596cc14d88';
const isDev = process.env.NODE_ENV === 'development';

export default function ProfilePage() {
  const { user, setProfileDirect } = useAuth();
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch profile on mount using API endpoint (more reliable)
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Use API endpoint to get current therapist profile based on session
        const response = await fetch("/api/therapists/profile", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || `Failed to fetch profile (${response.status})`);
        }

        const { profile: data } = await response.json() as { profile: TherapistProfile };
        
        // If name or email is missing from database, fallback to Google auth metadata
        if ((!data.name || data.name.trim() === '') || (!data.email || data.email.trim() === '')) {
          try {
            const { createBrowserClient } = await import("@/lib/supabase/client");
            const supabase = createBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
              const googleName = 
                session.user.user_metadata?.name ||
                session.user.user_metadata?.full_name ||
                null;
              
              const googleEmail = session.user.email || null;
              
              // Use database data with Google auth fallback
              const profileWithFallback = {
                ...data,
                name: data.name || googleName || '',
                email: data.email || googleEmail || '',
              };
              setProfile(profileWithFallback);
              // Update AuthProvider with fallback data
              setProfileDirect({ 
                name: profileWithFallback.name || null, 
                image: profileWithFallback.image || null 
              });
            } else {
              setProfile(data);
              // Update AuthProvider with database data
              setProfileDirect({ 
                name: data.name || null, 
                image: data.image || null 
              });
            }
          } catch (authError) {
            console.warn('Failed to fetch auth metadata, using database data:', authError);
            setProfile(data);
            // Update AuthProvider with database data
            setProfileDirect({ 
              name: data.name || null, 
              image: data.image || null 
            });
          }
        } else {
          setProfile(data);
          // Update AuthProvider with database data
          setProfileDirect({ 
            name: data.name || null, 
            image: data.image || null 
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setSaveError('Failed to load profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [setProfileDirect]);

  // Setup real-time updates
  useEffect(() => {
    if (!profile?.id) return;
    
    const unsubscribe = setupRealtimeUpdates(profile.id, () => {
      // Refresh profile when real-time update is received
      fetch("/api/therapists/profile", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(res => res.json())
        .then(({ profile: updatedProfile }) => {
          setProfile(updatedProfile);
          // Also update AuthProvider context so sidebar reflects changes
          setProfileDirect({ 
            name: updatedProfile.name || null, 
            image: updatedProfile.image || null 
          });
        })
        .catch(console.error);
    });
    
    return unsubscribe;
  }, [profile?.id, setProfileDirect]);

  // Convert name to URL-friendly slug
  const nameToSlug = (name: string): string => {
    if (!name) return "";
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const getInitials = (name: string) => {
    if (!name) return "D";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSaveError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSaveError("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/upload-profile-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      const newImageUrl = data.imageUrl;

      // Update local profile state
      setProfile((prev) => prev ? { ...prev, image: newImageUrl } : null);

      // Immediately update AuthProvider context so sidebar updates instantly
      setProfileDirect({
        name: profile?.name || null,
        image: newImageUrl || null,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      setSaveError(error?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // Handle remove image
  const handleRemoveImage = async () => {
    if (!profile?.id) {
      setSaveError("Cannot remove image: missing profile ID");
      return;
    }

    setUploadingImage(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Update user record to set image to null
      const result = await therapistService.updateProfile(profile.id, { image: null });

      if (result.error) {
        throw new Error(result.error);
      }

      // Update local profile state
      setProfile((prev) => prev ? { ...prev, image: null } : null);

      // Immediately update AuthProvider context
      setProfileDirect({
        name: profile?.name || null,
        image: null,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Failed to remove image:", error);
      setSaveError(error?.message || "Failed to remove image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle name update
  const handleSaveName = async () => {
    if (!profile?.id) {
      console.error('Cannot save: missing profile ID', { hasProfile: !!profile });
      return;
    }

    if (!profile.name || profile.name.trim().length === 0) {
      setSaveError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const newName = profile.name.trim();
      console.log('Saving name:', { userId: profile.id, name: newName });

      const result = await therapistService.updateProfile(profile.id, { name: newName });
      
      // Update local state
      if (result.data) {
        const updatedProfile = { 
          ...profile, 
          name: newName,
          updatedAt: result.data.updated_at 
        };
        setProfile(updatedProfile);
        
        // Update AuthProvider context so name and image reflect throughout the app (sidebar, etc.)
        setProfileDirect({ 
          name: newName, 
          image: result.data.image || profile.image || null 
        });
      }
      
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to save name:', error);
      const errorMessage = error?.message || error?.details || 'Unknown error';
      setSaveError(`Failed to save name: ${errorMessage}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  // Handle bio update
  const handleSaveBio = async () => {
    if (!profile?.id) {
      console.error('Cannot save: missing profile ID', { hasProfile: !!profile });
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      console.log('Saving bio:', { userId: profile.id, bioLength: profile.bio?.length || 0 });

      const result = await therapistService.updateProfile(profile.id, { bio: profile.bio ?? undefined });
      
      // Update local state with the saved bio (optimistic update)
      if (result.data) {
        setProfile(prev => prev ? { 
          ...prev, 
          bio: result.data.bio,
          updatedAt: result.data.updated_at 
        } : null);
      }
      
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to save bio:', error);
      const errorMessage = error?.message || error?.details || 'Unknown error';
      setSaveError(`Failed to save professional summary: ${errorMessage}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  // Show loading only if we're actually loading and don't have profile data yet
  if (loading) {
    console.log("[DEBUG] Rendering loading screen");
    return (
      <div className="p-8">
        <div className="text-white">Loading profile...</div>
        <div className="text-xs text-gray-400 mt-2">If this persists, check browser console for errors.</div>
        <div className="text-xs text-gray-500 mt-1">Check browser console for [DEBUG] messages.</div>
      </div>
    );
  }

  console.log("[DEBUG] Rendering profile form (loading is false)");
  // If loading is false but no userProfile, still render the form with empty/default values
  // This prevents infinite loading state

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-[#f9fafb] mb-1">Profile</h1>
        <p className="text-sm text-[#9ca3af]">
          Manage settings for your Cal.com profile
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Profile Picture Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            {profile?.image ? (
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={profile.image}
                  alt={profile?.name || 'Profile'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#404040] to-[#525252] flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {profile?.name ? getInitials(profile.name) : "D"}
                </span>
            </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-image-upload"
                disabled={uploadingImage}
              />
              <Button
                variant="outline"
                className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2 disabled:opacity-50"
                onClick={() => {
                  document.getElementById("profile-image-upload")?.click();
                }}
                disabled={uploadingImage}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingImage ? "Uploading..." : "Upload Avatar"}
              </Button>
              {profile?.image && (
                <Button
                  variant="outline"
                  className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2 disabled:opacity-50"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
          {saveSuccess && (
            <p className="text-xs text-green-400">
              Profile picture updated successfully!
            </p>
          )}
          {saveError && (
            <p className="text-xs text-red-400">
              {saveError}
            </p>
          )}
          <p className="text-xs text-[#9ca3af]">
            Profile picture is displayed throughout the platform and to clients booking with you.
          </p>
        </div>

        {/* Public Profile Link Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Public Profile Link
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1">
              <span className="px-3 py-2 bg-[#0a0a0a] border border-r-0 border-[#262626] text-[#9ca3af] text-sm rounded-l-md whitespace-nowrap">
                daiyet.store/Therapist/
              </span>
              <Input
                type="text"
                value={nameToSlug(profile?.name || '')}
                onChange={() => {}}
                disabled
                className="bg-[#0a0a0a] border-[#262626] text-[#f9fafb] rounded-l-none rounded-r-md focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#404040] opacity-50 cursor-not-allowed"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const slug = nameToSlug(profile?.name || '');
                if (slug) {
                  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                  window.open(`${baseUrl}/Therapist/${slug}`, '_blank');
                }
              }}
              disabled={!profile?.name?.trim()}
              className="bg-transparent border-[#262626] text-[#f9fafb] hover:bg-[#171717] px-4 py-2 whitespace-nowrap"
            >
              Open Public Link
            </Button>
          </div>
          <p className="text-xs text-[#9ca3af]">
            Share this link with clients to let them book consultations directly with you.
          </p>
        </div>

        {/* Full Name Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Full name
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={profile?.name || ''}
              onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="flex-1 bg-[#0a0a0a] border-[#262626] text-[#f9fafb] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#404040]"
              placeholder="Enter your full name"
            />
            <Button
              onClick={handleSaveName}
              disabled={saving || !profile?.name?.trim()}
              className="bg-white hover:bg-gray-100 text-black px-4 py-2 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-xs text-[#9ca3af]">
            Your name will be displayed throughout the app and to users booking with you
          </p>
        </div>

        {/* Email Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Email
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={profile?.email || ''}
              onChange={() => {}}
              disabled
              className="flex-1 bg-[#0a0a0a] border-[#262626] text-[#f9fafb] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-[#404040] opacity-50 cursor-not-allowed"
            />
            <span className="text-xs text-[#9ca3af] bg-[#262626] px-2 py-1 rounded">
              Primary
            </span>
          </div>
          <p className="text-xs text-[#9ca3af]">
            Email is fixed and cannot be edited
          </p>
        </div>

        {/* Professional Summary Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#D4D4D4]">
            Professional Summary
          </label>
          <p className="text-xs text-[#9ca3af] mb-2">
            This will be displayed on your public profile when users are booking.
          </p>
          <div className="border border-[#262626] rounded-md bg-[#0a0a0a]">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b border-[#262626]">
              <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors p-1">
                <Bold className="h-4 w-4" />
              </button>
              <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors p-1">
                <Italic className="h-4 w-4" />
              </button>
              <button className="text-[#D4D4D4] hover:text-[#f9fafb] transition-colors p-1">
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>
            {/* Textarea */}
            <Textarea
              value={profile?.bio || ''}
              onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
              className="bg-transparent border-0 text-[#f9fafb] resize-none focus:outline-none focus:ring-0 min-h-[120px]"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          {/* Save Button and Messages */}
          <div className="flex items-center gap-3 mt-3">
            <Button
              onClick={handleSaveBio}
              disabled={saving}
              className="bg-white hover:bg-gray-100 text-black px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {saveSuccess && (
              <span className="text-sm text-green-400">
                Professional summary saved successfully!
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-400">
                {saveError}
              </span>
            )}
          </div>
        </div>

        {/* Real-time status indicator */}
        {profile?.updatedAt && (
          <div className="text-sm text-[#9ca3af] mt-4 pt-4 border-t border-[#262626]">
            Last updated: {new Date(profile.updatedAt).toLocaleString()}
          </div>
        )}

      </div>
    </div>
  );
}
