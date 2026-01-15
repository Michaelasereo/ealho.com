/**
 * Script to clear all therapists from the database
 * This will delete:
 * - All users with role = 'THERAPIST'
 * - All related data (event_types, bookings, payments, session_notes, session_requests, etc.)
 * - All Supabase Auth users for therapists
 * 
 * Run with: npx tsx scripts/clear-therapists.ts
 */

import { createAdminClientServer } from "@/lib/supabase/server";

async function clearAllTherapists() {
  console.log("🔍 Finding all therapists...");
  
  const supabaseAdmin = createAdminClientServer();
  
  // Get all therapists
  const { data: therapists, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("id, email, name, role")
    .eq("role", "THERAPIST");
  
  if (fetchError) {
    console.error("❌ Error fetching therapists:", fetchError);
    process.exit(1);
  }
  
  if (!therapists || therapists.length === 0) {
    console.log("✅ No therapists found in the database.");
    return;
  }
  
  console.log(`📋 Found ${therapists.length} therapist(s) to delete:`);
  therapists.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.name || t.email} (${t.id})`);
  });
  
  console.log("\n🗑️  Deleting therapists...");
  
  let deletedCount = 0;
  let errorCount = 0;
  
  for (const therapist of therapists) {
    try {
      // Delete from Supabase Auth first
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(therapist.id);
      
      if (authError) {
        console.error(`   ❌ Failed to delete auth user ${therapist.email}:`, authError.message);
        errorCount++;
        continue;
      }
      
      // Delete from users table (cascade will handle related data)
      const { error: dbError } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", therapist.id);
      
      if (dbError) {
        console.error(`   ❌ Failed to delete user ${therapist.email}:`, dbError.message);
        errorCount++;
        continue;
      }
      
      console.log(`   ✅ Deleted: ${therapist.name || therapist.email}`);
      deletedCount++;
    } catch (error: any) {
      console.error(`   ❌ Error deleting ${therapist.email}:`, error.message);
      errorCount++;
    }
  }
  
  console.log("\n📊 Summary:");
  console.log(`   ✅ Successfully deleted: ${deletedCount}`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }
  console.log("\n✨ Done! All therapists have been cleared from the database.");
}

// Run the script
clearAllTherapists()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

