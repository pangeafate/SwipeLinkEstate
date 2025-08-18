# SwipeLink Estate 🏠

A revolutionary real estate platform that combines a Tinder-like property browsing experience with comprehensive CRM functionality.

## ✨ Features

- **Tinder-style Property Swiping** - Intuitive swipe interface for browsing properties
- **Agent Dashboard** - Complete property management system
- **Link Sharing** - Create shareable property collections without client authentication
- **Real-time Analytics** - Track engagement and property performance
- **Mobile-First Design** - Optimized for all devices

## 🚀 Live Demo

**Live Site**: [Coming Soon - Deploy via Vercel]

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Storage, Auth)
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel
- **UI Components**: Framer Motion, react-tinder-card

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pangeafate/SwipeLinkEstate&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Environment Variables Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🏗️ Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/pangeafate/SwipeLinkEstate.git
   cd SwipeLinkEstate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials to .env.local
   ```

4. **Set up the database**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Run the SQL from `lib/supabase/schema.sql` in the SQL editor

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

**Current Test Coverage**: 28/28 tests passing ✅

## 📁 Project Structure

```
SwipeLinkEstate/
├── app/                     # Next.js App Router
│   ├── (agent)/            # Agent dashboard routes
│   ├── link/[code]/        # Client swipe interface  
│   └── api/                # API endpoints
├── components/             # Modular component system
│   ├── property/           # Property management module
│   │   ├── README.md       # Module documentation
│   │   ├── index.ts        # Public API exports
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── property.service.ts # Business logic
│   │   ├── components/     # UI components
│   │   └── __tests__/      # Module tests
│   ├── link/               # Link management (coming soon)
│   ├── swipe/              # Client interface (coming soon)
│   └── analytics/          # Analytics (coming soon)
├── lib/
│   ├── supabase/           # Database client & schema
│   └── utils/              # Shared utilities  
├── public/
│   └── images/
│       └── properties/     # Property images
└── __tests__/              # Integration & E2E tests
```

## 🗄️ Database Schema

The platform uses the following core tables:

- **properties** - Property listings with images and details
- **links** - Shareable property collections
- **activities** - User engagement tracking
- **sessions** - Client session management

See `lib/supabase/schema.sql` for the complete schema.

## 🔧 Modules

### Property Module ✅ 
- **PropertyService** - CRUD operations for properties ([docs](./components/property/README.md))
- **PropertyCard** - Display component for property listings
- **Status**: Complete with full test coverage (10/10 tests passing)

### Link Module 🚧
- **LinkService** - Generate and manage shareable property links  
- **LinkCreator** - Multi-step link creation interface
- **Status**: Coming next

### Swipe Module 🚧
- **SwipeService** - Handle swipe gestures and sessions
- **SwipeContainer** - Tinder-like card interface
- **Status**: Planned

### Analytics Module 🚧  
- **AnalyticsService** - Real-time metrics and reporting
- **Dashboard** - Engagement tracking interface
- **Status**: Planned

## 🎨 Design System

Built with a comprehensive design system featuring:

- **Color Palette**: Primary blues, success greens, semantic colors
- **Typography**: Inter font family with consistent sizing
- **Components**: Reusable buttons, cards, inputs with Tailwind CSS
- **Animations**: Smooth transitions and micro-interactions

## 🚀 Deployment Guide

### Vercel (Recommended)

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Get your live URL: `https://your-project.vercel.app`

### Other Options

- **Netlify**: Supports Next.js with build plugins
- **Railway**: Good for full-stack apps with databases
- **Heroku**: Classic PaaS option (paid plans)

## 📊 Performance Targets

- **Initial Load**: < 2 seconds
- **Swipe Response**: < 100ms  
- **Image Load**: < 1 second
- **Test Coverage**: > 80%

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Make sure all tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Repository**: https://github.com/pangeafate/SwipeLinkEstate
- **Issues**: https://github.com/pangeafate/SwipeLinkEstate/issues
- **Documentation**: [Coming Soon]

---

**Built with ❤️ using Next.js and Supabase**