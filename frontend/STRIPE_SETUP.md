# Stripe Payment Gateway Setup Guide

## Overview

Stripe integration has been set up in the frontend to allow users to purchase credits. The backend already has webhook handling for Stripe payments.

## What's Been Set Up

### Frontend Components
1. ✅ **Billing Page** (`/billing`) - Credit purchase interface
2. ✅ **Payment Form Component** - Stripe Payment Element integration
3. ✅ **Stripe Configuration** - Stripe.js initialization
4. ✅ **API Route** - Payment intent creation endpoint

### Backend Integration
- ✅ Backend webhook handler at `/api/v1/webhooks/stripe`
- ✅ Handles `payment_intent.succeeded` events
- ✅ Adds credits to client account (1 credit = $1 USD)
- ✅ Updates `credit_transactions` table

## Required Stripe Keys

You need to collect the following from your Stripe Dashboard:

### 1. Stripe Publishable Key (Frontend)
- **Location**: Stripe Dashboard → Developers → API keys
- **Format**: `pk_test_...` (test) or `pk_live_...` (production)
- **Usage**: Used in frontend to initialize Stripe.js
- **Environment Variable**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 2. Stripe Secret Key (Backend)
- **Location**: Stripe Dashboard → Developers → API keys
- **Format**: `sk_test_...` (test) or `sk_live_...` (production)
- **Usage**: Used in backend to create payment intents and verify webhooks
- **Environment Variable**: `STRIPE_SECRET_KEY` (in backend `.env`)

### 3. Stripe Webhook Secret (Backend)
- **Location**: Stripe Dashboard → Developers → Webhooks
- **Format**: `whsec_...`
- **Usage**: Used to verify webhook signatures from Stripe
- **Environment Variable**: `STRIPE_WEBHOOK_SECRET` (in backend `.env`)

## Setup Steps

### Step 1: Get Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in
3. Complete account setup (business details, bank account, etc.)

### Step 2: Get API Keys
1. Navigate to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
   - ⚠️ **Keep secret key secure** - never expose in frontend code

### Step 3: Set Up Webhook Endpoint

**⚠️ Important**: For local development, Stripe cannot reach `localhost` URLs. You have two options:

#### Option A: Use Stripe CLI (Recommended for Local Development)

1. **Install Stripe CLI**: https://github.com/stripe/stripe-cli/releases
2. **Login**: Run `stripe login` in terminal
3. **Forward webhooks**: Run `stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe`
4. **Copy webhook secret**: The CLI will output `whsec_xxxxx` - copy this
5. **Add to backend `.env`**: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
6. **Skip dashboard setup**: You don't need to create webhook in dashboard for local dev

#### Option B: Create Webhook in Dashboard (For Production)

1. Go to **Developers** → **Webhooks** (https://dashboard.stripe.com/test/webhooks)
2. Click **"+ Add destination"** button
3. Select **"Webhook endpoint"** as destination type
4. Enter your **production** webhook URL:
   - **Production**: `https://your-api-domain.com/api/v1/webhooks/stripe`
   - ⚠️ **Cannot use localhost** - must be publicly accessible URL
5. Select events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
6. Click **"Add destination"**
7. Click on the created webhook endpoint
8. Copy the **Signing secret** (`whsec_...`)
9. Add to backend `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

**For local testing, use Option A (Stripe CLI). For production, use Option B.**

### Step 4: Configure Environment Variables

#### Frontend (`.env.local`)
```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
# Note: STRIPE_SECRET_KEY is used server-side only in API routes, never exposed to client
```

#### Backend (`.env` in `z-backend/`)
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 5: Test the Integration

1. **Start your servers:**
   ```bash
   # Backend
   cd z-backend
   uvicorn app.main:app --reload

   # Frontend
   cd frontend
   npm run dev
   ```

2. **Test Payment Flow:**
   - Navigate to `/billing` in your frontend
   - Select an amount or enter custom amount
   - Click "Purchase Credits"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Use any future expiry date, any CVC, any ZIP
   - Complete payment

3. **Verify Webhook:**
   - Check Stripe Dashboard → Webhooks → Your endpoint
   - Should show successful webhook delivery
   - Check backend logs for credit addition
   - Verify credits balance updated in database

## Stripe Test Cards

Use these test cards in development:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**Expiry**: Any future date (e.g., `12/34`)  
**CVC**: Any 3 digits (e.g., `123`)  
**ZIP**: Any 5 digits (e.g., `12345`)

## Payment Flow

1. **User selects amount** on `/billing` page
2. **Frontend creates payment intent** via `/api/stripe/create-payment-intent`
3. **Stripe Payment Element** displays payment form
4. **User completes payment** with card details
5. **Stripe processes payment** and sends webhook to backend
6. **Backend webhook handler** (`/api/v1/webhooks/stripe`):
   - Verifies webhook signature
   - Extracts `client_id` from payment metadata
   - Calculates credits (1 USD = 1 credit)
   - Adds credits to client account
   - Records transaction in `credit_transactions` table
7. **Frontend redirects** to success page or refreshes balance

## Important Notes

### Security
- ⚠️ **Never expose secret keys** in frontend code
- ✅ Use publishable key in frontend (safe to expose)
- ✅ Always verify webhook signatures in backend
- ✅ Use HTTPS in production

### Production Checklist
- [ ] Switch to live keys (`pk_live_...` and `sk_live_...`)
- [ ] Update webhook URL to production domain
- [ ] Test with real card (small amount)
- [ ] Verify webhook delivery in Stripe Dashboard
- [ ] Monitor credit transactions in database
- [ ] Set up error alerts for failed payments

### Credit Conversion
- **Rate**: 1 USD = 1 Credit
- **Minimum**: $5.00 (500 cents)
- **Maximum**: $1,000.00 (100,000 cents)
- **Custom amounts**: User can enter any amount between min/max

## Troubleshooting

### "Stripe is not defined"
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify Stripe.js is loaded: `getStripe()` should return promise

### "Payment intent creation failed"
- Check backend is running
- Verify `STRIPE_SECRET_KEY` is set in backend
- Check API route logs for errors

### "Webhook signature verification failed"
- Verify `STRIPE_WEBHOOK_SECRET` matches webhook signing secret
- Check webhook URL is correct in Stripe Dashboard
- Ensure raw request body is used for signature verification

### "Credits not added after payment"
- Check webhook delivery in Stripe Dashboard
- Verify `client_id` is in payment metadata
- Check backend logs for webhook processing errors
- Verify database connection and RLS policies

## Next Steps

1. **Add Payment History**: Show transaction history on billing page
2. **Add Subscriptions**: Implement recurring subscription plans
3. **Add Invoices**: Generate and email invoices for purchases
4. **Add Refunds**: Handle refund requests and credit adjustments
5. **Add Usage Tracking**: Show credit usage per feature

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

