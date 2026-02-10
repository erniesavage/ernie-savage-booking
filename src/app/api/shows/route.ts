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
    const { data: exp, error: expErr } = await supabaseAdmin
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
  const { searchParams } = new URL(request.url);
  const experienceSlug = searchParams.get('experience');

  if (!experienceSlug) {
    return NextResponse.json({ error: 'Experience slug required' }, { status: 400 });
  }

  const { data: exp } = await supabaseAdmin
    .from('experiences')
    .select('id')
    .eq('slug', experienceSlug)
    .single();

  if (!exp) {
    return NextResponse.json({ shows: [] });
  }

  const { data: shows, error } = await supabase
    .from('shows')
    .select('*')
    .eq('experience_id', exp.id)
    .eq('status', 'scheduled')
    .gte('show_date', new Date().toISOString().split('T')[0])
    .order('show_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ shows: shows || [] });
}
