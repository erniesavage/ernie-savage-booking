export default function SmsConsentPage() {
  return (
    <main>
      <section style={{ padding: '140px 24px 80px', maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', letterSpacing: '0.04em', marginBottom: '32px', color: '#e8dcc8', textAlign: 'center' }}>
          SMS Consent &amp; Opt-In Disclosure
        </h1>

        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#c8bda8' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Brand
          </h2>
          <p>Ernie Savage, LLC</p>
          <p>Website: <a href="https://www.erniesavage.com" style={{ color: '#c4a574', textDecoration: 'underline' }}>https://www.erniesavage.com</a></p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Program Description
          </h2>
          <p>
            Ernie Savage sends one-time SMS booking confirmation messages to customers who purchase tickets
            for live music experiences through erniesavage.com. Messages contain the customer&apos;s ticket code,
            event name, date, time, venue, and ticket count. No marketing, promotional, or recurring messages are sent.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Message Frequency
          </h2>
          <p>One-time message per booking. No recurring messages.</p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Message Samples
          </h2>
          <div style={{ background: 'rgba(196,165,116,0.05)', border: '1px solid rgba(196,165,116,0.15)', padding: '16px', marginBottom: '12px', fontSize: '14px', color: '#e8dcc8' }}>
            Ernie Savage — You&apos;re in! Secret Ballads, Fri Mar 6 at 7:15 PM, Michiko Studios. Ticket: ES-944BAB. 2 ticket(s). See you there.
          </div>
          <div style={{ background: 'rgba(196,165,116,0.05)', border: '1px solid rgba(196,165,116,0.15)', padding: '16px', marginBottom: '12px', fontSize: '14px', color: '#e8dcc8' }}>
            Ernie Savage — You&apos;re in! Heart of Harry, Sat Apr 12 at 8:00 PM, Michiko Studios. Ticket: ES-3BF721. 1 ticket(s). See you there.
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            How End Users Consent (Opt-In Method)
          </h2>
          <p style={{ marginBottom: '16px' }}>
            Customers opt in to receive SMS exclusively through the ticket checkout process on our website.
            The opt-in flow works as follows:
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e8dcc8' }}>Step 1:</strong> Customer visits a booking page (e.g.,{' '}
            <a href="https://www.erniesavage.com/experience/secret-ballads" style={{ color: '#c4a574', textDecoration: 'underline' }}>
              erniesavage.com/experience/secret-ballads
            </a>) and clicks &quot;Purchase Seats&quot; on an available date.
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e8dcc8' }}>Step 2:</strong> The booking form expands. Customer enters their name, email, and phone number.
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e8dcc8' }}>Step 3:</strong> Customer selects their preferred confirmation method: &quot;EMAIL&quot;, &quot;SMS&quot;, or &quot;Email &amp; SMS&quot;.
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e8dcc8' }}>Step 4:</strong> When &quot;SMS&quot; or &quot;Email &amp; SMS&quot; is selected, the following disclosure is displayed directly beneath the selection:
          </p>

          <div style={{ background: 'rgba(196,165,116,0.08)', border: '1px solid rgba(196,165,116,0.2)', padding: '20px', margin: '16px 0 24px', fontSize: '14px', color: '#e8dcc8', lineHeight: 1.7 }}>
            <strong>SMS Consent Disclosure (as displayed on checkout):</strong>
            <br /><br />
            &quot;By selecting SMS, you consent to receive a one-time booking confirmation text message from Ernie Savage.
            Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. No recurring messages.
            See our <a href="/privacy" style={{ color: '#c4a574', textDecoration: 'underline' }}>Privacy Policy</a> and{' '}
            <a href="/terms" style={{ color: '#c4a574', textDecoration: 'underline' }}>Terms</a>.&quot;
          </div>

          <p style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e8dcc8' }}>Step 5:</strong> Customer completes payment. Only after successful payment is a single confirmation SMS sent to the provided phone number.
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Site-Wide Footer Disclosure
          </h2>
          <p style={{ marginBottom: '16px' }}>
            In addition to the checkout disclosure, the following SMS consent notice appears in the footer of every page across the website:
          </p>
          <div style={{ background: 'rgba(196,165,116,0.08)', border: '1px solid rgba(196,165,116,0.2)', padding: '20px', margin: '16px 0 24px', fontSize: '14px', color: '#e8dcc8', lineHeight: 1.7 }}>
            &quot;SMS Consent: During ticket checkout, customers may opt in to receive a one-time SMS booking confirmation from Ernie Savage
            by selecting &quot;SMS&quot; or &quot;Email &amp; SMS.&quot; Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.
            No recurring messages. See our Privacy Policy and Terms.&quot;
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Opt-Out Instructions
          </h2>
          <p>Reply <strong style={{ color: '#e8dcc8' }}>STOP</strong> to any message to unsubscribe. Reply <strong style={{ color: '#e8dcc8' }}>HELP</strong> for assistance.</p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Message &amp; Data Rates
          </h2>
          <p>Message and data rates may apply. Customers are informed of this at the point of opt-in.</p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Policies
          </h2>
          <p>
            <a href="/privacy" style={{ color: '#c4a574', textDecoration: 'underline' }}>Privacy Policy</a>
            {' '}&nbsp;&middot;&nbsp;{' '}
            <a href="/terms" style={{ color: '#c4a574', textDecoration: 'underline' }}>Terms &amp; Conditions</a>
          </p>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#e8dcc8', marginBottom: '16px', marginTop: '32px' }}>
            Contact
          </h2>
          <p>
            Ernie Savage, LLC<br />
            Email: <a href="mailto:booking@erniesavage.com" style={{ color: '#c4a574', textDecoration: 'underline' }}>booking@erniesavage.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
