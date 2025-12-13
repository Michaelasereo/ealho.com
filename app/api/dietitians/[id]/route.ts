import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientServer } from '@/lib/supabase/server';
import { formatDietitianName } from '@/lib/utils/dietitian-name';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (for Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    
    if (!id) {
      return NextResponse.json({ error: 'Dietitian ID is required' }, { status: 400 });
    }
    
    const supabase = createAdminClientServer();
    
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
      .eq('id', id)
      .eq('role', 'DIETITIAN')
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Dietitian not found' }, { status: 404 });
    }
    
    // Transform response
    const profile = {
      id: data.id,
      name: formatDietitianName(data.name),
      email: data.email || '',
      bio: data.bio || '',
      image: data.image || '',
      specialization: data.metadata?.specialization || '',
      licenseNumber: data.metadata?.licenseNumber || '',
      experience: data.metadata?.experience || '',
      location: data.metadata?.location || '',
      qualifications: data.metadata?.qualifications || [],
      updatedAt: data.updated_at
    };
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
