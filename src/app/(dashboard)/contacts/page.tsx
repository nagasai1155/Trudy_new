'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreVertical, Upload, Download, Edit, Trash } from 'lucide-react'
import { useState } from 'react'
import { formatPhoneNumber } from '@/lib/utils'

// Mock data
const mockContacts = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    company: 'Acme Corp',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '+1234567891',
    company: 'Tech Inc',
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    phoneNumber: '+1234567892',
    company: 'Startup LLC',
  },
]

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredContacts = mockContacts.filter(contact =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  )

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Contacts</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your contact list
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
              <span className="sm:hidden">Import</span>
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button className="flex-1 sm:flex-none">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Contact</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contacts Table - Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900">Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900">Email</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900">Phone</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900">Company</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-xs lg:text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-600">
                        {contact.email}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900">
                        {formatPhoneNumber(contact.phoneNumber)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900">
                        {contact.company}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {filteredContacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-gray-600 truncate mt-1">{contact.email}</p>
                    <p className="text-xs text-gray-900 mt-1">{formatPhoneNumber(contact.phoneNumber)}</p>
                    <p className="text-xs text-gray-600 mt-1">{contact.company}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900">No contacts found</h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 text-center px-4">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by adding your first contact'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

