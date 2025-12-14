import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOptimizedAvailabilityOptions {
  dietitianId: string;
  eventTypeId?: string;
  startDate?: Date;
  endDate?: Date;
  durationMinutes?: number;
  initialData?: any;
  enabled?: boolean;
}

export function useOptimizedAvailability({
  dietitianId,
  eventTypeId,
  startDate,
  endDate,
  durationMinutes = 30,
  initialData,
  enabled = true
}: UseOptimizedAvailabilityOptions) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Smart polling state
  const pollIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef<number>(0);
  const isTabVisibleRef = useRef<boolean>(true);

  // Exponential backoff with jitter
  const getNextPollInterval = useCallback(() => {
    const baseInterval = 30000; // 30 seconds base
    const maxInterval = 300000; // 5 minutes max
    const backoffFactor = Math.min(consecutiveErrorsRef.current, 5);
    
    const interval = baseInterval * Math.pow(2, backoffFactor);
    const jitter = Math.random() * 0.3 * interval; // ±30% jitter
    
    return Math.min(interval + jitter, maxInterval);
  }, []);

  const fetchAvailability = useCallback(async (skipCache = false) => {
    if (!enabled || !dietitianId || !startDate || !endDate) return;
    
    const now = Date.now();
    // Don't fetch more than once per 10 seconds
    if (now - lastFetchRef.current < 10000 && !skipCache) return;
    
    // Try to load from cache first for instant display (if not skipping cache)
    if (!skipCache && typeof window !== "undefined") {
      const cacheKey = `availability_timeslots_${dietitianId}_${eventTypeId || 'default'}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Use cached data if less than 10 minutes old (increased from 5)
          if (now - parsed.timestamp < 600000) {
            setData(parsed.data);
            // Still fetch fresh data in background, but don't show loading
            if (now - parsed.timestamp > 300000) {
              // Cache is getting old (5+ minutes), fetch fresh but show cached data
            } else {
              // Cache is fresh, only fetch if needed
              if (now - lastFetchRef.current < 60000) {
                // Fetched recently, skip this fetch
                return;
              }
            }
          }
        } catch (e) {
          console.warn("Error parsing cached availability:", e);
        }
      }
    }
    
    setIsLoading(true);
    
    try {
      // Build query params
      const params = new URLSearchParams({
        dietitianId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: durationMinutes.toString(),
      });
      
      if (eventTypeId) {
        params.append('eventTypeId', eventTypeId);
      }

      const response = await fetch(`/api/availability/timeslots?${params.toString()}`, {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
      consecutiveErrorsRef.current = 0; // Reset on success
      lastFetchRef.current = now;
      
      // Store in localStorage for offline fallback (increased cache time to 10 minutes)
      if (typeof window !== "undefined") {
        const cacheKey = `availability_timeslots_${dietitianId}_${eventTypeId || 'default'}`;
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: result,
            timestamp: now
          })
        );
      }
    } catch (err) {
      consecutiveErrorsRef.current++;
      setError(err instanceof Error ? err.message : 'Fetch failed');
      
      // Try to load from cache if fetch failed
      if (typeof window !== "undefined") {
        const cacheKey = `availability_timeslots_${dietitianId}_${eventTypeId || 'default'}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Use cached data if less than 10 minutes old
            if (now - parsed.timestamp < 600000) {
              setData(parsed.data);
              setError(null); // Clear error if we have cached data
            }
          } catch (e) {
            console.warn("Error parsing cached availability on error:", e);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [dietitianId, eventTypeId, startDate, endDate, durationMinutes, enabled]);

  // Tab visibility detection - only fetch when tab becomes visible after being hidden for a while
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasHidden = !isTabVisibleRef.current;
      isTabVisibleRef.current = !document.hidden;
      
      if (!document.hidden && wasHidden) {
        // Tab became visible after being hidden - refresh data but use cache first
        const now = Date.now();
        // Only refresh if it's been more than 2 minutes since last fetch
        if (now - lastFetchRef.current > 120000) {
          fetchAvailability(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAvailability]);

  // Smart polling setup - only poll when tab is visible
  useEffect(() => {
    if (!enabled || !dietitianId || !startDate || !endDate) return;

    // Load from cache immediately on mount
    if (typeof window !== "undefined") {
      const cacheKey = `availability_timeslots_${dietitianId}_${eventTypeId || 'default'}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          // Use cached data if less than 10 minutes old
          if (now - parsed.timestamp < 600000) {
            setData(parsed.data);
          }
        } catch (e) {
          console.warn("Error parsing cached availability on mount:", e);
        }
      }
    }

    const poll = () => {
      // Only poll if tab is visible
      if (isTabVisibleRef.current) {
        fetchAvailability();
        
        // Schedule next poll with dynamic interval
        if (pollIntervalRef.current) {
          clearTimeout(pollIntervalRef.current);
        }
        pollIntervalRef.current = setTimeout(poll, getNextPollInterval());
      } else {
        // Tab is hidden, check back in 30 seconds
        if (pollIntervalRef.current) {
          clearTimeout(pollIntervalRef.current);
        }
        pollIntervalRef.current = setTimeout(poll, 30000);
      }
    };

    // Initial fetch (but use cache first)
    fetchAvailability();
    pollIntervalRef.current = setTimeout(poll, getNextPollInterval());

    return () => {
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
      }
    };
  }, [dietitianId, eventTypeId, startDate, endDate, enabled, fetchAvailability, getNextPollInterval]);

  return { data, isLoading, error, refetch: fetchAvailability };
}

