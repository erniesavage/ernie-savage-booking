'use client';

export default function PrivacyPage() {
  return (
    <main>
      <div style={{ maxWidth: '700px', margin: '120px auto', padding: '0 24px 80px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: '#8a7d6d', fontSize: '13px', marginBottom: '40px' }}>Last updated: February 12, 2026</p>

        <div style={{ color: '#d4c8b4', lineHeight: 1.8, fontSize: '15px' }}>
          <p style={{ marginBottom: '24px' }}>
            Ernie Savage, LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates erniesavage.com. This Privacy Policy describes how we collect, use, and protect your personal information when you use our website and purchase tickets to our events.
          </p>

          <h2 style={{ fontSize: '18px', color: '#c4a574', marginBottom: '12px', marginTop: '32px' }}>Information We Collect</h2>
          <p style={{ marginBottom: '24px' }}>
            When you purchase tickets through our website, we collect your name, email address, and phone number (if provided). We also collect payment information, which is processed securely by Stripe and is never stored on our servers.
          </p>

          <h2 style={{ fontSize: '18px', color: '#c4a574', marginBottom: '12px', marginTop: '32px' }}>How We Use Your Information</h2>
          <p style={{ marginBottom: '24px' }}>
            We use your information solely to process your ticket purchase, send booking confirmations via email and/or SMS (based on your preference), and communicate essential event details such as schedule changes or cancellations. We do not use your information for marketing purposes unless you explicitly opt in.
          </p>

          <h2 style={{ fontSize: '18px', color: '#c4a574', marginBottom: '12px', marginTop: '32px' }}>SMS Messaging</h2>
          <p style={{ marginBottom: '24px' }}>
            If you provide your phone number and select SMS as your confirmation preference during checkout, you consent to receive a one-time booking confirmation text message. Message and data rates may apply. We do not send recurring marketing messages. You can reply STOP to any message to opt out.
          </p>

          <h2 style={{ fontSize: '18px', color: '#c4a574', marginBottom: '12px', marginTop: '32px' }}>Third-Party Services</h2>
          <p style={{ marginBottom: '24px' }}>
            We use the following third-party services to operate our platform: Stripe for payment processing, Resend for email delivery, and Twilio for SMS delivery. These services have their own privacy policies and handle your data in accordance with their terms. We do not sell, rent, or share your personal information with third parties for marketing purposes.
          </p>

          <h2 style={{ fontSize: '18px', color: '#c4a574', marginBottom: '12px', marginTop: '32px' }}>Data Security</h2>
          <p style={{ marginBottom: '24px' }}>
            We take reasonable measures to protect your personal information. Payment data is handled entirely by Stripe and is never stored on our servers. All data is transmitted over encrypted connections (HTTPS).
          </p>

          <h2 style={{ fontSize: '18px', color: '#c4a574', marginBottom: '12px', marginTop: '32px' }}>Data Retention</h2>
          <p style={{ marginBottom: '24px' }}>
            We retain your booking information for as long as necessary to fulfill our obligations related to your purchase and for our business records. You may request deletion of your personal data by contacting us.
          </p>

          <h2 style={{ fontSize: '18px', color: '#c4a574', marginBottom: '12px', marginTop: '32px' }}>Contact Us</h2>
          <p style={{ marginBottom: '24px' }}>
            If you have questions about this Privacy Policy or wish to request deletion of your data, please contact us at ernie@erniesavage.com.
          </p>
        </div>
      </div>
    </main>
  );
}
