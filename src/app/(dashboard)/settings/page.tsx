'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useEffect, useCallback } from 'react'
import { Camera, User, Users, Mail, UserPlus, Shield, Trash2, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface WorkspaceDeveloper {
  id: string
  name: string
  email: string
  role: 'admin' | 'developer' | 'member'
  avatar?: string
  joinedAt: string
  lastActive?: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [developers, setDevelopers] = useState<WorkspaceDeveloper[]>([])
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'developer' | 'member'>('developer')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Real-time fetch function for developers
  const fetchDevelopers = useCallback(async () => {
    try {
      // Simulated API call - replace with actual API endpoint
      // const response = await apiClient.get('/workspaces/members')
      
      // Mock data for demonstration - replace with real API call
      const mockDevelopers: WorkspaceDeveloper[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'admin',
          joinedAt: '2024-01-15',
          lastActive: 'Just now'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'developer',
          joinedAt: '2024-02-20',
          lastActive: '2 minutes ago'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          role: 'developer',
          joinedAt: '2024-03-10',
          lastActive: '1 hour ago'
        },
      ]
      
      setDevelopers(mockDevelopers)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch developers:', error)
      setIsLoading(false)
    }
  }, [])

  // Real-time polling for developers (updates every 5 seconds)
  useEffect(() => {
    if (activeTab === 'workspace') {
      fetchDevelopers()
      const interval = setInterval(() => {
        fetchDevelopers()
      }, 5000) // Poll every 5 seconds for real-time updates

      return () => clearInterval(interval)
    }
  }, [activeTab, fetchDevelopers])

  const handleInviteDeveloper = async () => {
    if (!inviteEmail.trim()) return

    try {
      // Simulated API call - replace with actual API endpoint
      // await apiClient.post('/workspaces/invite', {
      //   email: inviteEmail,
      //   role: inviteRole
      // })
      
      // Mock - add to pending invites
      setPendingInvites([...pendingInvites, {
        id: Date.now().toString(),
        email: inviteEmail,
        role: inviteRole,
        status: 'pending'
      }])
      
      setInviteEmail('')
      setInviteDialogOpen(false)
      
      // Refresh immediately after invite
      fetchDevelopers()
    } catch (error) {
      console.error('Failed to invite developer:', error)
    }
  }

  const handleRemoveDeveloper = async (id: string) => {
    try {
      // Simulated API call - replace with actual API endpoint
      // await apiClient.delete(`/workspaces/members/${id}`)
      
      setDevelopers(developers.filter(d => d.id !== id))
    } catch (error) {
      console.error('Failed to remove developer:', error)
    }
  }

  return (
    <AppLayout>
      <div className="bg-white dark:bg-black xl:-mt-[72px] min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your profile and workspace invites.</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-900 mb-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary/40'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('workspace')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'workspace'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary/40'
                }`}
              >
                Workspace Invites
              </button>
            </div>
          </div>

          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors">
                      {profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-primary" />
                      )}
                    </div>
                    <label 
                      htmlFor="profile-upload" 
                      className="absolute inset-0 flex items-center justify-center bg-primary/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Profile Picture</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upload a profile picture (JPG, PNG, or GIF)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <label htmlFor="profile-upload">
                    <Button variant="outline" className="hover:bg-primary/5 hover:border-primary/40 transition-all" asChild>
                      <span>Upload Photo</span>
                    </Button>
                  </label>
                  {profileImage && (
                    <Button 
                      variant="outline" 
                      className="bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800"
                      onClick={() => setProfileImage(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">E-Mail Address</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">aarohjain06@gmail.com</p>
                </div>
              </div>

              {/* Given Name */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Given Name</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aaroh</p>
                </div>
                <Button variant="outline" className="ml-4 shrink-0 hover:bg-primary/5 hover:border-primary/40 transition-all">
                  Update Given Name
                </Button>
              </div>

              {/* Current Plan */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Current Plan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Free</p>
                </div>
                <Button variant="outline" className="ml-4 shrink-0 hover:bg-primary/5 hover:border-primary/40 transition-all">
                  Manage Subscription
                </Button>
              </div>

              {/* Default Sharing Preferences */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Default Sharing Preferences</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No default groups selected</p>
                </div>
                <Button variant="outline" className="ml-4 shrink-0 hover:bg-primary/5 hover:border-primary/40 transition-all">
                  Manage Default Sharing
                </Button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Disabled</p>
                </div>
                <Button variant="outline" className="ml-4 shrink-0 hover:bg-primary/5 hover:border-primary/40 transition-all">
                  Add Two-Factor Authentication
                </Button>
              </div>

              {/* Usage & Credit Ceilings */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Usage & Credit Ceilings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current credit ceiling usage: 0 / Not set characters</p>
                </div>
                <Button variant="outline" className="ml-4 shrink-0 hover:bg-primary/5 hover:border-primary/40 transition-all">
                  See More Details
                </Button>
              </div>

              {/* Application Language */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Application language</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">English</p>
                </div>
                <div className="ml-4 shrink-0">
                  <Select defaultValue="en">
                    <SelectTrigger className="w-[150px] focus:ring-2 focus:ring-primary focus:border-primary">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇺🇸</span>
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <span>🇺🇸</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="es">
                        <div className="flex items-center gap-2">
                          <span>🇪🇸</span>
                          <span>Spanish</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                          <span>🇫🇷</span>
                          <span>French</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="de">
                        <div className="flex items-center gap-2">
                          <span>🇩🇪</span>
                          <span>German</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sign out of all devices */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Sign out of all devices</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sign out of all devices and sessions. You will need to sign in again on all devices.</p>
                </div>
                <Button variant="outline" className="ml-4 shrink-0 hover:bg-primary/5 hover:border-primary/40 transition-all">
                  Sign out
                </Button>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-red-600 dark:text-red-400">Delete Account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deleting your account is permanent. You will no longer be able to create an account with this email.</p>
                </div>
                <Button variant="outline" className="ml-4 shrink-0 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800">
                  Delete Account
                </Button>
              </div>
            </div>
          )}

          {/* Workspace Invites Tab Content */}
          {activeTab === 'workspace' && (
            <div className="space-y-8">
              {/* Title with Invite Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Workspace Developers</h2>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite Developer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Developer</DialogTitle>
                      <DialogDescription>
                        Invite a developer to join your workspace. They will receive an email invitation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="developer@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Role
                        </label>
                        <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as 'developer' | 'member')}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleInviteDeveloper} disabled={!inviteEmail.trim()}>
                          Send Invite
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Important Information Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary">Important information About Joining Workspaces</h3>
                
                <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  <p>
                    Joining a workspace gives the workspace admin(s) full control over your account.
                  </p>
                  
                  <p>
                    Any assets on your account will be transferred to the workspace - this includes your generated content and voices. They will appear gradually in the new workspace over the next few minutes.
                  </p>
                  
                  <p>
                    You will still be able to access your content. You will be able to share your content with other members of the workspace. The workspace admins will be able to see/edit all of your content. The workspace admins will be able to lock you out or delete your account and your assets.
                  </p>
                  
                  <p>
                    Joining a workspace is irreversible, and you will not be able to create a new account with this email unless the workspace admin frees up this email.
                  </p>
                  
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Do not join workspaces you don&apos;t trust.
                  </p>
                </div>
              </div>

              {/* Developers List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members ({developers.length})
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchDevelopers}
                    className="gap-2"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {isLoading ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                    <p className="text-gray-600 dark:text-gray-400 text-center">Loading developers...</p>
                  </div>
                ) : developers.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                    <p className="text-gray-600 dark:text-gray-400 text-center">No developers in this workspace yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {developers.map((developer) => (
                      <div
                        key={developer.id}
                        className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:border-primary/40 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                              {developer.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={developer.avatar} alt={developer.name} className="h-full w-full rounded-full object-cover" />
                              ) : (
                                <User className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{developer.name}</h4>
                                {developer.role === 'admin' && (
                                  <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                    <Shield className="h-3 w-3" />
                                    Admin
                                  </span>
                                )}
                                {developer.role === 'developer' && (
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                    Developer
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {developer.email}
                                </span>
                                {developer.lastActive && (
                                  <span className="text-xs text-gray-500 dark:text-gray-500">
                                    Active {developer.lastActive}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              Joined {new Date(developer.joinedAt).toLocaleDateString()}
                            </span>
                            {developer.role !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveDeveloper(developer.id)}
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border-red-300 dark:border-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Pending Invites ({pendingInvites.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-900"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{invite.email}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Role: {invite.role} • Status: {invite.status}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPendingInvites(pendingInvites.filter(i => i.id !== invite.id))}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Pending Invites (old section - keeping for invites from other workspaces) */}
              {pendingInvites.length === 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 hover:border-primary/40 hover:shadow-lg transition-all">
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                    You have no pending workspace invites.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}