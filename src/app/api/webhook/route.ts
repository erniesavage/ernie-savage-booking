import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendBookingConfirmation } from '@/lib/notifications';
import { experienceData } from '@/lib/experiences';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata;

    if (!meta?.show_id) {
      return NextResponse.json({ received: true });
    }

    try {
      // Create the booking
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          show_id: meta.show_id,
          customer_name: meta.customer_name,
          customer_email: meta.customer_email || null,
          customer_phone: meta.customer_phone || null,
          contact_preference: meta.contact_preference || 'both',
          ticket_count: parseInt(meta.ticket_count),
          total_cents: parseInt(meta.total_cents),
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_payment_status: 'succeeded',
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
      }

      // Mark confirmation sent
      await supabaseAdmin
        .from('bookings')
        .update({ confirmation_sent: true })
        .eq('id', booking.id);

      // Get show details for notification
      const { data: show } = await supabaseAdmin
        .from('shows')
        .select('*')
        .eq('id', meta.show_id)
        .single();

      const info = experienceData[meta.experience_slug];

      if (show && info) {
        // Send confirmation
        await sendBookingConfirmation({
          customerName: meta.customer_name,
          customerEmail: meta.customer_email || undefined,
          customerPhone: meta.customer_phone || undefined,
          contactPreference: meta.contact_preference || 'both',
          ticketCode: booking.ticket_code,
          ticketCount: parseInt(meta.ticket_count),
          experienceTitle: info.title,
          showDate: show.show_date,
          showTime: show.show_time,
          venueName: show.venue_name,
          venueAddress: show.venue_address,
          venueNotes: show.venue_notes,
        });
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }

  return NextResponse.json({ received: true });
}
