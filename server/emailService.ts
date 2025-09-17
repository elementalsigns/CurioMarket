import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.error('[EMAIL SERVICE] ❌ SENDGRID_API_KEY environment variable must be set');
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);
console.log('[EMAIL SERVICE] ✅ SendGrid API key set successfully');

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

interface OrderEmailData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  orderTotal: string;
  orderItems: Array<{
    title: string;
    price: string;
    quantity: number;
  }>;
  shippingAddress?: any;
  trackingNumber?: string;
  carrier?: string;
  shopName: string;
  sellerEmail: string;
}

export class EmailService {
  private readonly fromEmail = 'Info@curiosities.market';
  
  constructor() {
    // Verify API key is available
    if (!process.env.SENDGRID_API_KEY) {
      console.error('[EMAIL SERVICE] ❌ SENDGRID_API_KEY is not set');
    } else {
      console.log('[EMAIL SERVICE] ✅ SendGrid API key is configured');
    }
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      console.log('[EMAIL SERVICE] 📧 Attempting to send email:', {
        to: params.to,
        from: params.from,
        subject: params.subject,
        hasText: !!params.text,
        hasHtml: !!params.html
      });
      
      // Build message conditionally to avoid empty content fields
      const msg: any = {
        to: params.to,
        from: params.from,
        subject: params.subject,
      };
      
      // Only add text if we have non-empty content
      if (params.text && params.text.trim()) {
        msg.text = params.text;
      }
      
      // Only add html if we have non-empty content
      if (params.html && params.html.trim()) {
        msg.html = params.html;
        // Add fallback text if html exists but no text provided
        if (!msg.text) {
          msg.text = params.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 500);
        }
      }

      const result = await mailService.send(msg);
      
      console.log('[EMAIL SERVICE] ✅ Email sent successfully:', {
        to: params.to,
        subject: params.subject,
        result: 'success'
      });
      return true;
    } catch (error: any) {
      console.error('[EMAIL SERVICE] ❌ SendGrid email error:', {
        to: params.to,
        subject: params.subject,
        error: error.message,
        code: error.code,
        statusCode: error.response?.status
      });
      
      if (error.response && error.response.body && error.response.body.errors) {
        console.error('[EMAIL SERVICE] SendGrid error details:', JSON.stringify(error.response.body.errors, null, 2));
      }
      
      // Log the full error for debugging
      console.error('[EMAIL SERVICE] Full error object:', error);
      return false;
    }
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    console.log('[EMAIL SERVICE] 🚀 Starting order confirmation email process');
    console.log('[EMAIL SERVICE] Recipient:', data.customerEmail);
    console.log('[EMAIL SERVICE] Order Number:', data.orderNumber);
    
    const subject = `Order Confirmation - ${data.orderNumber}`;
    
    // Create text version for better email deliverability
    const text = `
CURIO MARKET - ORDER CONFIRMATION

Dear ${data.customerName},

Thank you for your order! We've received your purchase and ${data.shopName} will begin processing it shortly.

ORDER DETAILS
Order Number: ${data.orderNumber}
Order Date: ${new Date().toLocaleDateString()}
Seller: ${data.shopName}

ITEMS ORDERED
${data.orderItems.map(item => `${item.title} (Qty: ${item.quantity}) - $${item.price}`).join('\n')}

Order Total: $${data.orderTotal}

${data.shippingAddress ? `
SHIPPING ADDRESS
${data.shippingAddress.name}
${data.shippingAddress.line1}
${data.shippingAddress.line2 ? data.shippingAddress.line2 : ''}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}
${data.shippingAddress.country}
` : ''}

You'll receive another email with tracking information once your order ships.

Questions? Contact ${data.shopName} directly or visit our Help Center at https://www.curiosities.market/help

Thank you for supporting independent sellers on Curio Market
    `.trim();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'EB Garamond', 'Georgia', serif; color: hsl(0, 0%, 100%); background: hsl(212, 5%, 5%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: hsl(0, 0%, 11%); padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 1px solid hsl(0, 0%, 16%); }
          .header { text-align: center; border-bottom: 2px solid hsl(0, 77%, 26%); padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 600; color: hsl(0, 77%, 26%); margin-bottom: 10px; font-variant: small-caps; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); }
          .order-details { background: hsl(0, 0%, 16%); padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid hsl(0, 0%, 20%); }
          .items { margin: 20px 0; }
          .item { border-bottom: 1px solid hsl(0, 0%, 20%); padding: 10px 0; display: flex; justify-content: space-between; color: hsl(0, 0%, 100%); }
          .total { font-weight: bold; font-size: 18px; color: hsl(0, 77%, 26%); text-align: right; margin-top: 15px; border-top: 2px solid hsl(0, 77%, 26%); padding-top: 15px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid hsl(0, 0%, 20%); text-align: center; color: hsl(0, 0%, 80%); font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Curio Market</div>
            <h1 style="margin: 0; color: hsl(0, 0%, 100%);">Order Confirmation</h1>
          </div>
          
          <p>Dear ${data.customerName},</p>
          
          <p>Thank you for your order! We've received your purchase and ${data.shopName} will begin processing it shortly.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Seller:</strong> ${data.shopName}</p>
          </div>
          
          <div class="items">
            <h3>Items Ordered</h3>
            ${data.orderItems.map(item => `
              <div class="item">
                <div>${item.title} (Qty: ${item.quantity})</div>
                <div>$${item.price}</div>
              </div>
            `).join('')}
            <div class="total">Order Total: $${data.orderTotal}</div>
          </div>
          
          ${data.shippingAddress ? `
          <div class="order-details">
            <h3 style="margin-top: 0;">Shipping Address</h3>
            <p>${data.shippingAddress.name}<br>
            ${data.shippingAddress.line1}<br>
            ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}<br>
            ${data.shippingAddress.country}</p>
          </div>
          ` : ''}
          
          <p>You'll receive another email with tracking information once your order ships.</p>
          
          <div class="footer">
            <p>Questions? Contact ${data.shopName} directly or visit our <a href="https://curiomarket.co/help">Help Center</a></p>
            <p>Thank you for supporting independent sellers on Curio Market</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('[EMAIL SERVICE] 📨 Calling sendEmail method...');
    const result = await this.sendEmail({
      to: data.customerEmail,
      from: this.fromEmail,
      subject,
      text,
      html
    });
    
    console.log('[EMAIL SERVICE] 📧 sendOrderConfirmation result:', result);
    return result;
  }

  async sendShippingNotification(data: OrderEmailData): Promise<boolean> {
    const subject = `Your order has shipped - ${data.orderNumber}`;
    
    const trackingUrl = this.getTrackingUrl(data.carrier, data.trackingNumber);
    
    const html = `<html><body style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Your Order Has Shipped!</h1>
      <p>Dear ${data.customerName},</p>
      <p>Your order ${data.orderNumber} from ${data.shopName} has been shipped via ${data.carrier}.</p>
      <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      ${trackingUrl ? `<p><a href="${trackingUrl}">Track Your Package</a></p>` : ''}
      <p>Thank you for shopping with us!</p>
    </body></html>`;


    return this.sendEmail({
      to: data.customerEmail,
      from: this.fromEmail,
      subject,
      html
    });
  }

  async sendDeliveryConfirmation(data: OrderEmailData): Promise<boolean> {
    const subject = `Order delivered - ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'EB Garamond', 'Georgia', serif; color: hsl(0, 0%, 100%); background: hsl(212, 5%, 5%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: hsl(0, 0%, 11%); padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 1px solid hsl(0, 0%, 16%); }
          .header { text-align: center; border-bottom: 2px solid hsl(0, 77%, 26%); padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 600; color: hsl(0, 77%, 26%); margin-bottom: 10px; font-variant: small-caps; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); }
          .delivery-info { background: hsl(0, 0%, 16%); border: 1px solid hsl(0, 77%, 26%); padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .review-button { display: inline-block; background: hsl(0, 77%, 26%); color: hsl(0, 0%, 100%); padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid hsl(0, 0%, 20%); text-align: center; color: hsl(0, 0%, 80%); font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Curio Market</div>
            <h1 style="margin: 0; color: hsl(0, 0%, 100%);">✅ Order Delivered!</h1>
          </div>
          
          <p>Dear ${data.customerName},</p>
          
          <div class="delivery-info">
            <h3 style="margin-top: 0; color: hsl(0, 77%, 26%);">🎉 Your order has been delivered!</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Delivered on:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>We hope you love your new curiosities from ${data.shopName}! Your support means the world to independent sellers.</p>
          
          <div style="text-align: center;">
            <a href="https://curiomarket.co/orders/${data.orderId}/review" class="review-button">Leave a Review</a>
          </div>
          
          <p>Sharing your experience helps other collectors discover amazing items and supports the seller community.</p>
          
          <div class="footer">
            <p>Need help with your order? Visit our <a href="https://curiomarket.co/help">Help Center</a></p>
            <p>Thank you for choosing Curio Market</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.customerEmail,
      from: this.fromEmail,
      subject,
      html
    });
  }

  async sendSellerOrderNotification(data: OrderEmailData): Promise<boolean> {
    const subject = `New Order Received - ${data.orderNumber}`;
    
    // Create text version
    const text = `New Order Received - ${data.orderNumber}

Dear ${data.shopName},

Congratulations! You've received a new order from ${data.customerName}. Please prepare the items for shipping as soon as possible.

Order Details:
Order Number: ${data.orderNumber}
Order Date: ${new Date().toLocaleDateString()}
Customer: ${data.customerName}

Items Sold:
${data.orderItems.map(item => `- ${item.title} (Qty: ${item.quantity}) - $${item.price}`).join('\n')}

Your Earnings: $${(parseFloat(data.orderTotal) * 0.974).toFixed(2)} (after 2.6% platform fee)

${data.shippingAddress ? `
Shipping Address:
${data.shippingAddress.name}
${data.shippingAddress.line1}
${data.shippingAddress.line2 ? data.shippingAddress.line2 + '\n' : ''}${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}
${data.shippingAddress.country}
` : ''}

Please log into your seller dashboard to add tracking information once the order ships: https://curiosities.market/seller/orders

Questions? Visit our Seller Help Center: https://curiosities.market/help

Thank you for being part of the Curio Market community!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'EB Garamond', 'Georgia', serif; color: hsl(0, 0%, 95%); background: hsl(212, 5%, 5%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: hsl(0, 0%, 11%); padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 1px solid hsl(0, 0%, 16%); }
          .header { text-align: center; border-bottom: 2px solid hsl(0, 77%, 26%); padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 600; color: hsl(0, 77%, 26%); margin-bottom: 10px; font-variant: small-caps; letter-spacing: 0.05em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); }
          .order-details { background: hsl(0, 0%, 85%); color: hsl(0, 0%, 15%); padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid hsl(0, 0%, 70%); }
          .order-details h3 { color: hsl(0, 77%, 26%); margin-top: 0; }
          .order-details p { color: hsl(0, 0%, 20%); }
          .order-details strong { color: hsl(0, 0%, 10%); }
          .items { margin: 20px 0; }
          .item { border-bottom: 1px solid hsl(0, 0%, 40%); padding: 10px 0; display: flex; justify-content: space-between; color: hsl(0, 0%, 95%); }
          .total { font-weight: bold; font-size: 18px; color: hsl(0, 77%, 26%); text-align: right; margin-top: 15px; border-top: 2px solid hsl(0, 77%, 26%); padding-top: 15px; }
          .action-button { display: inline-block; background: hsl(0, 77%, 26%); color: hsl(0, 0%, 100%); padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid hsl(0, 0%, 20%); text-align: center; color: hsl(0, 0%, 80%); font-size: 14px; }
          .footer a { color: hsl(0, 77%, 26%); text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Curio Market</div>
            <h1 style="margin: 0; color: hsl(0, 0%, 100%);">💰 New Order Received!</h1>
          </div>
          
          <p>Dear ${data.shopName},</p>
          
          <p>Congratulations! You've received a new order from ${data.customerName}. Please prepare the items for shipping as soon as possible.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
          </div>
          
          <div class="items">
            <h3>Items Sold</h3>
            ${data.orderItems.map(item => `
              <div class="item">
                <div>${item.title} (Qty: ${item.quantity})</div>
                <div>$${item.price}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            Your Earnings: $${(parseFloat(data.orderTotal) * 0.974).toFixed(2)} (after 2.6% platform fee)
          </div>
          
          ${data.shippingAddress ? `
          <div class="order-details">
            <h3 style="margin-top: 0;">Shipping Address</h3>
            <p>${data.shippingAddress.name}<br>
            ${data.shippingAddress.line1}<br>
            ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}<br>
            ${data.shippingAddress.country}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="https://curiosities.market/seller/orders" class="action-button">Manage Orders</a>
          </div>
          
          <p>Please log into your seller dashboard to add tracking information once the order ships. This will automatically notify the customer.</p>
          
          <div class="footer">
            <p>Questions? Visit our <a href="https://curiosities.market/help">Seller Help Center</a></p>
            <p>Thank you for being part of the Curio Market community</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.sellerEmail,
      from: this.fromEmail,
      subject,
      text,
      html
    });
  }

  private getTrackingUrl(carrier?: string, trackingNumber?: string): string | null {
    if (!carrier || !trackingNumber) return null;
    
    const urls: { [key: string]: string } = {
      'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    };
    
    return urls[carrier] || null;
  }
}

export const emailService = new EmailService();