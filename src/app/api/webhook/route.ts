import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendBookingConfirmation } from '@/lib/notifications';
import { experienceData } from '@/lib/experiences';
import Stripe from 'stripe';

async function processBooking(meta: Record<string, string>, paymentIntentId: string) {
  // Check for duplicate
  var { data: existing } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (existing) {
    console.log('Duplicate webhook ignored for payment:', paymentIntentId);
    return;
  }

  // Create the booking
  var { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .insert({
      show_id: meta.show_id,
      customer_name: meta.customer_name,
      customer_email: meta.customer_email || null,
      customer_phone: meta.customer_phone || null,
      contact_preference: meta.contact_preference || 'both',
      ticket_count: parseInt(meta.ticket_count),
      total_cents: parseInt(meta.total_cents),
      stripe_payment_intent_id: paymentIntentId,
      stripe_payment_status: 'succeeded',
    })
    .select()
    .single();

  if (bookingError) {
    console.error('Booking creation error:', bookingError);
    return;
  }

  // Update available seats
  await supabaseAdmin.rpc('decrement_seats', {
    show_id_input: meta.show_id,
    count: parseInt(meta.ticket_count),
  }).then(() => {}).catch(() => {
    // Fallback: manual update if RPC doesn't exist
    supabaseAdmin
      .from('shows')
      .select('available_seats')
      .eq('id', meta.show_id)
      .single()
      .then(({ data: show }) => {
        if (show) {
          supabaseAdmin
            .from('shows')
            .update({ available_seats: show.available_seats - parseInt(meta.ticket_count) })
            .eq('id', meta.show_id)
            .then(() => {});
        }
      });
  });

  // Mark confirmation sent
  await supabaseAdmin
    .from('bookings')
    .update({ confirmation_sent: true })
    .eq('id', booking.id);

  // Get show details for notification
  var { data: show } = await supabaseAdmin
    .from('shows')
    .select('*')
    .eq('id', meta.show_id)
    .single();

  var info = experienceData[meta.experience_slug];

  if (show && info) {
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
}

export async function POST(request: NextRequest) {
  var body = await request.text();
  var sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  var event: Stripe.Event;

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

  try {
    if (event.type === 'checkout.session.completed') {
      var session = event.data.object as Stripe.Checkout.Session;
      var meta = session.metadata;
      if (meta?.show_id) {
        await processBooking(meta as Record<string, string>, session.payment_intent as string);
      }
    } else if (event.type === 'payment_intent.succeeded') {
      var pi = event.data.object as Stripe.PaymentIntent;
      var piMeta = pi.metadata;
      if (piMeta?.show_id) {
        await processBooking(piMeta as Record<string, string>, pi.id);
      }
    } else if (event.type === 'charge.refunded') {
      var charge = event.data.object as Stripe.Charge;
      var chargePI = charge.payment_intent as string;
      if (chargePI) {
        // Find the booking by payment intent
        var { data: booking } = await supabaseAdmin
          .from('bookings')
          .select('id, show_id, ticket_count')
          .eq('stripe_payment_intent_id', chargePI)
          .maybeSingle();

        if (booking) {
          // Update booking status to refunded
          await supabaseAdmin
            .from('bookings')
            .update({ stripe_payment_status: 'refunded' })
            .eq('id', booking.id);

          // Restore available seats
          var { data: show } = await supabaseAdmin
            .from('shows')
            .select('available_seats')
            .eq('id', booking.show_id)
            .single();

          if (show) {
            await supabaseAdmin
              .from('shows')
              .update({ available_seats: show.available_seats + booking.ticket_count })
              .eq('id', booking.show_id);
          }

          console.log('Refund processed for booking:', booking.id);
        }
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  return NextResponse.json({ received: true });
}
