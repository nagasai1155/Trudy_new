'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react'
import { STRIPE_CONFIG } from '@/lib/stripe'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { PaymentForm } from '@/components/billing/payment-form'
import { useSession } from 'next-auth/react'

export default function BillingPage() {
  const { data: session } = useSession()
  const [selectedAmount, setSelectedAmount] = useState<string>('2500')
  const [customAmount, setCustomAmount] = useState('')
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate credits based on amount
  const calculateCredits = (amountCents: number) => {
    return Math.floor(amountCents / 100 * STRIPE_CONFIG.creditRate)
  }

  // Get selected amount in cents
  const getAmountInCents = () => {
    if (selectedAmount === 'custom') {
      const amount = parseFloat(customAmount)
      if (isNaN(amount) || amount < 5) return null
      return Math.round(amount * 100)
    }
    return parseInt(selectedAmount)
  }

  const handlePurchase = () => {
    const amount = getAmountInCents()
    if (!amount || amount < STRIPE_CONFIG.minAmount) {
      alert(`Minimum purchase is $${STRIPE_CONFIG.minAmount / 100}`)
      return
    }
    setPaymentDialogOpen(true)
  }

  // Fetch credits balance
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        // TODO: Replace with actual API call to get client info
        // const response = await apiClient.get('/auth/me')
        // setCreditsBalance(response.data.credits_balance)
        setCreditsBalance(0) // Placeholder
      } catch (error) {
        console.error('Error fetching credits:', error)
      }
    }
    fetchCredits()
  }, [])

  const amount = getAmountInCents()
  const credits = amount ? calculateCredits(amount) : 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Credits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Purchase credits to use for calls and voice operations
          </p>
        </div>

        {/* Current Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {creditsBalance !== null ? creditsBalance : '...'}
              </span>
              <span className="text-gray-600 dark:text-gray-400">Credits</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              1 Credit = $1.00 USD
            </p>
          </CardContent>
        </Card>

        {/* Purchase Credits */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Credits</CardTitle>
            <CardDescription>
              Select an amount or enter a custom amount to purchase credits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Select Amounts */}
            <div className="space-y-2">
              <Label>Select Amount</Label>
              <Select value={selectedAmount} onValueChange={setSelectedAmount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRIPE_CONFIG.defaultAmounts.map((option) => (
                    <SelectItem key={option.amount} value={option.amount.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Amount Input */}
            {selectedAmount === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom Amount (USD)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min="5"
                  max="1000"
                  step="0.01"
                  placeholder="Enter amount (min $5.00)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Minimum: ${STRIPE_CONFIG.minAmount / 100}, Maximum: ${STRIPE_CONFIG.maxAmount / 100}
                </p>
              </div>
            )}

            {/* Purchase Summary */}
            {amount && amount >= STRIPE_CONFIG.minAmount && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${(amount / 100).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Credits:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {credits} Credits
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${(amount / 100).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={!amount || amount < STRIPE_CONFIG.minAmount || isLoading}
              size="lg"
              className="w-full"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Purchase {credits} Credits
            </Button>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Purchase {credits} credits for ${(amount! / 100).toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            {amount && (
              <Elements stripe={getStripe()}>
                <PaymentForm
                  amount={amount}
                  credits={credits}
                  clientId={(session?.user as any)?.client_id || ''}
                  onSuccess={() => {
                    setPaymentDialogOpen(false)
                    // Refresh credits balance
                    window.location.reload()
                  }}
                  onCancel={() => setPaymentDialogOpen(false)}
                />
              </Elements>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

