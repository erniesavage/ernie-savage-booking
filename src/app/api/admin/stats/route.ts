import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const admin = getAdminClient();

    const { data: bookings } = await admin
      .from('bookings')
      .select('id, total_cents, ticket_count, created_at, stripe_payment_status')
      .eq('stripe_payment_status', 'succeeded');

    const { data: shows } = await admin
      .from('shows')
      .select('id, show_date, show_time, venue_name, available_seats, status, experience_id')
      .eq('status', 'scheduled')
      .gte('show_date', new Date().toISOString().split('T')[0])
      .order('show_date', { ascending: true });

    const { data: experiences } = await admin
      .from('experiences')
      .select('id, title, slug');

    const { data: recentBookings } = await admin
      .from('bookings')
      .select('id, customer_name, customer_email, customer_phone, ticket_count, total_cents, stripe_payment_status, ticket_code, created_at, show_id')
      .order('created_at', { ascending: false })
      .limit(20);

    const totalBookings = bookings?.length || 0;
    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_cents || 0), 0) || 0;
    const totalTickets = bookings?.reduce((sum, b) => sum + (b.ticket_count || 0), 0) || 0;
    const upcomingShows = shows?.length || 0;

    const expLookup: Record<string, string> = {};
    experiences?.forEach((e) => { expLookup[e.id] = e.title; });

    const enrichedShows = shows?.map((s) => ({
      ...s,
      experience_title: expLookup[s.experience_id] || 'Unknown',
    })) || [];

    const showLookup: Record<string, any> = {};
    shows?.forEach((s) => { showLookup[s.id] = s; });

    const enrichedBookings = recentBookings?.map((b) => ({
      ...b,
      show: showLookup[b.show_id] ? {
        ...showLookup[b.show_id],
        experience_title: expLookup[showLookup[b.show_id]?.experience_id] || 'Unknown',
      } : null,
    })) || [];

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      totalTickets,
      upcomingShows,
      shows: enrichedShows,
      recentBookings: enrichedBookings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
