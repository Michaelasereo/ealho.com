# Product Requirements Document (PRD)
## Therapy Booking Platform - Daiyet

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Draft - Extracted from Codebase Analysis

---

## PART 1: EXECUTIVE SUMMARY

### 1.1 Product Overview
Daiyet is a therapy booking platform connecting Nigerian therapists with clients for consultations and assessment test delivery. The platform provides authentication, booking management, session notes, payment processing, and real-time updates.

### 1.2 Key Features
- Multi-role authentication (USER, THERAPIST, ADMIN)
- Booking and consultation management
- Session notes system for therapists
- Payment processing via Paystack
- Real-time updates via Server-Sent Events (SSE)
- Assessment test (PDF) delivery system
- Availability scheduling

---

## PART 2: FEATURE SPECIFICATION

### 2.1 User Stories

See [USER_STORIES.md](./USER_STORIES.md) for complete user stories organized by role.

**Summary:**
- **USER:** 16 stories (13 fully implemented, 3 partially)
- **THERAPIST:** 10 stories (9 fully implemented, 1 partially)
- **ADMIN:** 11 stories (7 fully implemented, 4 partially)
- **Total:** 50 stories identified

---

### 2.2 Functional Requirements

#### A. Happy Path Flows

##### Booking Flow (US-005, TH-003)
✅ **IMPLEMENTED**

**Flow:**
1. User browses therapist profiles (`app/Therapist/page.tsx`)
2. User selects event type and date/time
3. System fetches available time slots (`app/api/availability/timeslots/route.ts`)
4. User completes booking form
5. System creates booking with status PENDING (`app/api/bookings/route.ts` POST)
6. User makes payment via Paystack (`app/api/paystack/initialize/route.ts`)
7. Payment webhook confirms booking (`app/api/paystack/webhook/route.ts`)
8. Booking status changes to CONFIRMED
9. Daily.co video room link generated and attached
10. For therapist bookings, pending session note auto-created

**Key Code Locations:**
- Booking creation: `app/api/bookings/route.ts` (lines 44-502)
- Payment flow: `app/api/paystack/` routes
- Auto note creation: `app/api/bookings/route.ts` (lines 374-416)

**Business Rules:**
- Booking starts as PENDING, changes to CONFIRMED after payment
- End time calculated from event type duration if not provided
- Therapist bookings automatically create pending session notes
- User must be authenticated to create booking

##### Session Request Flow (US-010, US-011, TH-008)
✅ **IMPLEMENTED**

**Flow:**
1. Therapist creates session request (`app/api/session-request/route.ts` POST)
2. Request stored with status PENDING
3. Email notification sent to client
4. Client sees request in dashboard (`app/user-dashboard/page.tsx`)
5. Client approves or rejects request
6. On approval, client proceeds to booking
7. On rejection, request status updates to REJECTED

**Key Code Locations:**
- Request creation: `app/api/session-request/route.ts` (lines 341-538)
- Request approval: `app/api/user/approve-request/[id]/route.ts`
- Request rejection: `app/api/user/session-requests/[id]/reject/route.ts`

**Business Rules:**
- CONSULTATION requests require event_type_id
- MEAL_PLAN requests require meal_plan_type
- Only therapist who created request can approve/reject from their side
- Only client can approve/reject from user side

##### Session Notes Flow (TH-005, TH-006, TH-007)
✅ **IMPLEMENTED**

**Flow:**
1. Booking created for therapist → Pending note auto-created (`app/api/session-notes/create-pending/route.ts`)
2. Therapist views pending notes (`app/therapist-dashboard/session-notes/page.tsx`)
3. Therapist fills out note form (`components/session-notes/FillNotesForm.tsx`)
4. Note status changes to COMPLETED when all fields filled
5. Client can view completed notes (`app/user-dashboard/session-notes/page.tsx`)

**Key Code Locations:**
- Auto-creation: `app/api/bookings/route.ts` (lines 374-416)
- Note update: `app/api/session-notes/[id]/route.ts` (PUT)
- Note viewing: `app/api/session-notes/route.ts` (GET)

**Business Rules:**
- Only one note per booking (UNIQUE constraint)
- Session number calculated from completed notes count
- Note status auto-updates to COMPLETED when all required fields filled
- Only therapists can update notes
- Clients can only view their own notes

##### Payment Flow (US-007)
✅ **IMPLEMENTED**

**Flow:**
1. User initiates payment (`components/user/payment-modal.tsx`)
2. Payment initialized via Paystack (`app/api/paystack/initialize/route.ts`)
3. User redirected to Paystack payment page
4. Payment completed, webhook called (`app/api/paystack/webhook/route.ts`)
5. Payment verified and booking confirmed
6. User redirected to success page

**Key Code Locations:**
- Payment init: `app/api/paystack/initialize/route.ts`
- Webhook: `app/api/paystack/webhook/route.ts`
- Callback: `app/api/paystack/callback/route.ts`

**Business Rules:**
- Webhook signature validated for security
- Payment status tracked (PENDING → SUCCESS/FAILED)
- Booking auto-confirmed on successful payment
- Meet link generated after payment confirmation

---

#### B. Edge Cases & 'What Ifs'

##### ✅ HANDLED Edge Cases

**1. Booking Creation Errors**
- ✅ Missing environment variables → 500 error with clear message
- ✅ Unauthenticated user → 401 with helpful message
- ✅ Invalid event type → 400 error
- ✅ Invalid start time → 400 error
- ✅ Missing dietitian_id → 400 error
- ✅ User record not found → 500 with retry suggestion
- ✅ Database errors → 500 with error details
- ✅ Retry logic for network/DNS errors (exponential backoff)

**Location:** `app/api/bookings/route.ts` (lines 44-502)

**2. Payment Errors**
- ✅ Missing Paystack key → 500 error
- ✅ Invalid signature → 401 error
- ✅ Payment not found → 200 (idempotent)
- ✅ Payment update fails → Logged but webhook returns 200
- ✅ Missing callback reference → Redirect with error

**Location:** `app/api/paystack/webhook/route.ts`, `app/api/paystack/callback/route.ts`

**3. Session Request Errors**
- ✅ Missing required fields → 400 error
- ✅ Invalid request type → 400 error
- ✅ Event type doesn't belong to therapist → 404 error
- ✅ Unauthorized access → 401/403 error
- ✅ Foreign key join failures → Fallback query

**Location:** `app/api/session-request/route.ts`

**4. Session Notes Errors**
- ✅ Unauthorized access → 401/403 error
- ✅ Note not found → 404 error
- ✅ Therapist doesn't own note → 403 error
- ✅ Non-therapist trying to update → 403 error
- ✅ Client viewing others' notes → 403 error

**Location:** `app/api/session-notes/[id]/route.ts`

**5. Availability Errors**
- ✅ No schedules found → Returns empty slots array
- ✅ Invalid timezone → Falls back to Africa/Lagos
- ✅ Schedule not found → 404 error

**Location:** `app/api/availability/timeslots/route.ts`

##### ⚠️ PARTIALLY HANDLED Edge Cases

**1. Booking Cancellation**
- ⚠️ **Status:** Partially implemented
- **Gap:** User-facing cancellation flow needs verification
- **Location:** `app/api/bookings/[id]/route.ts` (may have cancellation logic)
- **Risk:** Users may not be able to cancel bookings easily

**2. Booking Rescheduling**
- ⚠️ **Status:** Partially implemented
- **Evidence:** `RESCHEDULE_REQUEST` type exists in session_requests table
- **Gap:** Full reschedule workflow may need completion
- **Location:** `app/api/user/reschedule-booking/[id]/route.ts` (TODO comment found)
- **Risk:** Incomplete rescheduling functionality

**3. Concurrent Booking Conflicts**
- ⚠️ **Status:** Unknown - needs verification
- **Gap:** No explicit check for double-booking (same therapist, overlapping times)
- **Risk:** Two bookings could be created for same time slot

**4. Payment Timeout/Expiry**
- ⚠️ **Status:** Partially handled
- **Gap:** No explicit handling for payment timeouts
- **Risk:** PENDING bookings may remain unpaid indefinitely

**5. Email Delivery Failures**
- ⚠️ **Status:** Partially handled
- **Gap:** Email failures are logged but don't block operations
- **Risk:** Users may not receive notifications

##### ❌ MISSING Edge Cases

**1. Therapist Availability Validation**
- ❌ **Missing:** No validation that booking time is within therapist availability
- **Risk:** Bookings can be created outside available hours
- **Recommendation:** Add availability check before booking creation

**2. Past Date Validation**
- ❌ **Missing:** No explicit check preventing bookings in the past
- **Risk:** Bookings could be created for past dates
- **Recommendation:** Add date validation in booking creation

**3. Maximum Booking Limit**
- ❌ **Missing:** No limit on number of bookings per user/therapist
- **Risk:** System abuse, resource exhaustion
- **Recommendation:** Add rate limiting or booking caps

**4. Session Note Deletion**
- ❌ **Missing:** No endpoint to delete session notes
- **Risk:** Accidental notes cannot be removed
- **Recommendation:** Add soft delete or deletion endpoint

**5. Payment Refund Handling**
- ❌ **Missing:** No refund functionality
- **Risk:** Cannot handle refund requests
- **Recommendation:** Implement refund workflow

**6. Booking Modification**
- ❌ **Missing:** No endpoint to modify existing bookings (time, event type)
- **Risk:** Bookings cannot be changed after creation
- **Recommendation:** Add booking update endpoint

**7. Therapist Account Deactivation**
- ❌ **Missing:** No handling for inactive/suspended therapist accounts
- **Risk:** Bookings may be created for inactive therapists
- **Recommendation:** Add account status validation

---

#### C. Business Rules

##### ✅ IMPLEMENTED Business Rules

**1. Authentication & Authorization**
- All API routes require authentication
- Role-based access control (USER, THERAPIST, ADMIN)
- Users can only access their own data
- Therapists can only access their own bookings/notes
- Admins have broader access

**2. Booking Rules**
- Booking status: PENDING → CONFIRMED (via payment)
- Bookings automatically create session notes for therapist bookings
- End time calculated from event type duration if not provided
- Daily.co video room links generated after payment confirmation

**3. Session Request Rules**
- CONSULTATION requests require event_type_id
- MEAL_PLAN requests require meal_plan_type
- Request status: PENDING → APPROVED/REJECTED
- Only creator and recipient can modify request status

**4. Session Notes Rules**
- One note per booking (database constraint)
- Session number increments per client-therapist pair
- Status: PENDING → COMPLETED (when all fields filled)
- Only therapists can edit notes
- Clients can only view their own notes

**5. Payment Rules**
- Payment status: PENDING → SUCCESS/FAILED
- Booking confirmed only after successful payment
- Webhook signature must be validated
- Payment reference tracked for reconciliation

**6. Availability Rules**
- Default timezone: Africa/Lagos
- Schedules can have multiple time slots per day
- Only one default schedule per therapist
- Slots can be enabled/disabled

---

## PART 3: TECHNICAL ARCHITECTURE

### 3.1 Data Models

#### Core Tables

##### users
✅ **IMPLEMENTED**
- Primary key: `id` (UUID)
- Fields: `name`, `email`, `image`, `role`, `bio`, `signup_source`, `onboarding_completed`, `account_status`
- Roles: USER, THERAPIST, ADMIN
- Constraints: email UNIQUE, role CHECK constraint

**Location:** `supabase/schema.sql`, `supabase/migrations/`

##### bookings
✅ **IMPLEMENTED**
- Primary key: `id` (UUID)
- Foreign keys: `user_id`, `dietitian_id` (therapist), `event_type_id`
- Fields: `title`, `description`, `start_time`, `end_time`, `status`, `meeting_link`
- Status values: PENDING, CONFIRMED, CANCELLED, COMPLETED
- Additional fields: `user_age`, `user_occupation`, `user_medical_condition`, etc.

**Location:** `supabase/schema.sql`, `supabase/migrations/add_booking_profile_data.sql`

##### session_requests
✅ **IMPLEMENTED**
- Primary key: `id` (UUID)
- Foreign keys: `dietitian_id` (therapist), `event_type_id`, `original_booking_id`
- Fields: `request_type`, `client_name`, `client_email`, `message`, `status`, `meal_plan_type`, `price`, `currency`
- Request types: CONSULTATION, MEAL_PLAN, RESCHEDULE_REQUEST
- Status values: PENDING, APPROVED, REJECTED, RESCHEDULE_REQUESTED

**Location:** `supabase/migrations/create_session_requests_table.sql`

##### session_notes
✅ **IMPLEMENTED**
- Primary key: `id` (UUID)
- Foreign keys: `booking_id`, `therapist_id`, `client_id`
- Fields: `client_name`, `session_number`, `session_date`, `session_time`, `therapist_name`, `location`
- Therapist-filled: `patient_complaint`, `personal_history`, `family_history`, `presentation`, `formulation_and_diagnosis`, `treatment_plan`, `assignments`
- Status: PENDING, COMPLETED
- Constraint: UNIQUE(booking_id) - one note per booking

**Location:** `supabase/migrations/create_session_notes_table.sql`

##### event_types
✅ **IMPLEMENTED**
- Primary key: `id` (UUID)
- Foreign key: `user_id` (therapist)
- Fields: `title`, `slug`, `description`, `length`, `price`, `currency`, `active`
- Constraint: slug UNIQUE per therapist

**Location:** `supabase/schema.sql`

##### availability_schedules
✅ **IMPLEMENTED**
- Primary key: `id` (UUID)
- Foreign key: `dietitian_id` (therapist)
- Fields: `name`, `is_default`, `timezone`
- Related: `availability_schedule_slots` (one-to-many)

**Location:** `supabase/migrations/create_availability_schedules.sql`

##### payments
✅ **IMPLEMENTED**
- Primary key: `id` (UUID)
- Foreign key: `booking_id`
- Fields: `amount`, `currency`, `status`, `paystack_ref`
- Status: PENDING, SUCCESS, FAILED
- Constraint: paystack_ref UNIQUE

**Location:** `supabase/schema.sql`

---

### 3.2 System Components

#### Frontend Structure

##### Pages
✅ **IMPLEMENTED**

**User Dashboard** (`app/user-dashboard/`)
- Dashboard (`page.tsx`)
- Book a Call (`book-a-call/page.tsx`)
- Upcoming Meetings (`upcoming-meetings/page.tsx`)
- Session Notes (`session-notes/page.tsx`)
- Meal Plans/Assessment Tests (`meal-plan/page.tsx`)
- Profile Settings (`profile-settings/page.tsx`)
- Settings (`settings/`)

**Therapist Dashboard** (`app/therapist-dashboard/`)
- Dashboard (`page.tsx`)
- Bookings (`bookings/` - upcoming, past, canceled, unconfirmed)
- Session Notes (`session-notes/page.tsx`)
- Session Requests (`session-request/page.tsx`)
- Assessment Tests (`meal-plan/page.tsx`)
- Availability (`availability/`)
- Event Types (`event-types/`)
- Settings (`settings/`)

**Admin Dashboard** (`app/admin/`)
- Overview (`page.tsx`)
- Users (`users/page.tsx`)
- Therapists (via API)
- Bookings (`bookings/page.tsx`)
- Analytics (`analytics/page.tsx`)
- Revenue (`revenue/page.tsx`)
- Meal Plans (`meal-plans/page.tsx`)
- Settings (`settings/`)

**Public Pages**
- Home (`app/page.tsx`)
- Therapist Profile (`app/Therapist/page.tsx`)
- Therapy Booking (`app/therapy/book/page.tsx`)

##### Components
✅ **IMPLEMENTED**

**Layout Components**
- `components/layout/dashboard-sidebar.tsx`
- `components/layout/user-dashboard-sidebar.tsx`
- `components/layout/admin-sidebar.tsx`
- `components/layout/mobile-header.tsx`
- `components/layout/bottom-navigation.tsx`

**Booking Components**
- `components/bookings/BookingsList.tsx`
- `components/booking/time-slot-picker.tsx`
- `components/booking/payment-modal.tsx`

**Session Components**
- `components/session-notes/FillNotesForm.tsx`
- `components/session-request/SessionRequestList.tsx`
- `components/user/session-request-card.tsx`

**UI Components** (`components/ui/`)
- Button, Card, Input, Label, etc. (Shadcn/ui based)

#### Backend Structure

##### API Routes
✅ **IMPLEMENTED**

**Booking APIs** (`app/api/bookings/`)
- POST `/api/bookings` - Create booking
- GET `/api/bookings` - List bookings
- GET `/api/bookings/[id]` - Get booking details
- GET `/api/bookings/stream` - SSE stream for real-time updates

**Session Request APIs** (`app/api/session-request/`)
- GET `/api/session-request` - List requests
- POST `/api/session-request` - Create request
- PUT `/api/session-request/[id]` - Update request status

**Session Notes APIs** (`app/api/session-notes/`)
- GET `/api/session-notes` - List notes
- GET `/api/session-notes/[id]` - Get note
- PUT `/api/session-notes/[id]` - Update note
- POST `/api/session-notes/create-pending` - Auto-create note
- GET `/api/session-notes/client/[clientId]` - Get notes for specific client

**Payment APIs** (`app/api/paystack/`)
- POST `/api/paystack/initialize` - Initialize payment
- POST `/api/paystack/webhook` - Payment webhook
- GET `/api/paystack/callback` - Payment callback

**Availability APIs** (`app/api/availability/`)
- GET `/api/availability` - List schedules
- POST `/api/availability` - Create schedule
- GET `/api/availability/[id]` - Get schedule
- PUT `/api/availability/[id]` - Update schedule
- GET `/api/availability/timeslots` - Get available time slots

**Therapist APIs** (`app/api/therapists/`)
- GET `/api/therapists` - List therapists
- GET `/api/therapists/[id]` - Get therapist

##### Hooks
✅ **IMPLEMENTED**
- `hooks/useBookingsStream.ts` - Real-time bookings via SSE
- `hooks/useSessionRequestsStream.ts` - Real-time session requests via SSE

##### Services
✅ **IMPLEMENTED**
- `lib/supabase/server` - Supabase client factories
- `lib/auth-helpers` - Authentication helpers
- `lib/auth/unified-user-system` - User system
- `lib/email/queue` - Email queue system

### 3.4 API Endpoints Documentation

#### Session Notes API Endpoints

##### GET `/api/session-notes`
✅ **IMPLEMENTED**

**Description:** Fetch session notes based on user role with optional filtering.

**Authentication:** Required (all roles)

**Query Parameters:**
- `status` (optional): Filter by status - `PENDING` or `COMPLETED`
- `clientId` (optional): Filter by specific client ID (for therapists only)

**Request Example:**
```
GET /api/session-notes?status=PENDING&clientId=123e4567-e89b-12d3-a456-426614174000
```

**Response Format:**
```json
{
  "notes": [
    {
      "id": "uuid",
      "booking_id": "uuid",
      "therapist_id": "uuid",
      "client_id": "uuid",
      "client_name": "string",
      "session_number": 1,
      "session_date": "2024-01-01T10:00:00Z",
      "session_time": "10:00 AM",
      "therapist_name": "string",
      "location": "Virtual",
      "patient_complaint": "string | null",
      "personal_history": "string | null",
      "family_history": "string | null",
      "presentation": "string | null",
      "formulation_and_diagnosis": "string | null",
      "treatment_plan": "string | null",
      "assignments": "string | null",
      "status": "PENDING | COMPLETED",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "completed_at": "timestamp | null",
      "bookings": {
        "id": "uuid",
        "title": "string",
        "start_time": "timestamp",
        "end_time": "timestamp",
        "booking_status": "string"
      },
      "therapist": {
        "id": "uuid",
        "name": "string",
        "email": "string"
      },
      "client": {
        "id": "uuid",
        "name": "string",
        "email": "string"
      }
    }
  ]
}
```

**Role-Based Access:**
- **THERAPIST:** Returns all notes for their clients. Optional `clientId` parameter filters to specific client.
- **USER:** Returns all notes for their own sessions (client_id matches current user).
- **ADMIN:** Returns all notes in the system (no filtering).

**Sorting:** Notes are ordered by `session_date` descending (most recent first).

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Invalid role
- `500 Internal Server Error` - Database or server error

**Location:** `app/api/session-notes/route.ts`

---

##### GET `/api/session-notes/[id]`
✅ **IMPLEMENTED**

**Description:** Get a single session note by ID with full details.

**Authentication:** Required (THERAPIST, USER, or ADMIN)

**Path Parameters:**
- `id` (required): UUID of the session note

**Request Example:**
```
GET /api/session-notes/123e4567-e89b-12d3-a456-426614174000
```

**Response Format:**
```json
{
  "note": {
    "id": "uuid",
    "booking_id": "uuid",
    "therapist_id": "uuid",
    "client_id": "uuid",
    "client_name": "string",
    "session_number": 1,
    "session_date": "2024-01-01T10:00:00Z",
    "session_time": "10:00 AM",
    "therapist_name": "string",
    "location": "Virtual",
    "patient_complaint": "string | null",
    "personal_history": "string | null",
    "family_history": "string | null",
    "presentation": "string | null",
    "formulation_and_diagnosis": "string | null",
    "treatment_plan": "string | null",
    "assignments": "string | null",
    "status": "PENDING | COMPLETED",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "completed_at": "timestamp | null",
    "bookings": {
      "id": "uuid",
      "title": "string",
      "start_time": "timestamp",
      "end_time": "timestamp",
      "booking_status": "string"
    },
    "therapist": {
      "id": "uuid",
      "name": "string",
      "email": "string"
    },
    "client": {
      "id": "uuid",
      "name": "string",
      "email": "string"
    }
  }
}
```

**Role-Based Access:**
- **THERAPIST:** Can access notes where `therapist_id` matches current user.
- **USER:** Can access notes where `client_id` matches current user.
- **ADMIN:** Can access all notes.

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User doesn't have access to this note
- `404 Not Found` - Note with given ID doesn't exist
- `500 Internal Server Error` - Database or server error

**Location:** `app/api/session-notes/[id]/route.ts` (GET handler)

---

##### PUT `/api/session-notes/[id]`
✅ **IMPLEMENTED**

**Description:** Update a session note. Only the therapist who owns the note can update it. Status automatically changes to COMPLETED when all required fields are filled.

**Authentication:** Required (THERAPIST role only)

**Path Parameters:**
- `id` (required): UUID of the session note

**Request Body:**
```json
{
  "patient_complaint": "string | null",
  "personal_history": "string | null",
  "family_history": "string | null",
  "presentation": "string | null",
  "formulation_and_diagnosis": "string | null",
  "treatment_plan": "string | null",
  "assignments": "string | null"
}
```

All fields are optional. Empty strings are converted to `null`.

**Request Example:**
```json
PUT /api/session-notes/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "patient_complaint": "Client reports anxiety symptoms",
  "personal_history": "No significant medical history",
  "family_history": "Mother has depression",
  "presentation": "Anxious presentation, clear speech",
  "formulation_and_diagnosis": "Generalized anxiety disorder",
  "treatment_plan": "CBT approach, weekly sessions",
  "assignments": "Complete thought record worksheet"
}
```

**Response Format:**
```json
{
  "success": true,
  "note": {
    // Updated note object (same structure as GET response)
  }
}
```

**Business Logic:**
- Only the therapist who owns the note (`therapist_id` matches current user) can update it.
- If all required fields are filled and status is `PENDING`, status automatically changes to `COMPLETED` and `completed_at` is set.
- Required fields for completion: `patient_complaint`, `personal_history`, `family_history`, `presentation`, `formulation_and_diagnosis`, `treatment_plan`, `assignments`.

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User is not a therapist, or therapist doesn't own this note
- `404 Not Found` - Note with given ID doesn't exist
- `500 Internal Server Error` - Database or server error

**Location:** `app/api/session-notes/[id]/route.ts` (PUT handler)

---

##### POST `/api/session-notes/create-pending`
✅ **IMPLEMENTED**

**Description:** Automatically create a pending session note when a therapist booking is confirmed. This is typically called internally by the booking creation API, not directly by clients.

**Authentication:** Not required (internal API, but should be secured in production)

**Request Body:**
```json
{
  "bookingId": "uuid"
}
```

**Request Example:**
```json
POST /api/session-notes/create-pending
Content-Type: application/json

{
  "bookingId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response Format:**
```json
{
  "success": true,
  "note": {
    // Created session note object
  }
}
```

**Business Logic:**
- Only creates notes for therapist bookings (skips if booking is not for a therapist).
- Checks if note already exists for the booking (idempotent).
- Calculates session number by counting completed notes for the client-therapist pair, then adds 1.
- Auto-fills: `client_name`, `therapist_name`, `session_date`, `session_time`, `location` (defaults to "Virtual").
- Sets status to `PENDING`.

**Error Responses:**
- `400 Bad Request` - Missing `bookingId` in request body
- `404 Not Found` - Booking with given ID doesn't exist
- `500 Internal Server Error` - Database or server error

**Location:** `app/api/session-notes/create-pending/route.ts`

---

##### GET `/api/session-notes/client/[clientId]`
✅ **IMPLEMENTED**

**Description:** Get all session notes for a specific client. Used for "View Client Details" feature. Notes are returned in chronological order by session number.

**Authentication:** Required (THERAPIST, USER, or ADMIN)

**Path Parameters:**
- `clientId` (required): UUID of the client

**Request Example:**
```
GET /api/session-notes/client/123e4567-e89b-12d3-a456-426614174000
```

**Response Format:**
```json
{
  "notes": [
    {
      // Same note structure as GET /api/session-notes
      // Includes all fields and related bookings, therapist, client data
    }
  ]
}
```

**Role-Based Access:**
- **THERAPIST:** Can access notes for clients where `therapist_id` matches current user.
- **USER:** Can only access notes where `clientId` matches their own user ID.
- **ADMIN:** Can access all notes for any client.

**Sorting:** Notes are ordered by `session_number` ascending (chronological order).

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User doesn't have access to this client's notes
- `500 Internal Server Error` - Database or server error

**Location:** `app/api/session-notes/client/[clientId]/route.ts`

---

### 3.3 Integration Points

##### Supabase
✅ **IMPLEMENTED**
- Database: PostgreSQL via Supabase
- Authentication: Supabase Auth with Google OAuth
- Storage: Supabase Storage (for PDFs)
- Real-time: Server-Sent Events (SSE)

**Configuration:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

##### Paystack
✅ **IMPLEMENTED**
- Payment gateway for Nigerian Naira (NGN)
- Webhook for payment confirmation
- Inline payment integration

**Configuration:**
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`

##### Google OAuth
✅ **IMPLEMENTED**
- Authentication provider
- User profile data (name, email, image)
- OAuth flow via Supabase Auth

**Configuration:**
- Google OAuth credentials in Supabase dashboard
- Redirect URLs configured

##### Daily.co (Video Consultation Platform)
⚠️ **TARGET IMPLEMENTATION** (Currently using Google Meet, migration needed)

- Video consultation platform for therapy sessions
- Free tier: 2 concurrent rooms, unlimited minutes
- Pro tier ($59/month): 20 concurrent rooms
- API integration for room creation and management
- Better suited for Nigerian internet conditions than Google Meet

**Note:** Current codebase uses Google Meet for video links. Migration to Daily.co recommended for better performance in Nigeria and cost-effectiveness.

**Configuration (Target):**
- `DAILY_API_KEY`
- `DAILY_DOMAIN`
- Room creation API integration

---

## PART 4: COMPLETE ARCHITECTURE VISION

### 4.1 Frontend Stack

✅ **IMPLEMENTED**

**Core Technologies:**
- **Next.js 14+** (App Router) - React framework with server-side rendering
- **TypeScript 5.x** - Type-safe development
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library built on Radix UI
- **Zustand** (if used) - State management

**Key Frontend Features:**
- Dark mode theme (default)
- Mobile-first responsive design
- Server-Sent Events (SSE) for real-time updates
- Progressive Web App (PWA) capabilities (for offline support)
- Optimized for slow Nigerian internet connections

**Frontend Structure:**
```
/app
  /user-dashboard    // Client dashboard
  /therapist-dashboard  // Therapist dashboard
  /admin            // Admin dashboard
  /api              // API routes (Next.js)
  /Therapist        // Public therapist profiles
  /therapy          // Public booking pages
```

### 4.2 Backend Stack

✅ **IMPLEMENTED**

**Database & Auth:**
- **Supabase (PostgreSQL)** - Primary database
  - Free tier: 500MB database
  - Unlimited authentication users
  - Real-time subscriptions via SSE
  - Storage for documents (encrypted)
  - Edge Functions for serverless API logic

**API Layer:**
- **Next.js API Routes** - Server-side API endpoints
- **Cloudflare Workers** (planned for AI processing) - For audio transcription and AI processing

**Why Supabase for Nigeria:**
- Free tier sufficient for 50-100 daily consultations
- Real-time features for video status updates
- Built-in auth saves development time
- African edge locations (coming soon, currently EU)

### 4.3 Video Consultation Stack

⚠️ **TARGET IMPLEMENTATION** (Migration from Google Meet to Daily.co)

**Recommended: Daily.co**
- **Free tier:** 2 concurrent rooms, unlimited minutes
- **Pro tier ($59/month):** 20 concurrent rooms
- **Why:** Easy to implement, good quality on Nigerian internet, cost-effective

**Alternative Options:**
- **100ms.live:** Free tier (10,000 minutes/month), built for healthcare, HIPAA-ready
- **Self-hosted Jitsi:** $5-10/month VPS, complete control, requires maintenance

**Current Implementation:**
- Uses Google Meet via Google Calendar API
- Requires Google OAuth tokens for therapists
- Migration to Daily.co recommended

### 4.4 Integrated Data Flow

The complete patient journey through the platform:

```
1. Patient books appointment (via web app)
   ↓
2. Appointment stored in Supabase
   ↓
3. Payment processed via Paystack
   ↓
4. Booking confirmed, status: CONFIRMED
   ↓
5. Daily.co video room created (via API)
   ↓
6. Video room link stored in booking
   ↓
7. Consultation happens (video + audio recording)
   ↓
8. Audio sent to Cloudflare Worker (planned)
   ↓
9. Worker → OpenAI Whisper → De-identify → DeepSeek
   ↓
10. SOAP note returns to therapist dashboard (planned)
   ↓
11. Therapist reviews, edits, adds PHI
   ↓
12. Final note saved (encrypted)
   ↓
13. Client can view completed notes
   ↓
14. Appointment marked complete
```

### 4.5 Nigerian-Specific Considerations

**Internet Resilience:**
- Record audio/video locally first, then upload when connection available
- Offline-first approach for critical data
- Progressive enhancement for features
- Retry logic with exponential backoff

**Mobile-First Design:**
- 90% of Nigerian internet is mobile
- PWA capabilities for offline functionality
- Low data mode optimizations
- Touch-friendly interfaces

**Payment Integration:**
- Paystack for Nigerian Naira (NGN) - ✅ IMPLEMENTED
- Flutterwave as alternative option
- Mobile money support (planned)

**Communication:**
- Email notifications - ✅ IMPLEMENTED
- WhatsApp notifications (planned)
- SMS notifications (planned)

### 4.6 Security Architecture

**Data Flow Security:**
```
Patient Data → Encrypted in Browser → API → De-identified → AI Processing
                     ↓                         ↓
              Local Storage           Temporary Storage (2h max)
```

**PHI Handling Strategy:**
1. Patient profiles stored encrypted in Supabase
2. Consultation audio processed through Workers, not permanently stored
3. Medical notes generated de-identified, reconstructed locally
4. Final notes saved to encrypted storage
5. Access controlled via role-based authentication

**Authentication & Authorization:**
- Supabase Auth with Google OAuth - ✅ IMPLEMENTED
- Row-Level Security (RLS) policies - ✅ IMPLEMENTED
- Role-based access control (USER, THERAPIST, ADMIN) - ✅ IMPLEMENTED
- API route authentication middleware - ✅ IMPLEMENTED

### 4.7 Cost Breakdown

**Monthly Costs (Current):**
```
Supabase: $0 (free tier)
Google Meet: $0 (via Google Calendar API, requires OAuth)
Paystack: Transaction fees only
Vercel Hosting: $0 (hobby) or $20 (Pro for reliability)
Domain: ~$10/year
TOTAL: $0-20/month (current)
```

**Monthly Costs (Target with Daily.co):**
```
Supabase: $0 (free tier)
Daily.co: $0-59/month (start free, scale up)
Cloudflare Workers: $0 (free tier)
OpenAI Whisper: ~$18/month (estimated)
DeepSeek: ~$5/month (estimated)
Vercel Hosting: $20/month (Pro tier)
Domain: ~$10/year
TOTAL: $43-102/month (scalable)
```

**Break-even Analysis:**
- 10 Pro therapists @ $10/month = $100/month revenue
- 5 Clinic plans @ $50/month = $250/month revenue
- Total: $350/month revenue potential
- Costs: ~$100/month
- Profit: ~$250/month (scalable)

### 4.8 Scaling Strategy

**Phase 1: Single Clinic Pilot (Current)**
- 1-2 therapists
- Manual onboarding
- Direct support
- Free tier services

**Phase 2: Multi-Clinic Expansion**
- Clinic management portal
- Staff accounts
- Billing system
- Pro tier services

**Phase 3: Regional Deployment**
- Multi-language support
- Nigerian state-specific features
- Integration with NHIS (National Health Insurance)
- Enterprise features

**Phase 4: AI Features (Planned)**
- Audio transcription (OpenAI Whisper)
- Nigerian PHI de-identification
- SOAP note generation (DeepSeek)
- Encrypted storage for medical notes

---

## PART 8: OPEN QUESTIONS & RISKS

### 8.1 Known Unknowns

**1. Booking Cancellation Flow**
- ❓ Is there a cancellation endpoint?
- ❓ What happens to payments when bookings are canceled?
- ❓ Can therapists cancel bookings?
- ❓ Can users cancel bookings?

**2. Booking Rescheduling**
- ❓ How does rescheduling work?
- ❓ Is there a reschedule booking endpoint?
- ❓ What's the relationship between RESCHEDULE_REQUEST and actual rescheduling?

**3. Therapist Availability Validation**
- ❓ Are bookings validated against therapist availability before creation?
- ❓ What happens if someone books outside available hours?

**4. Payment Refunds**
- ❓ Is there refund functionality?
- ❓ How are refunds handled?

**5. Account Status Handling**
- ❓ How are suspended/inactive accounts handled?
- ❓ Can bookings be created for inactive therapists?

**6. Email Delivery**
- ❓ What email service is used?
- ❓ Are email failures handled gracefully?
- ❓ What happens if email delivery fails?

**7. Rate Limiting**
- ❓ Is there rate limiting on API endpoints?
- ❓ What are the limits?
- ❓ How are abuse cases handled?

**8. Data Retention**
- ❓ What's the data retention policy?
- ❓ Are old bookings/notes archived?
- ❓ Can data be exported?

---

### 8.2 Risk Register

#### High Priority Risks

**1. Missing Booking Validation**
- **Risk:** Bookings can be created outside therapist availability
- **Impact:** Poor user experience, scheduling conflicts
- **Mitigation:** Add availability validation before booking creation
- **Status:** ❌ NOT HANDLED

**2. Missing Concurrent Booking Protection**
- **Risk:** Two bookings could be created for same time slot
- **Impact:** Double-booking, confusion
- **Mitigation:** Add database constraint or application-level check
- **Status:** ⚠️ UNKNOWN - needs verification

**3. Payment Timeout Handling**
- **Risk:** PENDING bookings remain unpaid indefinitely
- **Impact:** Database bloat, confusion
- **Mitigation:** Add timeout mechanism, auto-cancel unpaid bookings
- **Status:** ⚠️ PARTIALLY HANDLED

**4. Missing Past Date Validation**
- **Risk:** Bookings could be created for past dates
- **Impact:** Invalid data, user confusion
- **Mitigation:** Add date validation
- **Status:** ❌ NOT HANDLED

#### Medium Priority Risks

**5. Email Delivery Failures**
- **Risk:** Users don't receive notifications
- **Impact:** Poor user experience
- **Mitigation:** Add retry logic, fallback notifications
- **Status:** ⚠️ PARTIALLY HANDLED (failures logged but don't block)

**6. Incomplete Rescheduling**
- **Risk:** Users cannot reschedule bookings easily
- **Impact:** Poor user experience
- **Mitigation:** Complete rescheduling workflow
- **Status:** ⚠️ PARTIALLY IMPLEMENTED

**7. Missing Refund Functionality**
- **Risk:** Cannot handle refund requests
- **Impact:** Customer service issues
- **Mitigation:** Implement refund workflow
- **Status:** ❌ NOT IMPLEMENTED

**8. Admin Auth Disabled**
- **Risk:** Admin panel accessible without authentication
- **Impact:** Security risk
- **Mitigation:** Re-enable admin authentication (per ADMIN_AUTH_DISABLED.md)
- **Status:** ⚠️ DOCUMENTED (auth disabled for development)

#### Low Priority Risks

**9. Missing Rate Limiting**
- **Risk:** API abuse, DDoS vulnerability
- **Impact:** Performance issues, costs
- **Mitigation:** Add rate limiting middleware
- **Status:** ⚠️ UNKNOWN - needs verification

**10. Missing Booking Modification**
- **Risk:** Bookings cannot be modified after creation
- **Impact:** User inconvenience
- **Mitigation:** Add booking update endpoint
- **Status:** ❌ NOT IMPLEMENTED

---

### 8.3 Assumptions

**1. Authentication Assumptions**
- ✅ All users authenticate via Google OAuth
- ✅ User records are created automatically during OAuth flow
- ✅ Role is determined during signup/enrollment
- ⚠️ Assumes auth tokens are valid (no token expiry handling visible)

**2. Payment Assumptions**
- ✅ Payments are processed immediately
- ✅ Paystack webhooks are reliable
- ⚠️ Assumes payment callback URLs are correct
- ⚠️ Assumes payment amounts match booking prices

**3. Data Assumptions**
- ✅ Database constraints enforce data integrity
- ✅ Foreign keys prevent orphaned records
- ⚠️ Assumes email addresses are unique and valid
- ⚠️ Assumes timezone handling is consistent (Africa/Lagos default)

**4. Business Logic Assumptions**
- ✅ Bookings are confirmed only after payment
- ✅ Session notes are auto-created for therapist bookings
- ⚠️ Assumes therapists complete notes after sessions
- ⚠️ Assumes availability schedules are kept up-to-date

**5. Integration Assumptions**
- ✅ Supabase is always available
- ✅ Paystack API is reliable
- ⚠️ Assumes network connectivity is stable
- ⚠️ Assumes third-party services don't change APIs

**6. User Behavior Assumptions**
- ⚠️ Assumes users complete bookings in one session
- ⚠️ Assumes users don't create duplicate bookings
- ⚠️ Assumes therapists maintain availability accurately

---

## PART 9: MISSING FEATURES & RECOMMENDATIONS

### 9.1 Critical Missing Features

**1. Booking Availability Validation** ❌
- **Priority:** HIGH
- **Description:** Validate booking times against therapist availability
- **Impact:** Prevents scheduling conflicts
- **Recommendation:** Add validation in booking creation API

**2. Past Date Validation** ❌
- **Priority:** HIGH
- **Description:** Prevent bookings for past dates/times
- **Impact:** Data integrity
- **Recommendation:** Add date validation in booking API

**3. Booking Cancellation UI** ⚠️
- **Priority:** HIGH
- **Description:** User-facing cancellation flow
- **Impact:** User experience
- **Recommendation:** Verify cancellation endpoint, add UI

**4. Booking Rescheduling** ⚠️
- **Priority:** MEDIUM
- **Description:** Complete rescheduling workflow
- **Impact:** User experience
- **Recommendation:** Complete reschedule request implementation

**5. Payment Refund Flow** ❌
- **Priority:** MEDIUM
- **Description:** Handle refund requests
- **Impact:** Customer service
- **Recommendation:** Implement refund API and UI

### 9.2 Recommended Enhancements

**1. Rate Limiting** ⚠️
- Add rate limiting to prevent abuse
- Recommended: 100 requests/minute per user

**2. Email Retry Logic**
- Add retry mechanism for failed emails
- Queue failed emails for retry

**3. Booking Modification**
- Allow users/therapists to modify booking times
- Update availability after modification

**4. Analytics Dashboard**
- Complete analytics implementation
- Add charts and metrics

**5. Audit Logging UI**
- Add admin UI for viewing audit logs
- Filter and search capabilities

**6. Account Status Management**
- Admin UI for suspending/activating accounts
- Prevent bookings for inactive accounts

**7. Data Export**
- Allow users to export their data
- GDPR/compliance support

---

## APPENDIX

### A. Code References

**Key Files:**
- Bookings: `app/api/bookings/route.ts`
- Session Requests: `app/api/session-request/route.ts`
- Session Notes: `app/api/session-notes/`
- Payments: `app/api/paystack/`
- Availability: `app/api/availability/`

**Database Schema:**
- `supabase/schema.sql`
- `supabase/migrations/`

**User Stories:**
- `USER_STORIES.md`

### B. Design System

**Theme:** Dark mode
- Background: `#0a0a0a`, `#111`, `#0b0b0b`
- Borders: `#1f1f1f`, `#262626`
- Text: `#f9fafb`, `#d1d5db`
- Primary: `#404040`
- Accent: `#374151`

**Spacing:** 4px base unit
**Font:** Inter
**Components:** Shadcn/ui based

### C. Environment Variables

**Required:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `NEXT_PUBLIC_SITE_URL`

---

**Document Status:** Generated from codebase analysis  
**Next Steps:** Review gaps, prioritize fixes, implement missing features
