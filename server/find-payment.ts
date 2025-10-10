import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

async function findPayment() {
  try {
    console.log('🔍 Searching for recent Stripe payments...\n');
    
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 20,
    });
    
    paymentIntents.data.forEach(pi => {
      const amount = pi.amount / 100;
      console.log(`---`);
      console.log(`ID: ${pi.id}`);
      console.log(`Amount: $${amount}`);
      console.log(`Status: ${pi.status}`);
      console.log(`Created: ${new Date(pi.created * 1000).toLocaleString()}`);
      console.log(`Email: ${pi.receipt_email || 'N/A'}`);
      if (pi.metadata && Object.keys(pi.metadata).length > 0) {
        console.log(`Metadata:`, JSON.stringify(pi.metadata, null, 2));
      }
      
      if (Math.abs(amount - 43.83) < 0.01) {
        console.log(`\n🎯 MATCH: This is likely the stuck payment!`);
      }
      console.log('');
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

findPayment();
