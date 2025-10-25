'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  Bot, 
  Megaphone, 
  Mic, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  Phone,
  Users,
  TrendingUp
} from 'lucide-react'

export default function LandingPage() {
  const [showSignInModal, setShowSignInModal] = useState(false)

  return (
    <>
      <SignInModal open={showSignInModal} onOpenChange={setShowSignInModal} />
    <div className="flex min-h-screen flex-col">
       {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white shadow-sm">
              <Bot className="h-5 w-5 text-white dark:text-black" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Truedy AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setShowSignInModal(true)}>
              Sign In
            </Button>
            <Button onClick={() => setShowSignInModal(true)}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center space-y-8 py-24 md:py-32 bg-white dark:bg-black">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter text-gray-900 dark:text-gray-100 md:text-6xl lg:text-7xl lg:leading-[1.1]">
            Transform Your Outreach with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Voice Agents
            </span>
          </h1>
          <p className="max-w-[750px] text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
            Build, deploy, and manage intelligent AI voice agents that handle calls at scale. 
            Automate customer outreach, surveys, and support with natural-sounding conversations.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setShowSignInModal(true)}
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowSignInModal(true)}
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 pt-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">10M+</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calls Processed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">99.9%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime SLA</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">50+</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Languages</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-12 py-24 md:py-32 bg-white dark:bg-black">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] text-gray-900 dark:text-gray-100 sm:text-3xl md:text-5xl">
            Everything You Need for Voice AI
          </h2>
          <p className="max-w-[85%] leading-normal text-gray-600 dark:text-gray-400 sm:text-lg sm:leading-7">
            Powerful features to build, manage, and scale your AI voice operations
          </p>
        </div>

        <div className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-gray-900 dark:text-gray-100">AI Agent Builder</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Create custom AI voice agents with natural conversations, custom prompts, and personality
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                <Megaphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-gray-900 dark:text-gray-100">Campaign Management</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Launch and monitor calling campaigns with smart scheduling and real-time analytics
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <Mic className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-gray-900 dark:text-gray-100">Voice Cloning</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Clone any voice with just a few audio samples. Create authentic, brand-consistent voices
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 4 */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-gray-900 dark:text-gray-100">Advanced Analytics</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Track performance with detailed insights, call recordings, and success metrics
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 5 */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 dark:bg-red-500/20">
                <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-gray-900 dark:text-gray-100">Real-time Processing</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Lightning-fast voice synthesis and processing for natural, responsive conversations
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 6 */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-gray-900 dark:text-gray-100">Enterprise Security</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Bank-level encryption, GDPR compliant, with role-based access controls
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container space-y-12 py-24 md:py-32 bg-gray-50 dark:bg-black">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] text-gray-900 dark:text-gray-100 sm:text-3xl md:text-5xl">
            Trusted by Leading Companies
          </h2>
          <p className="max-w-[85%] leading-normal text-gray-600 dark:text-gray-400 sm:text-lg sm:leading-7">
            From startups to enterprises, see how companies use Truedy AI
          </p>
        </div>

        <div className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-gray-900 dark:text-gray-100">Sales Outreach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automate lead qualification, appointment setting, and follow-ups at scale
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-gray-900 dark:text-gray-100">Customer Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Handle common queries, route calls intelligently, and provide 24/7 support
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              <CardTitle className="text-gray-900 dark:text-gray-100">Market Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conduct surveys, gather feedback, and analyze customer sentiment at scale
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 md:py-32 bg-white dark:bg-black">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] text-gray-900 dark:text-gray-100 sm:text-3xl md:text-5xl">
            Ready to Transform Your Voice Operations?
          </h2>
          <p className="max-w-[85%] leading-normal text-gray-600 dark:text-gray-400 sm:text-lg sm:leading-7">
            Join thousands of companies using AI voice agents to scale their operations
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setShowSignInModal(true)}
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowSignInModal(true)}
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white shadow-sm">
              <Bot className="h-5 w-5 text-white dark:text-black" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Truedy AI</span>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 Truedy AI Platform. All rights reserved.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowSignInModal(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline"
            >
              Privacy
            </button>
            <button 
              onClick={() => setShowSignInModal(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline"
            >
              Terms
            </button>
            <button 
              onClick={() => setShowSignInModal(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}

