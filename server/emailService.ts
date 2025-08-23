import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

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
  private readonly fromEmail = 'orders@curiomarket.co';

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      await mailService.send({
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const subject = `Order Confirmation - ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; color: #1a1a1a; background: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
          .order-details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .items { margin: 20px 0; }
          .item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; display: flex; justify-content: space-between; }
          .total { font-weight: bold; font-size: 18px; color: #dc2626; text-align: right; margin-top: 15px; border-top: 2px solid #dc2626; padding-top: 15px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Curio Market</div>
            <h1 style="margin: 0; color: #1a1a1a;">Order Confirmation</h1>
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

    return this.sendEmail({
      to: data.customerEmail,
      from: this.fromEmail,
      subject,
      html
    });
  }

  async sendShippingNotification(data: OrderEmailData): Promise<boolean> {
    const subject = `Your order has shipped - ${data.orderNumber}`;
    
    const trackingUrl = this.getTrackingUrl(data.carrier, data.trackingNumber);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; color: #1a1a1a; background: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
          .shipping-info { background: #f0fdf4; border: 1px solid #16a34a; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .tracking-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Curio Market</div>
            <h1 style="margin: 0; color: #1a1a1a;">📦 Your Order Has Shipped!</h1>
          </div>
          
          <p>Dear ${data.customerName},</p>
          
          <p>Great news! Your order from ${data.shopName} is on its way.</p>
          
          <div class="shipping-info">
            <h3 style="margin-top: 0; color: #16a34a;">Shipping Information</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Carrier:</strong> ${data.carrier}</p>
            <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            <p><strong>Estimated Delivery:</strong> 3-7 business days</p>
          </div>
          
          ${trackingUrl ? `
          <div style="text-align: center;">
            <a href="${trackingUrl}" class="tracking-button">Track Your Package</a>
          </div>
          ` : ''}
          
          <p>You can also track your package directly on the ${data.carrier} website using tracking number: <strong>${data.trackingNumber}</strong></p>
          
          <div class="footer">
            <p>Questions about your shipment? Contact ${data.shopName} directly</p>
            <p>Thank you for shopping with Curio Market</p>
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

  async sendDeliveryConfirmation(data: OrderEmailData): Promise<boolean> {
    const subject = `Order delivered - ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; color: #1a1a1a; background: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
          .delivery-info { background: #f0fdf4; border: 1px solid #16a34a; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .review-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Curio Market</div>
            <h1 style="margin: 0; color: #1a1a1a;">✅ Order Delivered!</h1>
          </div>
          
          <p>Dear ${data.customerName},</p>
          
          <div class="delivery-info">
            <h3 style="margin-top: 0; color: #16a34a;">🎉 Your order has been delivered!</h3>
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