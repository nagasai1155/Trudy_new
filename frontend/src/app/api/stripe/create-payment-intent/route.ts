import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get client_id from session
    const clientId = (session.user as any)?.client_id || 
                     (session.user as any)?.['https://trudy.ai/client_id']
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID not found in session' },
        { status: 400 }
      )
    }

    // Check Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { amount, currency = 'usd' } = body

    if (!amount || amount < 500) {
      return NextResponse.json(
        { error: 'Amount must be at least $5.00' },
        { status: 400 }
      )
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        client_id: clientId,
        user_id: session.user?.id || '',
        user_email: session.user?.email || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

