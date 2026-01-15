/**
 * Connection Pool Manager
 * 
 * Note: Supabase handles connection pooling automatically.
 * This module provides utilities for managing query performance
 * and ensuring proper connection usage.
 * 
 * Supabase uses PgBouncer for connection pooling, which handles:
 * - Connection reuse
 * - Query queuing
 * - Connection limits
 * 
 * We don't need to manage pools manually, but we can optimize queries.
 */
import { createAdminClientServer } from "@/lib/supabase/server";

/**
 * Get optimized Supabase client for queries
 * 
 * Supabase automatically handles connection pooling via PgBouncer.
 * This function returns a client configured for optimal performance.
 * 
 * @returns Supabase admin client
 */
export function getPooledClient() {
  return createAdminClientServer();
}

/**
 * Execute query with connection pooling awareness
 * 
 * @param queryFn - Function that performs the query
 * @returns Query result
 */
export async function withPooledConnection<T>(
  queryFn: (client: ReturnType<typeof getPooledClient>) => Promise<T>
): Promise<T> {
  const client = getPooledClient();
  try {
    return await queryFn(client);
  } catch (error) {
    console.error("Pooled connection query error:", error);
    throw error;
  }
}

/**
 * Batch multiple queries for better performance
 * 
 * @param queries - Array of query functions
 * @returns Array of results
 */
export async function batchQueries<T>(
  queries: Array<(client: ReturnType<typeof getPooledClient>) => Promise<T>>
): Promise<T[]> {
  const client = getPooledClient();
  try {
    return await Promise.all(queries.map(q => q(client)));
  } catch (error) {
    console.error("Batch query error:", error);
    throw error;
  }
}

