import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClientServer } from "@/lib/supabase/server";

export type EventType =
  | "ONBOARDING_STARTED"
  | "ONBOARDING_COMPLETED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "ROLE_CHANGED"
  | "ACCOUNT_STATUS_CHANGED"
  | "BOOKING_CREATED"
  | "BOOKING_CANCELLED"
  | "SESSION_COMPLETED"
  | "MEAL_PLAN_CREATED"
  | "EMAIL_SENT"
  | "NOTIFICATION_SENT";

export interface EventPayload {
  [key: string]: any;
}

export interface Event {
  id: string;
  type: EventType;
  user_id: string | null;
  tenant_id: string | null;
  payload: EventPayload;
  created_at: string;
  processed: boolean;
  processed_at: string | null;
}

/**
 * Event Bus
 * 
 * Decoupled event processing system for reliable event handling.
 * Events are persisted to database and can trigger background jobs.
 */
export class EventBus {
  private static supabaseAdmin: SupabaseClient | null = null;

  private static getClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      this.supabaseAdmin = createAdminClientServer();
    }
    return this.supabaseAdmin;
  }

  /**
   * Publish an event
   * 
   * @param type - Event type
   * @param userId - User ID (null for system events)
   * @param payload - Event payload
   * @param tenantId - Optional tenant ID
   * @returns Created event
   */
  static async publish(
    type: EventType,
    userId: string | null,
    payload: EventPayload,
    tenantId?: string | null
  ): Promise<{ event: Event | null; error: any | null }> {
    try {
      const client = this.getClient();

      // Determine tenant_id
      let finalTenantId = tenantId || null;
      if (!finalTenantId && userId) {
        try {
          const { data: user } = await client
            .from("users")
            .select("id")
            .eq("id", userId)
            .single();
          finalTenantId = user?.id || null;
        } catch (err) {
          // Ignore tenant lookup errors
        }
      }

      // Insert event
      const { data: event, error } = await client
        .from("events")
        .insert({
          type,
          user_id: userId,
          tenant_id: finalTenantId,
          payload,
          processed: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("EventBus.publish error:", error);
        return { event: null, error };
      }

      // Trigger real-time notification via Supabase
      try {
        await client.channel(`events:${finalTenantId || "system"}`)
          .send({
            type: "broadcast",
            event: "new_event",
            payload: {
              event_type: type,
              user_id: userId,
              tenant_id: finalTenantId,
            },
          });
      } catch (realtimeError) {
        // Don't fail if real-time fails
        console.warn("EventBus real-time notification failed:", realtimeError);
      }

      // Queue background jobs (async, don't wait)
      this.queueBackgroundJobs(type, userId, payload, finalTenantId).catch(err => {
        console.error("EventBus background job queue error:", err);
      });

      return { event: event as Event, error: null };
    } catch (error: any) {
      console.error("EventBus.publish exception:", error);
      return { event: null, error };
    }
  }

  /**
   * Queue background jobs for event processing
   * 
   * @param type - Event type
   * @param userId - User ID
   * @param payload - Event payload
   * @param tenantId - Tenant ID
   */
  private static async queueBackgroundJobs(
    type: EventType,
    userId: string | null,
    payload: EventPayload,
    tenantId: string | null
  ): Promise<void> {
    const client = this.getClient();

    switch (type) {
      case "ONBOARDING_COMPLETED":
        // Queue welcome email job
        await this.queueJob("send_welcome_email", {
          user_id: userId,
          tenant_id: tenantId,
          email: payload.email,
          role: payload.role,
        }, client);

        // Queue tenant initialization job
        await this.queueJob("initialize_tenant_resources", {
          tenant_id: tenantId,
          user_id: userId,
          role: payload.role,
        }, client);
        break;

      case "USER_CREATED":
        // Queue user setup job
        await this.queueJob("setup_new_user", {
          user_id: userId,
          tenant_id: tenantId,
          role: payload.role,
        }, client);
        break;

      case "BOOKING_CREATED":
        // Queue booking confirmation email
        await this.queueJob("send_booking_confirmation", {
          booking_id: payload.booking_id,
          user_id: userId,
          tenant_id: tenantId,
        }, client);
        break;

      // Add more event handlers as needed
    }
  }

  /**
   * Queue a background job
   * 
   * @param jobType - Job type
   * @param jobData - Job data
   * @param client - Supabase client
   */
  private static async queueJob(
    jobType: string,
    jobData: any,
    client: SupabaseClient
  ): Promise<void> {
    try {
      // Insert into scheduled_jobs table (if it exists)
      // Otherwise, just log for now
      const { error } = await client
        .from("scheduled_jobs")
        .insert({
          job_type: jobType,
          job_data: jobData,
          status: "pending",
          created_at: new Date().toISOString(),
        });
      
      if (error) {
        // Table might not exist yet - that's okay
        console.log(`Job queued (table may not exist): ${jobType}`, error.message);
      }
    } catch (error) {
      // Don't fail event publishing if job queueing fails
      console.warn(`Failed to queue job ${jobType}:`, error);
    }
  }

  /**
   * Get events for a user or tenant
   * 
   * @param userId - User ID (optional)
   * @param tenantId - Tenant ID (optional)
   * @param limit - Maximum number of events to return
   * @returns Events
   */
  static async getEvents(
    userId?: string | null,
    tenantId?: string | null,
    limit: number = 100
  ): Promise<{ events: Event[]; error: any | null }> {
    try {
      const client = this.getClient();
      let query = client.from("events").select("*").order("created_at", { ascending: false }).limit(limit);

      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data: events, error } = await query;

      if (error) {
        console.error("EventBus.getEvents error:", error);
        return { events: [], error };
      }

      return { events: (events || []) as Event[], error: null };
    } catch (error: any) {
      console.error("EventBus.getEvents exception:", error);
      return { events: [], error };
    }
  }
}

