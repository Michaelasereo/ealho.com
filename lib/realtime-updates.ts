import { createBrowserClient } from './supabase/client';
import { dietitianService } from './dietitian-service';

export function setupRealtimeUpdates(userId: string, onUpdate: () => void) {
  const supabase = createBrowserClient();
  
  // Subscribe to changes in the user's row
  const channel = supabase
    .channel(`user-updates-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        console.log('Real-time update received:', payload);
        
        // Clear cache for this user
        dietitianService.clearCache(userId);
        
        // Notify component to refresh
        onUpdate();
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}
