import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { experienceData } from '@/lib/experiences';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      showId,
      experienceSlug,
      customerName,
      customerEmail,
      customerPhone,
      contactPreference,
      ticketCount,
      priceCents,
    } = body;

    if (!showId || !experienceSlug || !customerName || !ticketCount || !priceCents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const info = experienceData[experienceSlug];
    if (!info) {
      return NextResponse.json({ error: 'Invalid experience' }, { status: 400 });
    }

    var admin = getAdminClient();

    // Verify show exists and has seats
    var { data: show, error: showError } = await admin
      .from('shows')
      .select('*')
      .eq('id', showId)
      .single();

    if (showError || !show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    if (show.status === 'sold_out' || show.available_seats < ticketCount) {
      return NextResponse.json({ error: 'Not enough seats available' }, { status: 400 });
    }

    var totalCents = priceCents * ticketCount;

    // Create Payment Intent
    var paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        show_id: showId,
        experience_slug: experienceSlug,
        customer_name: customerName,
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
        contact_preference: contactPreference || 'both',
        ticket_count: ticketCount.toString(),
        total_cents: totalCents.toString(),
      },
      receipt_email: customerEmail || undefined,
      description: info.title + ' - ' + ticketCount + ' ticket' + (ticketCount > 1 ? 's' : ''),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
