import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      experienceSlug,
      showDate,
      showTime,
      doorsTime,
      venueName,
      venueAddress,
      venueCity,
      venueState,
      venueNotes,
      priceCents,
      availableSeats,
    } = body;

    // Get experience ID from slug
    const { data: exp, error: expErr } = await supabase
      .from('experiences')
      .select('id')
      .eq('slug', experienceSlug)
      .single();

    if (expErr || !exp) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    const { data: show, error: showErr } = await supabaseAdmin
      .from('shows')
      .insert({
        experience_id: exp.id,
        show_date: showDate,
        show_time: showTime,
        doors_time: doorsTime,
        venue_name: venueName,
        venue_address: venueAddress,
        venue_city: venueCity || 'New York',
        venue_state: venueState || 'NY',
        venue_notes: venueNotes,
        price_cents: priceCents,
        available_seats: availableSeats || 10,
        status: 'scheduled',
      })
      .select()
      .single();

    if (showErr) {
      return NextResponse.json({ error: showErr.message }, { status: 500 });
    }

    return NextResponse.json({ show });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  // Get experience
  const { data: experience, error: expError } = await supabase
    .from('experiences')
    .select('id, price_cents, capacity')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (expError || !experience) {
    return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
  }

  // Get upcoming shows
  const today = new Date().toISOString().split('T')[0];
  const { data: shows, error: showsError } = await supabase
    .from('shows')
    .select('*')
    .eq('experience_id', experience.id)
    .in('status', ['scheduled', 'sold_out'])
    .gte('show_date', today)
    .order('show_date', { ascending: true })
    .order('show_time', { ascending: true });

  if (showsError) {
    return NextResponse.json({ error: 'Error fetching shows' }, { status: 500 });
  }

  return NextResponse.json({ experience, shows: shows || [] });
}
