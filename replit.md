# Overview

Curio Market is a full-stack multi-vendor marketplace for oddities, curios, and specimens - essentially a gothic-themed alternative to Etsy. The platform allows sellers to create shops and list unique items like taxidermy, wet specimens, bones, and occult art, while buyers can browse, purchase, and manage orders. The application features a subscription-based seller model ($10/month + 3% platform fee) and emphasizes an independent, ungated marketplace for collectors and enthusiasts.

# User Preferences

Preferred communication style: Simple, everyday language.

## Design Preferences
- Typography: Victorian/gothic style with EB Garamond body text
- Logo styling: White text that turns red on hover with tapered red underline
- Color scheme: Darker zinc gradients preferred over gray for subtle depth
- Hover effects: Consistent red text hover effects across all navigation elements
- Notice styling: Red "Notice:" text with red-bordered boxes instead of white/primary colors

# Recent Changes

## Seller Guide Page Implementation (August 2025)
- **Feature**: Created comprehensive seller guide page at `/seller/guide` route
- **Content**: Step-by-step onboarding process, best practices, pricing transparency, and community building tips
- **Design**: Maintains gothic aesthetic with dark theme, red accents, and Victorian typography
- **Integration**: Added to both authenticated and non-authenticated route flows in App.tsx
- **Files Created**: `client/src/pages/seller-guide.tsx`
- **Files Modified**: `client/src/App.tsx` (added route and import)

## Dynamic Category Counting System (August 2025)
- **Feature**: Replaced hardcoded category counts with live data from API
- **Implementation**: Added `/api/categories/counts` endpoint that returns real listing counts by category
- **Components Updated**: CategoryGrid now fetches dynamic counts and displays loading states
- **Development Data**: Shows realistic sample numbers (Wet Specimens: 3, Bones & Skulls: 2, Taxidermy: 1, Vintage Medical: 4)
- **Production Ready**: System will automatically reflect actual listing counts when sellers add items
- **Files Modified**: `server/routes.ts`, `server/storage.ts`, `client/src/components/category-grid.tsx`

## Layout Fix (August 2025)
- **White Space Issue Resolution**: Resolved persistent white space under footer using inline styles
- **Method**: Applied direct HTML styling in index.html and React components to override CSS conflicts
- **Technical Details**: Used `height: 100vh` on body, `height: 100%` cascade through DOM, flexbox layout with `flex: 1` on main content
- **Files Modified**: `client/index.html`, `client/src/App.tsx`, `client/src/pages/home.tsx`, `client/src/index.css`

## Background Color Fix (August 2025)
- **Issue**: White background appeared in sections during logo hover troubleshooting
- **Resolution**: Added comprehensive CSS overrides and inline styles to enforce pure black background
- **Technical Details**: Applied hsl(212, 5%, 5%) throughout all components, sections, and root elements
- **Files Modified**: `client/src/pages/home.tsx`, `client/src/index.css`, `client/src/App.tsx`

## Product Card Symmetry Fix (August 2025)
- **Issue**: Product boxes in "Recently Added" section had inconsistent heights
- **Resolution**: Applied flexbox layout with h-full and flex-col classes for uniform card heights
- **Technical Details**: Used flex-1, justify-between, and items-stretch for proper content distribution
- **Files Modified**: `client/src/components/product-card.tsx`, `client/src/pages/home.tsx`

## Seller Terms & Agreement Implementation (August 2025)
- **Feature**: Added comprehensive seller agreement page with prohibited items policy
- **Details**: Professional terms covering human remains, endangered species, legal compliance, and documentation requirements
- **Implementation**: Created `/seller/terms` route with mandatory agreement checkboxes before seller registration
- **Files Added**: `client/src/pages/seller-terms.tsx`
- **Files Modified**: `client/src/App.tsx`, `client/src/pages/home.tsx`, `client/src/pages/user-profile.tsx`

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with a gothic dark theme (near-black, deep purple, blood red color palette)
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Payments**: Stripe React components for subscription and checkout flows

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints with proper HTTP status codes and JSON responses
- **Validation**: Zod schemas for request/response validation and type safety
- **File Uploads**: Support for multiple cloud storage providers (@uppy components, AWS S3/Google Cloud Storage)
- **Session Management**: Express sessions with PostgreSQL storage for Replit Auth integration

## Data Storage
- **Database**: PostgreSQL with Neon serverless database provider
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Comprehensive schema supporting users, sellers, listings, orders, carts, messaging, and reviews
- **File Storage**: Cloud-based asset storage (Google Cloud Storage/AWS S3) for product images
- **Session Storage**: PostgreSQL table for Express session persistence

## Authentication & Authorization
- **Auth Provider**: Replit's OIDC authentication system with Passport.js strategy
- **Session Management**: Express sessions with secure cookie configuration
- **Role-Based Access**: User roles (visitor, buyer, seller, admin) with appropriate permission checks
- **Seller Verification**: Stripe subscription requirement for seller account activation

## Payment Processing
- **Payment Provider**: Stripe for subscription billing and marketplace transactions
- **Subscription Model**: Monthly seller subscriptions ($10/month) with automatic renewal
- **Transaction Fees**: 3% platform fee on completed sales
- **Payout System**: Integrated with Stripe for seller payouts and financial management

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC service for user authentication
- **Session Storage**: PostgreSQL-backed express sessions

## Payment & Financial Services
- **Stripe**: Complete payment processing including subscriptions, marketplace transactions, and seller payouts
- **Pricing**: $10/month seller subscription + 3% platform transaction fee

## File & Asset Management
- **Google Cloud Storage**: Primary file storage service for product images and assets
- **AWS S3**: Alternative/backup file storage option
- **Uppy**: Frontend file upload components with cloud storage integration

## UI & Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **shadcn/ui**: Pre-built component library built on Radix UI
- **TailwindCSS**: Utility-first CSS framework with custom gothic theme
- **Lucide React**: Icon library for consistent iconography

## Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migrations and schema management
- **React Query**: Server state management and API caching

## Third-Party Integrations
- **Replit Development**: Custom Replit plugins for development environment integration
- **Email Services**: Configured for transactional emails (likely Resend based on package mentions)
- **Search**: PostgreSQL full-text search with trigram matching for product discovery