import { NextRequest, NextResponse } from "next/server";
import { createAdminClientServer } from "@/lib/supabase/server";
import { requireAuthFromRequest } from "@/lib/auth-helpers";
import { formatDietitianName } from "@/lib/utils/dietitian-name";

// GET: Fetch pending session requests for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const userEmail = user.email;

    console.log("Fetching session requests for user:", userEmail);

    const supabaseAdmin = createAdminClientServer();
    
    // Fetch session requests for this user
    // Try simpler query first - without foreign key joins
    const { data: requests, error } = await supabaseAdmin
      .from("session_requests")
      .select(`
        id,
        request_type,
        client_name,
        client_email,
        message,
        status,
        event_type_id,
        meal_plan_type,
        price,
        currency,
        original_booking_id,
        requested_date,
        created_at,
        dietitian_id
      `)
      .eq("client_email", userEmail)
      .in("status", ["PENDING", "RESCHEDULE_REQUESTED"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching session requests:", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { 
          error: "Failed to fetch session requests", 
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    // Fetch related data separately if needed
    const requestsWithRelations = await Promise.all(
      (requests || []).map(async (req: any) => {
        const result: any = { ...req };

        // Fetch event type if exists
        if (req.event_type_id) {
          const { data: eventType } = await supabaseAdmin
            .from("event_types")
            .select("id, title, price, currency, length, slug, active")
            .eq("id", req.event_type_id)
            .single();
          
          if (eventType) {
            // Filter out old/deleted event types
            const oldSlugs = [
              'free-trial-consultation',
              '1-on-1-consultation-with-licensed-dietician'
            ];
            
            // Only include if it's active and not an old event type
            if (eventType.active && !oldSlugs.includes(eventType.slug)) {
              result.event_types = eventType;
            } else {
              // If it's an old event type, try to map it to the new one
              if (eventType.slug === '1-on-1-consultation-with-licensed-dietician') {
                // Try to find the new event type for this dietitian
                const { data: newEventType } = await supabaseAdmin
                  .from("event_types")
                  .select("id, title, price, currency, length")
                  .eq("user_id", req.dietitian_id)
                  .eq("slug", "1-on-1-nutritional-counselling-and-assessment")
                  .eq("active", true)
                  .single();
                
                if (newEventType) {
                  result.event_types = newEventType;
                } else {
                  // Skip this request if we can't find a replacement
                  result.skip = true;
                }
              } else {
                // For free trial, skip the request
                result.skip = true;
              }
            }
          }
        }

        // Fetch dietitian info
        if (req.dietitian_id) {
          const { data: dietitian } = await supabaseAdmin
            .from("users")
            .select("id, name, email")
            .eq("id", req.dietitian_id)
            .single();
          
          if (dietitian) {
            result.dietitian = dietitian;
          }
        }

        return result;
      })
    );

    // Filter out requests that reference old/deleted event types
    const validRequests = requestsWithRelations.filter((req: any) => !req.skip);
    
    // Transform the data to match the expected format
    const formattedRequests = (validRequests || []).map((req: any) => {
      const request: any = {
        id: req.id,
        requestType: req.request_type,
        clientName: req.client_name,
        clientEmail: req.client_email,
        message: req.message,
        status: req.status,
        createdAt: req.created_at,
      };

      if (req.request_type === "CONSULTATION" && req.event_types) {
        request.eventType = {
          id: req.event_types.id,
          title: req.event_types.title,
        };
        request.price = req.event_types.price;
        request.currency = req.event_types.currency;
        request.duration = req.event_types.length;
      } else if (req.request_type === "MEAL_PLAN") {
        request.mealPlanType = req.meal_plan_type;
        request.price = req.price;
        request.currency = req.currency;
      } else if (req.request_type === "RESCHEDULE_REQUEST") {
        request.originalBookingId = req.original_booking_id;
      }

      if (req.dietitian) {
        request.dietitian = {
          id: req.dietitian.id,
          name: formatDietitianName(req.dietitian.name),
          email: req.dietitian.email,
        };
      }

      if (req.requested_date) {
        request.requestedDate = req.requested_date;
      }

      return request;
    });

    return NextResponse.json({ requests: formattedRequests });
  } catch (error: any) {
    console.error("Error fetching user session requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch session requests", details: error.message },
      { status: 500 }
    );
  }
}
