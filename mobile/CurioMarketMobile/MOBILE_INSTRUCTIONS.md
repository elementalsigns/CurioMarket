# Curio Market Mobile App

This is a React Native mobile app that connects to your existing Curio Market website without changing anything on your site.

## Quick Start

### 1. Install Expo Go on Your Phone
- **iPhone**: Download "Expo Go" from App Store
- **Android**: Download "Expo Go" from Google Play

### 2. Start the Mobile App
```bash
cd mobile/CurioMarketMobile
npm start
```

### 3. View on Your Phone
- Scan the QR code that appears in your terminal with Expo Go
- The app will load and show your Curio Market products!

## Configuration

### Testing on Your Phone
If you want to test on your phone while your computer runs the server:

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig` in Terminal

2. Edit `config.ts`:
   ```typescript
   export const MOBILE_API_URL = 'http://YOUR_IP_ADDRESS:5000';
   ```

3. Make sure your phone and computer are on the same WiFi network

## What This App Shows

✅ **Your actual products** from your Curio Market database  
✅ **Real seller shops** and product images  
✅ **Proper pricing** from your existing system  
✅ **Gothic dark theme** matching your website  

## Features Included

- Browse featured products
- View product details and images
- See seller shop names
- Mobile-optimized layout
- Error handling and loading states

## No Changes to Your Website

This mobile app:
- **Does NOT** modify any files in your existing website
- **Uses** your existing API endpoints
- **Reads** from your same database
- **Works** alongside your website perfectly

## Next Steps for Full Mobile App

Once you're happy with this prototype:
1. Add user authentication
2. Implement cart and checkout
3. Add product search and filtering
4. Include messaging between buyers/sellers
5. Submit to App Store and Google Play

## Troubleshooting

**"Network request failed"**: Make sure your Curio Market server is running (`npm run dev`)

**"No products found"**: Your API is working but no featured products exist - add some products to your website first

**Can't connect on phone**: Update the IP address in `config.ts` to your computer's IP address