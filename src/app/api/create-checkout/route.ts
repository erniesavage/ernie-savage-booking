import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { experienceData } from '@/lib/experiences';

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

    // Validate
    if (!showId || !experienceSlug || !customerName || !ticketCount || !priceCents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const info = experienceData[experienceSlug];
    if (!info) {
      return NextResponse.json({ error: 'Invalid experience' }, { status: 400 });
    }

    // Verify show exists and has seats
    const { data: show, error: showError } = await supabase
      .from('shows')
      .select('*, experiences(title, price_cents)')
      .eq('id', showId)
      .single();

    if (showError || !show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    if (show.status === 'sold_out' || show.available_seats < ticketCount) {
      return NextResponse.json({ error: 'Not enough seats available' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${info.title} — ${new Date(show.show_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
              description: `${show.venue_name} · ${ticketCount} ticket${ticketCount > 1 ? 's' : ''}`,
            },
            unit_amount: priceCents,
          },
          quantity: ticketCount,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/experience/${experienceSlug}`,
      customer_email: customerEmail || undefined,
      metadata: {
        show_id: showId,
        experience_slug: experienceSlug,
        customer_name: customerName,
        customer_email: customerEmail || '',
        customer_phone: customerPhone || '',
        contact_preference: contactPreference,
        ticket_count: ticketCount.toString(),
        total_cents: (priceCents * ticketCount).toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
