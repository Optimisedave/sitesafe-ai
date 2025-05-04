import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { PrismaClient, SubscriptionStatus } from '@prisma/client'; // Import PrismaClient and enum

// --- Inlined prisma.ts logic --- 
declare global {
  // eslint-disable-next-line no-var
  var prisma_inline_stripe_webhook: PrismaClient | undefined;
}
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma_inline_stripe_webhook) {
    global.prisma_inline_stripe_webhook = new PrismaClient();
  }
  prisma = global.prisma_inline_stripe_webhook;
}
// --- End Inlined prisma.ts logic ---

// --- Inlined stripe.ts logic --- 
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10' as any, // Use the latest API version
  typescript: true,
});
// --- End Inlined stripe.ts logic ---

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.created',
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Webhook Error: Missing Stripe signature or secret');
    return new NextResponse('Webhook Error: Missing Stripe signature or secret', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const errorMessage = (err instanceof Error) ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === 'subscription' && session.subscription && session.metadata?.userId) {
            const subscriptionId = session.subscription as string;
            const userId = session.metadata.userId;
            // Retrieve the subscription object
            const subscriptionObject = await stripe.subscriptions.retrieve(subscriptionId);

            await prisma.subscription.create({
              data: {
                userId: userId,
                stripeSubscriptionId: subscriptionObject.id,
                stripePriceId: subscriptionObject.items.data[0]?.price.id || '',
                status: subscriptionObject.status.toUpperCase() as SubscriptionStatus,
                // Apply 'as any' cast here
                currentPeriodEnd: new Date((subscriptionObject as any).current_period_end * 1000),
              },
            });
            console.log(`Subscription created for user ${userId}`);
          } else {
            console.warn(`Webhook received checkout.session.completed but session mode is not subscription or subscription/userId missing. Session ID: ${session.id}`);
          }
          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          const existingSubscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (existingSubscription) {
            await prisma.subscription.update({
              where: { stripeSubscriptionId: subscription.id },
              data: {
                status: subscription.status.toUpperCase() as SubscriptionStatus,
                // Apply 'as any' cast here
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                stripePriceId: subscription.items.data[0]?.price.id || '',
              },
            });
            console.log(`Subscription ${subscription.id} updated for user ${existingSubscription.userId}`);
          } else {
            const customerId = subscription.customer as string;
            const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
            if (user) {
                 await prisma.subscription.create({
                    data: {
                        userId: user.id,
                        stripeSubscriptionId: subscription.id,
                        stripePriceId: subscription.items.data[0]?.price.id || '',
                        status: subscription.status.toUpperCase() as SubscriptionStatus,
                        // Apply 'as any' cast here
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    },
                });
                console.log(`Subscription ${subscription.id} created via ${event.type} webhook for user ${user.id}`);
            } else {
                 console.warn(`Webhook received ${event.type} for subscription ${subscription.id}, but no matching user found for customer ${customerId}`);
            }
          }
          break;
        }
        default:
          console.warn(`Unhandled relevant event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handler error:', error);
      return new NextResponse('Webhook handler error', { status: 500 });
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}

