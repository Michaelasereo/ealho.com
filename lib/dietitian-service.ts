import { createBrowserClient } from '@/lib/supabase/client';
import { DietitianProfile } from '@/types';

class DietitianService {
  private cache = new Map<string, { data: DietitianProfile; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // SINGLE METHOD to fetch dietitian profile (used everywhere)
  async getDietitianProfile(userId: string, forceRefresh = false): Promise<DietitianProfile> {
    const now = Date.now();
    const cacheKey = `dietitian-${userId}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (now - cached.timestamp < this.CACHE_DURATION) {
        console.log('[CACHE HIT] Returning cached profile for:', userId);
        return cached.data;
      }
    }
    
    console.log('[CACHE MISS] Fetching fresh profile for:', userId);
    
    const supabase = createBrowserClient();
    
    // Fetch ALL data in ONE query
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        bio,
        image,
        metadata,
        updated_at
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching dietitian profile:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Dietitian profile not found');
    }
    
    // Transform database record to application format
    const profile: DietitianProfile = {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      bio: data.bio || '',
      image: data.image || '',
      // Flatten metadata for easy access
      specialization: data.metadata?.specialization || '',
      licenseNumber: data.metadata?.licenseNumber || '',
      experience: data.metadata?.experience || '',
      location: data.metadata?.location || '',
      qualifications: data.metadata?.qualifications || [],
      updatedAt: data.updated_at
    };
    
    // Update cache
    this.cache.set(cacheKey, {
      data: profile,
      timestamp: now
    });
    
    return profile;
  }
  
  // Method for booking page (fetches multiple dietitians)
  async getAllDietitians(): Promise<DietitianProfile[]> {
    const supabase = createBrowserClient();
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        bio,
        image,
        metadata,
        updated_at
      `)
      .eq('role', 'DIETITIAN')
      .or('account_status.eq.ACTIVE,account_status.is.null')
      .order('name');
    
    if (error) throw error;
    
    return (data || []).map(d => ({
      id: d.id,
      name: d.name || 'Dietitian',
      email: d.email || '',
      bio: d.bio || 'Professional dietitian ready to help you achieve your health goals.',
      image: d.image || '',
      specialization: d.metadata?.specialization || '',
      licenseNumber: d.metadata?.licenseNumber || '',
      experience: d.metadata?.experience || '',
      location: d.metadata?.location || '',
      qualifications: d.metadata?.qualifications || [],
      updatedAt: d.updated_at
    }));
  }
  
  // Update profile (invalidate cache after)
  async updateProfile(userId: string, updates: Partial<DietitianProfile>) {
    const supabase = createBrowserClient();
    
    // Separate main fields from metadata
    const { specialization, licenseNumber, experience, location, qualifications, updatedAt, ...mainFields } = updates;
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    // Add main fields (bio, name, email, image) if they're provided
    if (mainFields.bio !== undefined) updateData.bio = mainFields.bio;
    if (mainFields.name !== undefined) updateData.name = mainFields.name;
    if (mainFields.email !== undefined) updateData.email = mainFields.email;
    if (mainFields.image !== undefined) updateData.image = mainFields.image;
    
    // If any metadata fields changed, update metadata
    if (specialization !== undefined || licenseNumber !== undefined || 
        experience !== undefined || location !== undefined || qualifications !== undefined) {
      
      // First get current metadata
      const { data: current, error: fetchError } = await supabase
        .from('users')
        .select('metadata')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching current metadata:', fetchError);
        throw fetchError;
      }
      
      updateData.metadata = {
        ...current?.metadata,
        ...(specialization !== undefined && { specialization }),
        ...(licenseNumber !== undefined && { licenseNumber }),
        ...(experience !== undefined && { experience }),
        ...(location !== undefined && { location }),
        ...(qualifications !== undefined && { qualifications })
      };
    }
    
    console.log('Updating profile:', { userId, updateData });
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('bio, updated_at')
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    console.log('Profile updated successfully:', data);
    
    // Invalidate cache
    this.cache.delete(`dietitian-${userId}`);
    
    return { success: true, data };
  }
  
  // Clear cache (call this on logout or when data changes elsewhere)
  clearCache(userId?: string) {
    if (userId) {
      this.cache.delete(`dietitian-${userId}`);
    } else {
      this.cache.clear();
    }
  }
}

export const dietitianService = new DietitianService();
