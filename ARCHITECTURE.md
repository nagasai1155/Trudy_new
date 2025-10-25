# Trudy AI Platform - Architecture Documentation

## Overview

This document provides a comprehensive overview of the Trudy AI Platform frontend architecture, design patterns, and implementation details.

## Technology Stack

### Core Framework
- **Next.js 14**: React framework with App Router for file-based routing
- **React 18**: UI library with Server Components support
- **TypeScript**: Static type checking and enhanced IDE support

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Accessible, customizable component library
- **Radix UI**: Unstyled, accessible component primitives
- **next-themes**: Theme management (light/dark mode)

### State Management
- **Zustand**: Lightweight state management for global app state
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management

### Data & Validation
- **Zod**: Runtime type validation and schema parsing
- **date-fns**: Date manipulation and formatting

### Visualization
- **Recharts**: Composable charting library for analytics

### Authentication
- **Auth0 Next.js SDK**: Secure authentication and authorization

## Architecture Patterns

### 1. App Router Structure

```
app/
├── (dashboard)/          # Route group with shared layout
│   ├── layout.tsx       # Not used (using AppLayout component)
│   └── [feature]/       # Feature-based routing
├── api/                  # API routes
└── layout.tsx           # Root layout
```

**Key Decisions:**
- Route groups for logical organization without URL nesting
- Feature-based folder structure for maintainability
- Centralized layout components for consistency

### 2. Component Architecture

#### Layer 1: UI Primitives (`components/ui/`)
- Base components from shadcn/ui
- Fully typed with TypeScript
- Variant-based styling with class-variance-authority
- Examples: Button, Card, Input, Dialog

#### Layer 2: Layout Components (`components/layout/`)
- Sidebar, Header, AppLayout
- Workspace switching
- Navigation management

#### Layer 3: Feature Components
- Agent builder forms
- Campaign creation wizards
- Voice cloning interfaces

**Component Design Principles:**
- Single Responsibility Principle
- Composition over inheritance
- Props drilling minimized with context/stores
- Controlled vs uncontrolled components based on use case

### 3. State Management Strategy

#### Global State (Zustand)
**Used for:**
- User session data
- Current workspace
- UI state (sidebar collapsed, theme)
- Notifications

**Store Structure:**
```typescript
interface AppStore {
  // Data
  user: User | null
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  notifications: Notification[]
  
  // UI State
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  setUser: (user: User | null) => void
  setCurrentWorkspace: (workspace: Workspace) => void
  toggleSidebar: () => void
  // ...
}
```

#### Server State (TanStack Query)
**Used for:**
- API data fetching
- Caching and synchronization
- Optimistic updates
- Background refetching

**Query Structure:**
```typescript
// Custom hook pattern
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Agent[]>>(
        endpoints.agents.list
      )
      return response.data
    },
  })
}
```

#### Local State (useState)
**Used for:**
- Form inputs
- UI toggles
- Temporary data

### 4. Type System

#### Centralized Types (`types/index.ts`)
All domain models, API responses, and form inputs are typed:

```typescript
// Domain Models
export interface Agent {
  id: string
  name: string
  status: AgentStatus
  // ...
}

// API Responses
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Form Inputs
export type CreateAgentInput = z.infer<typeof createAgentSchema>
```

**Type Organization:**
- Domain types (User, Agent, Campaign, etc.)
- API types (responses, requests)
- Form types (inputs, validation)
- UI types (component props)

### 5. Data Fetching & API Integration

#### API Client (`lib/api.ts`)
```typescript
class ApiClient {
  private baseUrl: string
  private token: string | null
  
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data?: any): Promise<T>
  async put<T>(endpoint: string, data?: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
  async upload<T>(endpoint: string, formData: FormData): Promise<T>
}
```

**Features:**
- Automatic token injection
- Type-safe responses
- Error handling
- File upload support

#### Endpoint Management
```typescript
export const endpoints = {
  agents: {
    list: '/agents',
    get: (id: string) => `/agents/${id}`,
    create: '/agents',
    update: (id: string) => `/agents/${id}`,
    delete: (id: string) => `/agents/${id}`,
  },
  // ...
}
```

### 6. Form Handling

#### Pattern: React Hook Form + Zod

```typescript
// 1. Define schema
const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(10),
  voiceId: z.string().min(1),
})

// 2. Infer type
type CreateAgentInput = z.infer<typeof createAgentSchema>

// 3. Use in component
const form = useForm<CreateAgentInput>({
  resolver: zodResolver(createAgentSchema),
})

// 4. Submit handler
const onSubmit = async (data: CreateAgentInput) => {
  await createAgent.mutateAsync(data)
}
```

**Benefits:**
- Type-safe forms
- Runtime validation
- Automatic error messages
- Schema reuse for API validation

### 7. Authentication Flow

```
User → Auth0 Login → Callback → Session Created → Protected Routes
```

**Implementation:**
- `middleware.ts`: Route protection
- `lib/auth.ts`: Session helpers
- `app/api/auth/[auth0]/route.ts`: Auth handlers

**Protected Routes:**
All routes under `(dashboard)` require authentication via middleware.

### 8. Styling System

#### Tailwind Configuration
```typescript
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // ...
    },
  },
}
```

#### CSS Variables (globals.css)
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... */
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  /* ... */
}
```

**Benefits:**
- Theme switching without recompilation
- HSL color space for easy manipulation
- Consistent design tokens

### 9. File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected routes
│   │   ├── dashboard/     # Feature pages
│   │   ├── agents/
│   │   └── ...
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/               # Base components
│   └── layout/           # Layout components
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   ├── auth.ts          # Auth helpers
│   ├── utils.ts         # General utilities
│   └── validations.ts   # Zod schemas
├── hooks/               # Custom hooks
│   ├── use-agents.ts
│   ├── use-campaigns.ts
│   └── use-toast.ts
├── stores/              # Zustand stores
│   ├── app-store.ts
│   ├── agent-store.ts
│   └── campaign-store.ts
├── types/               # TypeScript types
│   └── index.ts
└── constants/           # App constants
    └── index.ts
```

### 10. Performance Optimizations

#### Code Splitting
- Automatic route-based splitting via Next.js
- Dynamic imports for heavy components
- Lazy loading for charts and visualizations

#### Caching Strategy
- TanStack Query for server state caching (5-minute stale time)
- Zustand persistence for user preferences
- Next.js static generation where possible

#### Bundle Optimization
- Tree shaking with ES modules
- Minimal dependencies
- SVG icons (Lucide) for small bundle size

## Design Decisions

### Why Next.js 14 App Router?
- File-based routing with powerful layouts
- Server Components for better performance
- Built-in API routes
- Optimized image handling
- Edge-ready deployment

### Why Zustand over Redux?
- Simpler API
- Less boilerplate
- Better TypeScript support
- Smaller bundle size
- Built-in persistence

### Why TanStack Query?
- Automatic caching and revalidation
- Optimistic updates
- Loading and error states
- DevTools for debugging
- Industry standard

### Why shadcn/ui?
- Copy-paste instead of dependencies
- Full customization
- Built on Radix UI (accessible)
- TypeScript-first
- Active community

### Why Zod?
- Runtime type safety
- Schema composition
- Excellent error messages
- React Hook Form integration
- Can be shared with backend

## Security Considerations

1. **Authentication**: Auth0 handles security
2. **CSRF Protection**: SameSite cookies
3. **XSS Prevention**: React escaping + sanitization
4. **Input Validation**: Zod schemas on all inputs
5. **Environment Variables**: Sensitive data in env vars
6. **API Security**: Token-based authentication

## Scalability Considerations

1. **Code Organization**: Feature-based structure
2. **Component Reusability**: Composition patterns
3. **Type Safety**: Catch errors early
4. **State Management**: Separated concerns
5. **API Layer**: Abstracted for easy changes
6. **Testing**: Structure supports unit/integration tests

## Future Enhancements

### Phase 2
- Real-time updates via WebSocket
- Advanced filtering and search
- Bulk operations
- Export functionality
- Mobile app integration

### Phase 3
- PWA support
- Offline mode
- Advanced analytics
- Custom dashboards
- White-label customization

## Development Workflow

1. **Start Development**: `npm run dev`
2. **Type Check**: `npm run type-check`
3. **Lint**: `npm run lint`
4. **Build**: `npm run build`
5. **Deploy**: `vercel --prod`

## Testing Strategy (Future)

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright
- **E2E Tests**: Playwright with real Auth0
- **Component Tests**: Storybook
- **Type Tests**: TypeScript compiler

## Monitoring & Analytics (Future)

- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics
- **User Analytics**: PostHog
- **Logging**: Custom implementation

---

**Document Version**: 1.0  
**Last Updated**: February 2024  
**Maintained By**: Development Team

