# Ernie Savage — Intimate Music Experiences
## Booking Website

A Next.js booking website with Stripe payments, Supabase database, email confirmations (Resend), and SMS notifications (Twilio).

---

## Architecture

```
erniesavage.com
├── /                          → Home page (hero + 4 experience cards + about)
├── /experience/[slug]         → Experience landing page + show dates + booking form
├── /booking-confirmed         → Post-payment confirmation page
├── /admin                     → Admin dashboard (password protected)
├── /admin/shows               → Create new shows
├── /api/shows                 → GET shows for an experience / POST create show
├── /api/create-checkout       → Creates Stripe checkout session
├── /api/webhook               → Stripe webhook → creates booking + sends notifications
└── /api/confirm               → Retrieves booking details after payment
```

## Experience Slugs (for direct URL campaigns)
- `erniesavage.com/experience/secret-ballads`
- `erniesavage.com/experience/everybody-knows-this-song`
- `erniesavage.com/experience/heart-of-harry`
- `erniesavage.com/experience/private-concerts`

---

## Deployment Steps

### 1. Create GitHub Repository

```bash
# In terminal, navigate to the project folder
cd ernie-savage-booking

# Initialize git
git init
git add .
git commit -m "Initial commit: Ernie Savage booking website"

# Create repo on GitHub (github.com/new), then:
git remote add origin https://github.com/YOUR-USERNAME/ernie-savage-booking.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — click **Deploy**
5. After deploy, go to **Settings → Environment Variables**

### 3. Add Environment Variables in Vercel

Add ALL of these in Vercel's Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | (set after step 4) |
| `RESEND_API_KEY` | Your Resend API key |
| `FROM_EMAIL` | `booking@erniesavage.com` |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |
| `NEXT_PUBLIC_SITE_URL` | `https://erniesavage.com` |

After adding variables, **redeploy** from Vercel dashboard.

### 4. Set Up Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. URL: `https://erniesavage.com/api/webhook`
4. Events to listen for: `checkout.session.completed`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

### 5. Connect Domain (erniesavage.com)

1. In Vercel: Settings → Domains → Add `erniesavage.com`
2. Vercel gives you DNS records to add
3. In GoDaddy:
   - Go to DNS Management
   - Add/update the records Vercel provides (usually A and CNAME records)
4. Wait 10-30 minutes for propagation

### 6. Set Up Email Sending Domain (Resend)

1. In [Resend Dashboard](https://resend.com) → Domains
2. Add `erniesavage.com`
3. Add the DNS records Resend provides to GoDaddy
4. Verify domain — this allows sending from `booking@erniesavage.com`

---

## How It Works

### Booking Flow
1. Visitor lands on experience page (from homepage or direct URL)
2. Sees available show dates with venue, time, and seat count
3. Selects a show → booking form appears inline
4. Fills in name, email/phone, ticket count
5. Clicks "Reserve" → redirected to Stripe checkout
6. After payment → Stripe sends webhook
7. Webhook creates booking in Supabase, generates ticket code
8. Confirmation email + SMS sent automatically
9. Visitor sees confirmation page with ticket code

### Admin Flow
1. Go to `erniesavage.com/admin`
2. Enter password
3. Click "Manage Shows"
4. Fill in experience, date, time, venue, seats
5. Shows appear on the experience page immediately

---

## Creating Your First Show

After deploying, go to `/admin/shows` and create a test show:

1. Select experience (e.g., "Secret Ballads")
2. Pick a date (e.g., 2 weeks from now)
3. Set time (8:00 PM)
4. Set doors time (7:30 PM)
5. Venue: "Ernie's Studio"
6. Address: your studio address
7. Notes: "Ring buzzer #3, second floor"
8. Leave price blank (uses $110 default)
9. Seats: 10
10. Click "Create Show"

That show will now appear on the Secret Ballads page, ready for bookings.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              → Root layout (nav + footer)
│   ├── page.tsx                → Home page
│   ├── globals.css             → All styles
│   ├── experience/[slug]/
│   │   └── page.tsx            → Experience page + booking
│   ├── booking-confirmed/
│   │   └── page.tsx            → Confirmation page
│   ├── admin/
│   │   ├── page.tsx            → Admin dashboard
│   │   └── shows/page.tsx      → Create shows
│   └── api/
│       ├── shows/route.ts      → GET/POST shows
│       ├── create-checkout/route.ts → Stripe checkout
│       ├── webhook/route.ts    → Stripe webhook
│       └── confirm/route.ts    → Booking confirmation
├── lib/
│   ├── supabase.ts             → Supabase clients
│   ├── stripe.ts               → Stripe client
│   ├── notifications.ts        → Email + SMS
│   └── experiences.ts          → Experience data
└── public/
    └── images/                 → Experience + hero images
```
