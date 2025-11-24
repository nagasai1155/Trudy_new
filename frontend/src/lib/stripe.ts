import { loadStripe, Stripe } from '@stripe/stripe-js'

// Initialize Stripe with publishable key
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Stripe configuration
export const STRIPE_CONFIG = {
  // Currency
  currency: 'usd',
  // Credit conversion rate (1 USD = 1 credit)
  creditRate: 1,
  // Minimum purchase amount in cents
  minAmount: 500, // $5.00
  // Maximum purchase amount in cents
  maxAmount: 100000, // $1000.00
  // Default purchase amounts (in cents)
  defaultAmounts: [
    { amount: 1000, credits: 10, label: '$10 - 10 Credits' },
    { amount: 2500, credits: 25, label: '$25 - 25 Credits' },
    { amount: 5000, credits: 50, label: '$50 - 50 Credits' },
    { amount: 10000, credits: 100, label: '$100 - 100 Credits' },
    { amount: 25000, credits: 250, label: '$250 - 250 Credits' },
    { amount: 50000, credits: 500, label: '$500 - 500 Credits' },
  ],
}

