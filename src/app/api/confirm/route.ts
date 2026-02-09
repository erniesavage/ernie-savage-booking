import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { experienceData } from '@/lib/experiences';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const meta = session.metadata;

    if (!meta?.show_id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    // Get the booking by payment intent
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('stripe_payment_intent_id', session.payment_intent)
      .single();

    // Get show details
    const { data: show } = await supabase
      .from('shows')
      .select('*')
      .eq('id', meta.show_id)
      .single();

    const info = experienceData[meta.experience_slug];

    return NextResponse.json({
      booking: booking || {
        customer_name: meta.customer_name,
        ticket_count: parseInt(meta.ticket_count),
        ticket_code: booking?.ticket_code || 'Processing...',
      },
      show: show || {
        show_date: 'Unknown',
        show_time: 'Unknown',
        venue_name: 'Unknown',
      },
      experience: info || { title: 'Experience' },
    });
  } catch (error: any) {
    console.error('Confirm error:', error);
    return NextResponse.json(
      { error: error.message || 'Error retrieving booking' },
      { status: 500 }
    );
  }
}
