import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingDetails {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  contactPreference: string;
  ticketCode: string;
  ticketCount: number;
  experienceTitle: string;
  showDate: string;
  showTime: string;
  venueName: string;
  venueAddress?: string;
  venueNotes?: string;
}

export async function sendConfirmationEmail(booking: BookingDetails) {
  if (!booking.customerEmail) return;

  const formattedDate = new Date(booking.showDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'booking@erniesavage.com',
      to: booking.customerEmail,
      subject: `Your Ticket: ${booking.experienceTitle} — ${formattedDate}`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#0d0b09;color:#e8dcc8;padding:40px 30px;">
          <div style="text-align:center;margin-bottom:30px;">
            <h1 style="font-size:24px;color:#c4a574;font-weight:400;margin:0;">Ernie Savage</h1>
            <p style="font-size:12px;letter-spacing:0.2em;color:#8a7d6d;text-transform:uppercase;margin-top:8px;">Musical Experiences</p>
          </div>
          
          <div style="border-top:1px solid rgba(196,165,116,0.2);border-bottom:1px solid rgba(196,165,116,0.2);padding:30px 0;margin:20px 0;">
            <h2 style="font-size:20px;color:#f0e6d6;margin:0 0 20px;">You're In.</h2>
            <p style="color:#d4c8b4;line-height:1.7;margin:0 0 20px;">
              ${booking.customerName}, your spot is confirmed for <strong style="color:#c4a574;">${booking.experienceTitle}</strong>.
            </p>
            
            <table style="width:100%;color:#d4c8b4;line-height:2;">
              <tr><td style="color:#8a7d6d;">Date</td><td style="text-align:right;">${formattedDate}</td></tr>
              <tr><td style="color:#8a7d6d;">Time</td><td style="text-align:right;">${booking.showTime}</td></tr>
              <tr><td style="color:#8a7d6d;">Venue</td><td style="text-align:right;">${booking.venueName}</td></tr>
              ${booking.venueAddress ? `<tr><td style="color:#8a7d6d;">Address</td><td style="text-align:right;">${booking.venueAddress}</td></tr>` : ''}
              <tr><td style="color:#8a7d6d;">Tickets</td><td style="text-align:right;">${booking.ticketCount}</td></tr>
            </table>
          </div>
          
          <div style="text-align:center;padding:25px;background:rgba(196,165,116,0.08);margin:20px 0;">
            <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#8a7d6d;margin:0 0 8px;">Your Ticket Code</p>
            <p style="font-size:28px;letter-spacing:0.1em;color:#c4a574;font-weight:600;margin:0;">${booking.ticketCode}</p>
          </div>
          
          ${booking.venueNotes ? `
          <div style="padding:15px 0;">
            <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8a7d6d;margin:0 0 8px;">Arrival Notes</p>
            <p style="color:#d4c8b4;line-height:1.6;margin:0;">${booking.venueNotes}</p>
          </div>
          ` : ''}
          
          <div style="text-align:center;padding-top:30px;border-top:1px solid rgba(196,165,116,0.1);margin-top:20px;">
            <p style="font-size:13px;color:#5a4d3d;margin:0;">© 2026 Ernie Savage, LLC</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendConfirmationSMS(booking: BookingDetails) {
  if (!booking.customerPhone) return;

  const formattedDate = new Date(booking.showDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  try {
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await twilio.messages.create({
      body: `🎵 Ernie Savage — You're in!\n\n${booking.experienceTitle}\n${formattedDate} at ${booking.showTime}\n${booking.venueName}\n\nTicket: ${booking.ticketCode}\n${booking.ticketCount} ticket(s)\n\nSee you there.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: booking.customerPhone,
    });
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

export async function sendBookingConfirmation(booking: BookingDetails) {
  const results = { email: false, sms: false };

  if (booking.contactPreference === 'email' || booking.contactPreference === 'both') {
    results.email = (await sendConfirmationEmail(booking)) || false;
  }

  if (booking.contactPreference === 'sms' || booking.contactPreference === 'both') {
    results.sms = (await sendConfirmationSMS(booking)) || false;
  }

  return results;
}
