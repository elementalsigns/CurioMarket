# Stripe Subscription Setup Guide

## Complete Stripe Integration for Curio Market Seller Subscriptions

Your Curio Market now has a fully implemented Stripe subscription system. Here's what's been set up and what you need to complete:

## ✅ What's Already Implemented

### Backend Implementation
- **Subscription Creation**: Automatic $10/month subscription setup
- **Webhook Handling**: Processes subscription events to update user roles
- **Payment Processing**: Secure card payments with Stripe Elements
- **Subscription Management**: Cancel, update, and status tracking
- **Database Integration**: User roles automatically updated based on subscription status

### Frontend Implementation  
- **Payment Form**: Professional subscription payment interface
- **Subscription Status**: Dashboard showing current subscription details
- **Navigation Integration**: "Become a Seller" option in user menu
- **Seller Onboarding**: Redirects to subscription before shop setup

### Key Features
- $10/month subscription fee for sellers
- 2.6% platform fee on sales
- Automatic role management (buyer ↔ seller)
- Professional subscription dashboard
- Email notifications for payment events
- Webhook security with signature verification

## 🔧 Required Environment Variables

You need to set these in your Replit Secrets:

```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SELLER_PRICE_ID=price_... (optional - will auto-create if not provided)
```

## 📡 Webhook Setup

Your webhook endpoint is already configured at: `/api/webhooks/stripe`

**Webhook URL**: `https://www.curiosities.market/api/webhooks/stripe`

**Required Events**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 🚀 User Flow

1. **User Signs Up**: Creates account as "buyer"
2. **Wants to Sell**: Clicks "Become a Seller" in menu
3. **Subscription Page**: Sees benefits and $10/month pricing
4. **Payment**: Secure Stripe Elements form
5. **Success**: Automatically upgraded to "seller" role
6. **Shop Setup**: Redirected to create shop profile
7. **Start Selling**: Can create listings and manage orders

## 🛡️ Security Features

- **Webhook Verification**: All webhooks verified with Stripe signatures
- **Role-Based Access**: Seller features only available to subscribed users
- **Secure Payments**: No sensitive card data touches your servers
- **Automatic Cleanup**: Failed/cancelled subscriptions automatically downgrade users

## 🔄 Subscription States

- **Active**: User can sell, create listings, manage shop
- **Past Due**: Temporary grace period, warnings displayed
- **Canceled**: Downgraded to buyer, loses seller privileges
- **Incomplete**: Payment failed, needs to complete payment

## 📊 Admin Features

- Track subscription revenue
- Monitor subscription status changes
- Handle customer support for billing issues
- View subscription analytics through Stripe Dashboard

## 🎯 Next Steps for Production

1. **Set Live Keys**: Replace test keys with live Stripe keys
2. **Test Thoroughly**: Test full subscription flow in staging
3. **Monitor Webhooks**: Set up monitoring for webhook failures
4. **Customer Support**: Prepare support docs for billing questions
5. **Analytics**: Track conversion rates from visitor → buyer → seller

## 💡 Business Model

- **Seller Subscription**: $10/month per seller
- **Platform Fee**: 2.6% of each successful sale
- **Revenue Streams**: Monthly subscriptions + transaction fees
- **Scalable**: Automatic billing and user management

Your subscription system is production-ready! Users can now subscribe to become sellers and start earning on your marketplace.