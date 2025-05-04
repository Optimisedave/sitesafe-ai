import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import Stripe from 'stripe'; // Import Stripe

// --- Inlined authOptions from src/lib/auth.ts (already done in [...nextauth]/route.ts, need getServerSession) ---
// We still need authOptions for getServerSession, but cannot import it due to build issues.
// Assuming getServerSession can work with options defined elsewhere or using default discovery.
// If not, authOptions might need to be inlined here too, or a different auth check mechanism used.
// For now, keep the import and see if build passes, otherwise inline authOptions here as well.
// Reverting to path alias temporarily to see if inlining *other* libs fixes it.
import { authOptions } from "@/lib/auth"; 

// --- Inlined prisma.ts logic --- 
declare global {
  // eslint-disable-next-line no-var
  var prisma_inline_stripe_create: PrismaClient | undefined;
}
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma_inline_stripe_create) {
    global.prisma_inline_stripe_create = new PrismaClient();
  }
  prisma = global.prisma_inline_stripe_create;
}
// --- End Inlined prisma.ts logic ---

// --- Inlined stripe.ts logic --- 
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // Use the latest API version
  typescript: true,
});
// --- End Inlined stripe.ts logic ---

export async function POST(req: NextRequest) {
  // Use the potentially problematic authOptions import for now
  const session = await getServerSession(authOptions); 

  if (!session?.user?.id || !session?.user?.email) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  try {
    const { priceId, plan } = await req.json();

    if (!priceId || !plan) {
      return new NextResponse(JSON.stringify({ error: 'Missing priceId or plan' }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: userEmail });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const existingSubscription = await prisma.subscription.findFirst({
        where: {
            userId: userId,
            status: { in: ['ACTIVE', 'TRIALING'] }
        }
    });

    if (existingSubscription) {
        console.log(`User ${userId} already has an active/trialing subscription.`);
        return new NextResponse(JSON.stringify({ error: 'User already subscribed' }), { status: 400 });
    }

    const YOUR_DOMAIN = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: { 
            userId: userId
        }
      },
      success_url: `${YOUR_DOMAIN}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/pricing`,
      metadata: { 
        userId: userId
      }
    });

    if (!checkoutSession.url) {
        return new NextResponse(JSON.stringify({ error: 'Could not create Stripe Checkout session' }), { status: 500 });
    }

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });

  } catch (error) {
    console.error('Stripe Checkout Session Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: (error instanceof Error) ? error.message : String(error) }), { status: 500 });
  }
}

