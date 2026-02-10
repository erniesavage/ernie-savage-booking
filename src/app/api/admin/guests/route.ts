import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showId = searchParams.get('show_id');

    if (!showId) {
      return NextResponse.json({ error: 'show_id required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Get show details with experience
    const { data: show, error: showErr } = await admin
      .from('shows')
      .select('*')
      .eq('id', showId)
      .single();

    if (showErr || !show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Get experience name
    const { data: experience } = await admin
      .from('experiences')
      .select('title, slug')
      .eq('id', show.experience_id)
      .single();

    // Get all bookings for this show
    const { data: bookings, error: bookingsErr } = await admin
      .from('bookings')
      .select('*')
      .eq('show_id', showId)
      .order('created_at', { ascending: true });

    if (bookingsErr) {
      return NextResponse.json({ error: bookingsErr.message }, { status: 500 });
    }

    // Calculate totals
    const succeededBookings = (bookings || []).filter((b: any) => b.stripe_payment_status === 'succeeded');
    const totalGuests = succeededBookings.reduce((sum: number, b: any) => sum + (b.ticket_count || 0), 0);
    const totalRevenue = succeededBookings.reduce((sum: number, b: any) => sum + (b.total_cents || 0), 0);

    return NextResponse.json({
      show: {
        ...show,
        experience_title: experience?.title || 'Unknown',
        experience_slug: experience?.slug || '',
      },
      bookings: bookings || [],
      totalGuests,
      totalRevenue,
      confirmedBookings: succeededBookings.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
