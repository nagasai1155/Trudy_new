# Stripe Integration - Quick Start

## ✅ What's Been Set Up

1. **Billing Page** - `/billing` route with credit purchase interface
2. **Payment Components** - Stripe Payment Element integration
3. **API Route** - Server-side payment intent creation
4. **Sidebar Navigation** - Added "Billing" link

## 🔑 Required Keys to Collect

### From Stripe Dashboard (https://dashboard.stripe.com/)

1. **Publishable Key** (Frontend)
   - Go to: Developers → API keys
   - Copy: `pk_test_...` (test) or `pk_live_...` (production)
   - Add to: `frontend/.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

2. **Secret Key** (Frontend API Route - Server-side only)
   - Go to: Developers → API keys  
   - Copy: `sk_test_...` (test) or `sk_live_...` (production)
   - Add to: `frontend/.env.local` as `STRIPE_SECRET_KEY`
   - ⚠️ This is used server-side only, never exposed to browser

3. **Webhook Secret** (Backend)
   - Go to: Developers → Webhooks → Add endpoint
   - URL: `http://localhost:8000/api/v1/webhooks/stripe` (dev)
   - URL: `https://your-api.com/api/v1/webhooks/stripe` (prod)
   - Select events: `payment_intent.succeeded`
   - Copy: `whsec_...` (signing secret)
   - Add to: `z-backend/.env` as `STRIPE_WEBHOOK_SECRET`

## 📝 Environment Variables Setup

### Frontend `.env.local`
```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
```

### Backend `.env` (already configured)
```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚀 Testing

1. **Add keys to `.env.local`**
2. **Restart dev server**: `npm run dev`
3. **Navigate to**: `http://localhost:3000/billing`
4. **Test with card**: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

## 📚 Full Documentation

See `STRIPE_SETUP.md` for complete setup guide, troubleshooting, and production checklist.

