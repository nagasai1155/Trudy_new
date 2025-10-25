# Trudy AI Platform - Frontend

A modern, production-ready Next.js 14 application for managing AI voice agents. Built with TypeScript, Tailwind CSS, and a comprehensive suite of modern web technologies.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time overview of calls, agents, and campaigns
- **Agent Builder**: Create and manage AI voice agents with custom prompts and voices
- **Campaign Management**: Launch and monitor calling campaigns
- **Voice Cloning**: Create custom voice clones with audio samples
- **Analytics**: Comprehensive reporting with interactive charts
- **Contact Management**: Import, manage, and organize contacts
- **Settings**: Configure workspace and integrations

### Technical Features
- 🔐 **Authentication**: Secure Auth0 integration
- 🎨 **Modern UI**: shadcn/ui components with Tailwind CSS
- 📊 **Data Visualization**: Recharts for analytics
- 🔄 **State Management**: Zustand for global state
- 🌐 **API Integration**: TanStack Query for data fetching
- 📱 **Responsive Design**: Mobile-first approach
- 🌙 **Dark Mode**: System preference detection
- ✅ **Form Validation**: Zod schemas with React Hook Form
- 🎯 **TypeScript**: Full type safety

## 📋 Prerequisites

Before you begin, ensure you have the following:

1. **Node.js**: Version 18.0 or higher
2. **npm or yarn**: Latest version
3. **Auth0 Account**: For authentication
4. **API Accounts** (to be provided by client):
   - UltraVox API key
   - ElevenLabs API key
   - Telnyx API key
   - Supabase credentials

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trudy-ai-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` with your credentials:
   ```env
   # Auth0 Configuration
   AUTH0_SECRET='your-auth0-secret'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
   AUTH0_CLIENT_ID='your-client-id'
   AUTH0_CLIENT_SECRET='your-client-secret'

   # API Configuration
   NEXT_PUBLIC_API_URL='http://localhost:3000/api'

   # Service API Keys (to be provided)
   NEXT_PUBLIC_ULTRAVOX_API_KEY='your-ultravox-key'
   NEXT_PUBLIC_ELEVENLABS_API_KEY='your-elevenlabs-key'
   NEXT_PUBLIC_TELNYX_API_KEY='your-telnyx-key'
   NEXT_PUBLIC_SUPABASE_URL='your-supabase-url'
   NEXT_PUBLIC_SUPABASE_ANON_KEY='your-supabase-key'
   ```

4. **Generate Auth0 Secret**
   ```bash
   openssl rand -hex 32
   ```
   Use the output as your `AUTH0_SECRET`

## 🚀 Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically reload if you make changes to the code.

## 🏗️ Build

Create a production build:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

## 📁 Project Structure

```
trudy-ai-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── agents/        # Agent management
│   │   │   ├── campaigns/     # Campaign management
│   │   │   ├── voice-cloning/ # Voice cloning
│   │   │   ├── analytics/     # Analytics & reports
│   │   │   ├── calls/         # Call history
│   │   │   ├── contacts/      # Contact management
│   │   │   └── settings/      # Settings
│   │   ├── api/               # API routes
│   │   │   └── auth/          # Auth0 endpoints
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilities and configs
│   │   ├── auth.ts          # Auth0 configuration
│   │   ├── api.ts           # API client
│   │   ├── utils.ts         # Utility functions
│   │   └── validations.ts   # Zod schemas
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript types
│   └── constants/           # App constants
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔑 Key Technologies

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Authentication**: [Auth0](https://auth0.com/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🔒 Authentication Setup

### Auth0 Configuration

1. **Create an Auth0 Application**
   - Go to [Auth0 Dashboard](https://manage.auth0.com/)
   - Create a new "Regular Web Application"
   - Note your Domain, Client ID, and Client Secret

2. **Configure Callback URLs**
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

3. **Update Environment Variables**
   - Add your Auth0 credentials to `.env.local`

## 📊 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Testing
npm run test         # Run tests (when configured)
npm run test:watch   # Run tests in watch mode
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables**
   - Add all environment variables in Vercel dashboard
   - Update callback URLs in Auth0 with your Vercel domain

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- DigitalOcean App Platform

## 🎨 Customization

### Theme Colors

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... other colors */
}
```

### Add New Pages

1. Create a new directory in `src/app/(dashboard)/`
2. Add a `page.tsx` file
3. Update navigation in `src/constants/index.ts`

## 🔧 Configuration

### API Endpoints

Configure API endpoints in `src/lib/api.ts`:

```typescript
export const endpoints = {
  agents: {
    list: '/agents',
    get: (id: string) => `/agents/${id}`,
    // ... other endpoints
  },
}
```

### Constants

Update app-wide constants in `src/constants/index.ts`:
- Navigation items
- Quick actions
- Timezones
- Languages
- Status options

## 📝 Notes for Client

### Required API Keys (Pending)

The following API keys need to be provided:

1. **UltraVox**: Voice synthesis and call handling
2. **ElevenLabs**: Additional voice options and cloning
3. **Telnyx**: Phone number provisioning and calling
4. **Supabase**: Database and storage (optional, can use alternative)
5. **Auth0**: Authentication (client should create account)

### Backend Integration

This is a **frontend-only** implementation. To make it fully functional:

1. Implement backend API endpoints matching the routes in `src/lib/api.ts`
2. Set up database schema based on types in `src/types/index.ts`
3. Configure webhooks for real-time updates
4. Set up file upload handling for voice samples and CSV imports

### Production Checklist

Before deploying to production:

- [ ] Configure Auth0 production domain
- [ ] Add all required API keys
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics (PostHog)
- [ ] Set up CDN for static assets
- [ ] Enable rate limiting
- [ ] Configure CORS policies
- [ ] Set up backup and monitoring
- [ ] Review and update security headers
- [ ] Test all user journeys

## 🤝 Support

For questions or issues:
1. Check the documentation
2. Review the code comments
3. Contact the development team

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ using modern web technologies**

