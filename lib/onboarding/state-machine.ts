import { SupabaseClient } from "@supabase/supabase-js";

export type OnboardingStage = 
  | "STARTED"
  | "PERSONAL_INFO"
  | "PROFESSIONAL_INFO"
  | "TERMS"
  | "COMPLETED";

export interface OnboardingProgress {
  user_id: string;
  current_stage: OnboardingStage;
  data: {
    // Step 1: Personal info
    fullName?: string;
    age?: number;
    gender?: string;
    state?: string;
    profileImage?: string;
    
    // Step 2: Professional info
    bio?: string;
    licenseNumber?: string;
    qualifications?: string[];
    experience?: string;
    specialization?: string[];
    
    // Step 3: Terms
    termsRead?: boolean;
    privacyRead?: boolean;
    termsAccepted?: boolean;
  };
  updated_at: string;
  created_at: string;
}

export interface GetProgressResult {
  progress: OnboardingProgress | null;
  error: any | null;
}

/**
 * Onboarding State Machine
 * 
 * Manages onboarding progress with stages:
 * STARTED → PERSONAL_INFO → PROFESSIONAL_INFO → TERMS → COMPLETED
 * 
 * Allows users to save progress and resume from any stage.
 */
export class OnboardingStateMachine {
  /**
   * Get current onboarding stage for a user
   * 
   * @param userId - User ID
   * @param supabaseAdmin - Admin Supabase client
   * @returns Current progress or default (STARTED)
   */
  static async getCurrentStage(
    userId: string,
    supabaseAdmin: SupabaseClient
  ): Promise<GetProgressResult> {
    try {
      const { data: progress, error } = await supabaseAdmin
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        // PGRST116 = not found (expected for new users)
        if (error.code === "PGRST116") {
          return {
            progress: {
              user_id: userId,
              current_stage: "STARTED",
              data: {},
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            error: null,
          };
        }
        console.error("OnboardingStateMachine.getCurrentStage error:", error);
        return { progress: null, error };
      }

      return {
        progress: progress as OnboardingProgress | null,
        error: null,
      };
    } catch (error: any) {
      console.error("OnboardingStateMachine.getCurrentStage exception:", error);
      return { progress: null, error };
    }
  }

  /**
   * Save onboarding progress
   * 
   * @param userId - User ID
   * @param stage - Current stage
   * @param formData - Form data to save
   * @param supabaseAdmin - Admin Supabase client
   * @returns Saved progress or error
   */
  static async saveProgress(
    userId: string,
    stage: OnboardingStage,
    formData: Partial<OnboardingProgress["data"]>,
    supabaseAdmin: SupabaseClient
  ): Promise<GetProgressResult> {
    try {
      // Get existing progress
      const existing = await this.getCurrentStage(userId, supabaseAdmin);
      const existingData = existing.progress?.data || {};

      // Merge form data with existing data
      const mergedData = {
        ...existingData,
        ...formData,
      };

      // Upsert progress
      const { data: progress, error } = await supabaseAdmin
        .from("onboarding_progress")
        .upsert({
          user_id: userId,
          current_stage: stage,
          data: mergedData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        })
        .select()
        .single();

      if (error) {
        console.error("OnboardingStateMachine.saveProgress error:", error);
        return { progress: null, error };
      }

      return {
        progress: progress as OnboardingProgress,
        error: null,
      };
    } catch (error: any) {
      console.error("OnboardingStateMachine.saveProgress exception:", error);
      return { progress: null, error };
    }
  }

  /**
   * Mark onboarding as completed
   * 
   * @param userId - User ID
   * @param supabaseAdmin - Admin Supabase client
   * @returns Success or error
   */
  static async markCompleted(
    userId: string,
    supabaseAdmin: SupabaseClient
  ): Promise<{ success: boolean; error: any | null }> {
    try {
      const { error } = await supabaseAdmin
        .from("onboarding_progress")
        .upsert({
          user_id: userId,
          current_stage: "COMPLETED",
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) {
        console.error("OnboardingStateMachine.markCompleted error:", error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("OnboardingStateMachine.markCompleted exception:", error);
      return { success: false, error };
    }
  }

  /**
   * Get next stage
   * 
   * @param currentStage - Current stage
   * @returns Next stage or null if completed
   */
  static getNextStage(currentStage: OnboardingStage): OnboardingStage | null {
    const stages: OnboardingStage[] = [
      "STARTED",
      "PERSONAL_INFO",
      "PROFESSIONAL_INFO",
      "TERMS",
      "COMPLETED",
    ];

    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      return null;
    }

    return stages[currentIndex + 1];
  }

  /**
   * Get previous stage
   * 
   * @param currentStage - Current stage
   * @returns Previous stage or null if at start
   */
  static getPreviousStage(currentStage: OnboardingStage): OnboardingStage | null {
    const stages: OnboardingStage[] = [
      "STARTED",
      "PERSONAL_INFO",
      "PROFESSIONAL_INFO",
      "TERMS",
      "COMPLETED",
    ];

    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex <= 0) {
      return null;
    }

    return stages[currentIndex - 1];
  }

  /**
   * Check if stage is valid
   * 
   * @param stage - Stage to validate
   * @returns true if valid
   */
  static isValidStage(stage: string): stage is OnboardingStage {
    return [
      "STARTED",
      "PERSONAL_INFO",
      "PROFESSIONAL_INFO",
      "TERMS",
      "COMPLETED",
    ].includes(stage);
  }
}

