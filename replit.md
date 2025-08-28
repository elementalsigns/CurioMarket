# Overview
Curio Market is a full-stack multi-vendor marketplace for oddities, curios, and specimens, serving as a gothic-themed alternative to Etsy. It enables sellers to establish shops and list unique items like taxidermy, wet specimens, bones, and occult art. Buyers can browse, purchase, and manage orders. The platform operates on a subscription-based seller model ($10/month + 3% platform fee), aiming to be an independent, ungated marketplace for collectors and enthusiasts.

## Recent Enhancement (August 27, 2025)
- **Complete Stripe Subscription Model**: Full implementation of $10/month seller subscriptions with real Stripe integration. Includes secure payment processing, webhook handling, automatic role management, subscription dashboard, and professional onboarding flow. Replaces temporary bypasses with production-ready subscription system.

## Previous Enhancement (August 21, 2025)
- **Review Photos System**: Complete photo upload functionality added to reviews, allowing buyers to share visual proof of their purchases. Includes secure object storage integration, photo galleries in review displays, and professional photo management with up to 5 photos per review.

# User Preferences
Preferred communication style: Simple, everyday language.

## Design Preferences
- Typography: Victorian/gothic style with EB Garamond body text
- Logo styling: White text that turns red on hover with tapered red underline
- Color scheme: Darker zinc gradients preferred over gray for subtle depth
- Hover effects: Consistent red text hover effects across all navigation elements
- Notice styling: Red "Notice:" text with red-bordered boxes instead of white/primary colors

# System Architecture
## Frontend Architecture
- **Framework**: React with TypeScript using Vite.
- **Styling**: TailwindCSS with a gothic dark theme (near-black, deep purple, blood red).
- **UI Components**: Radix UI primitives and shadcn/ui.
- **Routing**: Wouter.
- **State Management**: TanStack React Query.
- **Forms**: React Hook Form with Zod validation.
- **Payments**: Stripe React components.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API endpoints with JSON responses.
- **Validation**: Zod schemas.
- **File Uploads**: Support for multiple cloud storage providers.
- **Session Management**: Express sessions with PostgreSQL storage for Replit Auth integration.

## Data Storage
- **Database**: PostgreSQL with Neon serverless database provider.
- **ORM**: Drizzle ORM.
- **Schema**: Comprehensive schema for users, sellers, listings, orders, carts, messaging, and reviews.
- **File Storage**: Cloud-based asset storage (Google Cloud Storage/AWS S3) for product images.
- **Session Storage**: PostgreSQL table for Express session persistence.

## Authentication & Authorization
- **Auth Provider**: Replit's OIDC authentication system with Passport.js strategy.
- **Session Management**: Express sessions with secure cookie configuration.
- **Role-Based Access**: User roles (visitor, buyer, seller, admin) with permission checks.
- **Seller Verification**: Stripe subscription required for seller account activation.

## Payment Processing
- **Payment Provider**: Stripe for subscription billing and marketplace transactions.
- **Subscription Model**: Monthly seller subscriptions ($10/month) with automatic renewal.
- **Transaction Fees**: 3% platform fee on completed sales.
- **Payout System**: Integrated with Stripe for seller payouts.

# External Dependencies
## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database.
- **Authentication**: Replit OIDC service.
- **Session Storage**: PostgreSQL-backed express sessions.

## Payment & Financial Services
- **Stripe**: Complete payment processing (subscriptions, marketplace transactions, seller payouts).
- **Pricing**: $10/month seller subscription + 3% platform transaction fee.

## File & Asset Management
- **Google Cloud Storage**: Primary file storage and review photo hosting.
- **AWS S3**: Alternative/backup file storage.
- **Uppy**: Frontend file upload components for review photos and product images.
- **Object Storage Service**: Custom service for secure photo uploads and serving.

## UI & Component Libraries
- **Radix UI**: Accessible UI primitives.
- **shadcn/ui**: Pre-built component library.
- **TailwindCSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Development & Build Tools
- **Vite**: Build tool and development server.
- **TypeScript**: Type safety.
- **Drizzle Kit**: Database migrations.
- **React Query**: Server state management and API caching.

## Third-Party Integrations
- **Replit Development**: Custom Replit plugins.
- **Email Services**: Configured for transactional emails.
- **Search**: PostgreSQL full-text search with trigram matching.