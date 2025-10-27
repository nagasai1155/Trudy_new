'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Phone, Plus, Server, Info, X, AlertCircle } from 'lucide-react'

export default function PhoneNumbersPage() {
  const [addNumberDialogOpen, setAddNumberDialogOpen] = useState(false)
  const [twilioDialogOpen, setTwilioDialogOpen] = useState(false)
  const [sipTrunkDialogOpen, setSipTrunkDialogOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [twilioAccountSid, setTwilioAccountSid] = useState('')
  
  // SIP Trunk states
  const [sipLabel, setSipLabel] = useState('')
  const [sipPhoneNumber, setSipPhoneNumber] = useState('')
  const [showStaticIpBanner, setShowStaticIpBanner] = useState(true)
  const [mediaEncryption, setMediaEncryption] = useState('Allowed')
  const [sipUsername, setSipUsername] = useState('')
  const [sipPassword, setSipPassword] = useState('')
  const [outboundAddress, setOutboundAddress] = useState('')
  
  // Add number states
  const [newNumberLabel, setNewNumberLabel] = useState('')
  const [newNumberCountryCode, setNewNumberCountryCode] = useState('+1')
  const [areaCode, setAreaCode] = useState('')
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Phone numbers</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add or import your phone numbers
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all"
              onClick={() => setAddNumberDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add number
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 gap-2">
                  <Plus className="h-4 w-4" />
                  Import number
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                <DropdownMenuItem onClick={() => setTwilioDialogOpen(true)} className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  From Twilio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSipTrunkDialogOpen(true)} className="text-gray-700 dark:text-gray-300 hover:bg-primary/5">
                  <Server className="h-4 w-4 mr-2 text-primary" />
                  From SIP Trunk
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Empty State */}
        <div className="border border-gray-200 dark:border-gray-900 rounded-lg bg-white dark:bg-black hover:border-primary/40 hover:shadow-lg transition-all">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No phone numbers
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You don&apos;t have any phone numbers yet. Use the buttons above to add or import a number.
            </p>
          </div>
        </div>

        {/* Add Number Dialog */}
        <Dialog open={addNumberDialogOpen} onOpenChange={setAddNumberDialogOpen}>
          <DialogContent className="max-w-lg bg-white dark:bg-black border-gray-200 dark:border-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                Add new phone number
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Label */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">Label</Label>
                <Input
                  placeholder="Easy to identify name for this number"
                  value={newNumberLabel}
                  onChange={(e) => setNewNumberLabel(e.target.value)}
                  className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">Country</Label>
                <Select value={newNumberCountryCode} onValueChange={setNewNumberCountryCode}>
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-primary focus:border-primary">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span>{newNumberCountryCode === '+1' ? '🇺🇸' : newNumberCountryCode === '+44' ? '🇬🇧' : '🇮🇳'}</span>
                        <span>{newNumberCountryCode === '+1' ? 'United States' : newNumberCountryCode === '+44' ? 'United Kingdom' : 'India'}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">
                      <div className="flex items-center gap-2">
                        <span>🇺🇸</span>
                        <span>United States</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="+44">
                      <div className="flex items-center gap-2">
                        <span>🇬🇧</span>
                        <span>United Kingdom</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="+91">
                      <div className="flex items-center gap-2">
                        <span>🇮🇳</span>
                        <span>India</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Area Code (Optional) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">Area Code (Optional)</Label>
                <Input
                  placeholder="e.g., 212, 415, 202"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Specify a preferred area code for your new number
                </p>
              </div>

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-lg">
                <Info className="h-5 w-5 text-primary dark:text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    A new phone number will be provisioned for you. Monthly charges may apply.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-900">
              <Button
                variant="outline"
                onClick={() => setAddNumberDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
                onClick={() => {
                  console.log('Adding new number:', {
                    label: newNumberLabel,
                    countryCode: newNumberCountryCode,
                    areaCode,
                  })
                  setAddNumberDialogOpen(false)
                }}
              >
                Add Number
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import from Twilio Dialog */}
        <Dialog open={twilioDialogOpen} onOpenChange={setTwilioDialogOpen}>
          <DialogContent className="max-w-lg bg-white dark:bg-black border-gray-200 dark:border-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                Import phone number from Twilio
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Label */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">Label</Label>
                <Input
                  placeholder="Easy to identify name of the phone number"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">Phone number</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-24 focus:ring-2 focus:ring-primary focus:border-primary">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span>🇺🇸</span>
                          <span>{countryCode}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">
                        <div className="flex items-center gap-2">
                          <span>🇺🇸</span>
                          <span>+1</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="+44">
                        <div className="flex items-center gap-2">
                          <span>🇬🇧</span>
                          <span>+44</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="+91">
                        <div className="flex items-center gap-2">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder=""
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Twilio Account SID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">Twilio Account SID</Label>
                <Input
                  placeholder="Twilio Account SID"
                  value={twilioAccountSid}
                  onChange={(e) => setTwilioAccountSid(e.target.value)}
                  className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
              <Button
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
                onClick={() => {
                  console.log('Importing from Twilio:', {
                    label,
                    phoneNumber: `${countryCode}${phoneNumber}`,
                    twilioAccountSid,
                  })
                  setTwilioDialogOpen(false)
                }}
              >
                Import
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import from SIP Trunk Dialog */}
        <Dialog open={sipTrunkDialogOpen} onOpenChange={setSipTrunkDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Server className="h-4 w-4 text-primary" />
                </div>
                Import SIP Trunk
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Label and Phone Number */}
              <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Label</Label>
                  <Input
                    placeholder="Name of the phone number"
                    value={sipLabel}
                    onChange={(e) => setSipLabel(e.target.value)}
                    className="w-full bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Phone number</Label>
                  <Input
                    placeholder="Phone number +12025550123, SIP extension 1234 or any other identifier"
                    value={sipPhoneNumber}
                    onChange={(e) => setSipPhoneNumber(e.target.value)}
                    className="w-full bg-white dark:bg-black focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Static IP Banner */}
              {showStaticIpBanner && (
                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Static IP SIP Servers Available
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ElevenLabs offers SIP servers with static IP addresses for enterprise
                      clients requiring IP allowlisting. Static IP infrastructure uses a /24
                      block across US, EU, and India regions. Available for enterprise
                      accounts.{' '}
                      <button className="font-medium underline text-primary hover:text-primary/80">Contact sales</button> to learn
                      more.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStaticIpBanner(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Inbound Configuration */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Inbound Configuration
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Forward calls to the ElevenLabs SIP server
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Media Encryption */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">Media Encryption</Label>
                    <Select value={mediaEncryption} onValueChange={setMediaEncryption}>
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-primary focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Allowed">Allowed</SelectItem>
                        <SelectItem value="Required">Required</SelectItem>
                        <SelectItem value="Disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Allowed Numbers */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Allowed Numbers (Optional)
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone numbers that are allowed to use this trunk. Leave empty to allow all
                      numbers.
                    </p>
                    <Button variant="outline" className="gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all">
                      <Plus className="h-4 w-4" />
                      Add Number
                    </Button>
                  </div>

                  {/* Remote Domains */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Remote Domains (Optional)
                      </Label>
                      <Info className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Specify the FQDN domains of your SIP servers from which you originate the
                      calls. E.g. example.pstn.twilio.com. These domains are used for TLS
                      certificate validation. Leave this field empty if you don&apos;t use TLS.
                    </p>
                    <Button variant="outline" className="gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all">
                      <Plus className="h-4 w-4" />
                      Add Domain
                    </Button>
                  </div>

                  {/* Authentication */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        Authentication (Optional)
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Provide digest authentication credentials those will be used to
                        authenticate the inbound calls.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        SIP Trunk Username
                      </Label>
                      <Input
                        placeholder="Username for SIP digest authentication"
                        value={sipUsername}
                        onChange={(e) => setSipUsername(e.target.value)}
                        className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">
                        SIP Trunk Password
                      </Label>
                      <Input
                        type="password"
                        placeholder="Password for SIP digest authentication"
                        value={sipPassword}
                        onChange={(e) => setSipPassword(e.target.value)}
                        className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Outbound Configuration */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Outbound Configuration
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure where ElevenLabs should send calls for your phone number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Address</Label>
                  <Input
                    placeholder="example.pstn.twilio.com"
                    value={outboundAddress}
                    onChange={(e) => setOutboundAddress(e.target.value)}
                    className="w-full focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <div className="flex items-start gap-2 mt-2">
                    <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Hostname or IP the SIP INVITE is sent to. This is not a SIP URI and
                      shouldn&apos;t contain the sip: protocol. In case of TLS, use the hostname
                      with valid certificate.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-900">
              <Button
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
                onClick={() => {
                  console.log('Importing from SIP Trunk:', {
                    sipLabel,
                    sipPhoneNumber,
                    mediaEncryption,
                    sipUsername,
                    sipPassword,
                    outboundAddress,
                  })
                  setSipTrunkDialogOpen(false)
                }}
              >
                Import
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

